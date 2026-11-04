import type { Intent } from "./commands";
import { REGIONS, REGION_MAP, getRegion, regionSummary } from "./regions";
import { clamp, formatDataShort, formatDurationWords, randomBetween, sleep, uid } from "./format";
import type { Region, VpnPatch, VpnState } from "./types";

export type EngineStep =
  | { t: "agent"; text: string }
  | { t: "tool_start"; id: string; name: string; args: Record<string, unknown> }
  | { t: "tool_end"; id: string; result: unknown }
  | { t: "patch"; patch: VpnPatch };

const TOOL_DELAY = { fast: 520, normal: 760, slow: 1080 };

async function* say(text: string): AsyncGenerator<EngineStep> {
  yield { t: "agent", text };
  await sleep(260);
}

/** Emits a complete MCP tool call: start → execution latency → result. */
async function* callTool(
  name: string,
  args: Record<string, unknown>,
  result: unknown,
  latency: number = TOOL_DELAY.normal,
): AsyncGenerator<EngineStep> {
  const id = uid("call");
  yield { t: "tool_start", id, name, args };
  await sleep(latency);
  yield { t: "tool_end", id, result };
  await sleep(300);
}

function patch(p: VpnPatch): EngineStep {
  return { t: "patch", patch: p };
}

function locationLabel(region: Region) {
  return `${region.country} — ${region.city}`;
}

function uptime(state: VpnState) {
  return formatDurationWords(state.connectedAt, Date.now());
}

export async function* executeCommand(
  raw: string,
  intent: Intent,
  state: VpnState,
): AsyncGenerator<EngineStep> {
  const current = getRegion(state.locationId);

  switch (intent.type) {
    /* ------------------------------------------------------------------ */
    case "connect": {
      const region = intent.region ?? current;
      if (state.connected && region.id === state.locationId) {
        yield* say(`You're already connected to ${locationLabel(region)}. I'll verify the tunnel rather than restart it.`);
        yield* callTool("vpn_status", {}, {
          status: "connected",
          location: locationLabel(region),
          server: region.server,
          vpn_ip: region.ip,
          protocol: state.protocol,
          uptime: uptime(state),
          handshake_ms: 21,
        }, TOOL_DELAY.fast);
        yield* say(`The tunnel is healthy and passing traffic through ${region.ip}. Nothing was changed.`);
        return;
      }

      yield* say(
        intent.region
          ? `I'll establish a new tunnel through ${region.country} — ${region.city}.`
          : `I'll bring up the VPN tunnel using your selected region, ${region.city}.`,
      );

      if (intent.region) {
        yield* callTool("vpn_get_regions", { country: region.country, status: "online" }, {
          status: "success",
          count: 1,
          regions: [regionSummary(region)],
        }, TOOL_DELAY.fast);
      }

      const wasConnected = state.connected;
      const oldRegion = getRegion(state.locationId);
      yield* callTool(
        "vpn_connect",
        {
          country: region.country,
          city: region.city,
          protocol: state.protocol,
          network_lock: state.networkLock,
        },
        {
          status: "success",
          session_id: `ses_${Math.random().toString(36).slice(2, 9)}`,
          location: region.country,
          server: region.server,
          vpn_ip: region.ip,
          protocol: state.protocol,
          handshake_ms: region.ping + 4,
          previous_location: wasConnected ? locationLabel(oldRegion) : null,
        },
        TOOL_DELAY.slow,
      );

      yield patch({
        connected: true,
        locationId: region.id,
        connectedAt: Date.now(),
        dataMB: 0,
        speed: { down: randomBetween(240, 640), up: randomBetween(42, 96), ping: region.ping },
      });
      await sleep(240);

      yield* say(
        `Connected to ${region.country} — ${region.city}. Your traffic now exits through ${region.ip} with ${state.protocol}.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "change_location": {
      const region = intent.region;
      const wasConnected = state.connected;

      yield* say(`I'll switch your exit node to ${region.country} — ${region.city}.`);

      yield* callTool("vpn_get_regions", { country: region.country, status: "online" }, {
        status: "success",
        count: 1,
        regions: [regionSummary(region)],
      }, TOOL_DELAY.fast);

      yield* callTool(
        "vpn_change_location",
        { country: region.country, city: region.city },
        {
          status: "success",
          previous_location: wasConnected ? locationLabel(current) : null,
          location: region.country,
          city: region.city,
          server: region.server,
          vpn_ip: region.ip,
          latency_ms: region.ping,
        },
        TOOL_DELAY.slow,
      );

      yield patch({
        connected: true,
        locationId: region.id,
        connectedAt: Date.now(),
        dataMB: 0,
        speed: { down: randomBetween(240, 640), up: randomBetween(42, 96), ping: region.ping },
      });
      await sleep(240);

      yield* say(
        wasConnected
          ? `Successfully switched to ${region.country} — ${region.city}. The tunnel was re-established on ${region.ip} with ${region.ping} ms latency.`
          : `No tunnel was active, so I opened one to ${region.country} — ${region.city}. You're now protected on ${region.ip}.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "disconnect": {
      if (!state.connected) {
        yield* say(`Your VPN is already disconnected, so there's no active tunnel to close.`);
        yield* callTool("vpn_status", {}, {
          status: "disconnected",
          active_session: null,
          network_lock: state.networkLock ? "armed" : "off",
        }, TOOL_DELAY.fast);
        yield* say(`There's nothing to change. Let me know if you'd like me to connect to ${current.city}.`);
        return;
      }

      yield* say(`I'll close the active tunnel and release the session.`);

      yield* callTool("vpn_disconnect", { session_id: "current", reason: "user_request" }, {
        status: "success",
        disconnected_from: locationLabel(current),
        released_ip: current.ip,
        duration: uptime(state),
        data_transferred_mb: Math.round(state.dataMB),
      }, TOOL_DELAY.normal);

      yield patch({ connected: false, connectedAt: null });
      await sleep(240);

      yield* say(
        `Disconnected from ${current.country} — ${current.city}. Your connection is no longer protected; ${state.networkLock ? "Network Lock is armed and traffic is being held." : "your local network is now exposed."}`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "reconnect": {
      yield* say(`I'll cycle the tunnel and negotiate a fresh session with ${current.city}.`);

      yield* callTool("vpn_disconnect", { session_id: "current", reason: "reconnect" }, {
        status: "success",
        released_ip: current.ip,
        duration: uptime(state),
      }, TOOL_DELAY.fast);

      yield patch({ connected: false, connectedAt: null });
      await sleep(500);

      yield* callTool(
        "vpn_connect",
        {
          country: current.country,
          city: current.city,
          protocol: state.protocol,
          network_lock: state.networkLock,
        },
        {
          status: "success",
          session_id: `ses_${Math.random().toString(36).slice(2, 9)}`,
          location: current.country,
          server: current.server,
          vpn_ip: current.ip,
          protocol: state.protocol,
          handshake_ms: current.ping + 2,
          negotiation: "chacha20-poly1305",
        },
        TOOL_DELAY.slow,
      );

      yield patch({
        connected: true,
        connectedAt: Date.now(),
        dataMB: 0,
        speed: { down: randomBetween(240, 640), up: randomBetween(42, 96), ping: current.ping },
      });
      await sleep(240);

      yield* say(
        `Reconnected to ${locationLabel(current)}. A fresh session is live on ${current.ip} using ${state.protocol}.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "status": {
      yield* say(`Let me query the current tunnel state.`);
      yield* callTool("vpn_status", { include_session: true }, {
        status: state.connected ? "connected" : "disconnected",
        location: state.connected ? locationLabel(current) : null,
        server: state.connected ? current.server : null,
        vpn_ip: state.connected ? current.ip : null,
        protocol: state.protocol,
        uptime: state.connected ? uptime(state) : "00:00:00",
        network_lock: state.networkLock ? "armed" : "off",
        auto_connect: state.autoConnect,
        data_transferred: formatDataShort(state.dataMB),
      }, TOOL_DELAY.fast);

      if (!state.connected) {
        yield* say(
          `Your VPN is disconnected. Nothing is being routed, and no VPN IP is assigned. Should I reconnect you to ${current.city}?`,
        );
        return;
      }

      yield* say(
        `You're connected to ${state.connected ? locationLabel(current) : "—"} through ${current.server}. Current exit IP is ${current.ip} using ${state.protocol}, with ${current.ping} ms latency. ${state.networkLock ? "Network Lock is armed." : "Network Lock is currently off."}`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "list_locations": {
      yield* say(`I'll pull the live region catalogue from the VPN controller.`);
      yield* callTool("vpn_get_regions", { enabled_only: true }, {
        status: "success",
        count: REGIONS.length,
        regions: REGIONS.map(regionSummary),
      }, TOOL_DELAY.normal);

      yield* say(
        `Eight regions are online right now. The lowest latency is ${current.country} — ${current.city} at ${current.ping} ms, and the farthest is Japan — Tokyo at 148 ms. Tell me which region to connect to.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "ip": {
      yield* say(`I'll look up the exit address currently assigned to your tunnel.`);
      yield* callTool("vpn_get_ip", { interface: "crafto0" }, state.connected
        ? {
            status: "connected",
            vpn_ip: current.ip,
            location: locationLabel(current),
            server: current.server,
            reverse_dns: current.server,
            leased: true,
          }
        : {
            status: "disconnected",
            vpn_ip: null,
            location: null,
            leased: false,
            note: "No active tunnel interface",
          }, TOOL_DELAY.normal);

      yield* say(
        state.connected
          ? `Your VPN IP is ${current.ip}, leased from ${current.server} in ${current.country} — ${current.city}.`
          : `You don't have a VPN IP right now because the tunnel is disconnected. Connect to a region and I'll assign one.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "protocol": {
      const protocol = intent.protocol;
      if (protocol === state.protocol) {
        yield* say(`You're already using ${protocol}. I'll confirm the active settings.`);
        yield* callTool("vpn_get_settings", {}, {
          protocol,
          network_lock: state.networkLock,
          auto_connect: state.autoConnect,
          split_tunneling: state.splitTunneling,
        }, TOOL_DELAY.fast);
        yield* say(`${protocol} is active and applied to your tunnel. No changes were needed.`);
        return;
      }

      yield* say(`I'll switch the tunnel protocol to ${protocol}.`);

      yield* callTool("vpn_set_protocol", { protocol, apply: "live" }, {
        status: "success",
        previous_protocol: state.protocol,
        protocol,
        reconnect_required: false,
        cipher: protocol.includes("OpenVPN") ? "AES-256-GCM" : "ChaCha20-Poly1305",
      }, TOOL_DELAY.normal);

      yield patch({ protocol });
      await sleep(200);

      yield* say(
        state.connected
          ? `Protocol updated from ${state.protocol} to ${protocol}. Your session stayed up — the next key exchange will use ${protocol}.`
          : `Protocol updated to ${protocol}. It will be used the next time you connect.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "network_lock": {
      const enabled = intent.enabled;
      if (enabled === state.networkLock) {
        yield* say(`Network Lock is already ${enabled ? "enabled" : "disabled"}. Let me confirm the current configuration.`);
        yield* callTool("vpn_get_settings", {}, {
          network_lock: state.networkLock,
          kill_switch_state: enabled ? "armed" : "off",
        }, TOOL_DELAY.fast);
        yield* say(`Confirmed. Network Lock is ${enabled ? "enabled" : "disabled"}; no changes were applied.`);
        return;
      }

      yield* say(`${enabled ? "Arming" : "Disarming"} Network Lock on the ${state.connected ? "active" : "configured"} tunnel.`);
      yield* callTool("vpn_set_network_lock", { enabled }, {
        status: "success",
        network_lock: enabled,
        kill_switch_state: enabled ? "armed" : "off",
        applied_to: "all interfaces",
      }, TOOL_DELAY.fast);

      yield patch({ networkLock: enabled });
      await sleep(200);

      yield* say(
        enabled
          ? `Network Lock is now enabled. If the tunnel drops, internet traffic will be blocked instead of leaking.`
          : `Network Lock is now disabled. Traffic will fall back to your local network if the tunnel drops.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "auto_connect": {
      const enabled = intent.enabled;
      if (enabled === state.autoConnect) {
        yield* say(`Auto Connect is already ${enabled ? "enabled" : "disabled"}. Let me verify it.`);
        yield* callTool("vpn_get_settings", {}, { auto_connect: state.autoConnect }, TOOL_DELAY.fast);
        yield* say(`Confirmed. Auto Connect is ${enabled ? "enabled" : "disabled"}; nothing changed.`);
        return;
      }

      yield* callTool("vpn_set_auto_connect", { enabled, trigger: "startup" }, {
        status: "success",
        auto_connect: enabled,
        preferred_region: current.country,
      }, TOOL_DELAY.fast);
      yield patch({ autoConnect: enabled });
      await sleep(200);

      yield* say(
        enabled
          ? `Auto Connect is enabled. On the next launch, Crafto will connect to ${locationLabel(current)} automatically.`
          : `Auto Connect is disabled. Crafto will no longer create a tunnel at launch.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "speed_test": {
      if (!state.connected) {
        yield* say(`Your tunnel is disconnected, so I'll measure the plain network path as a baseline.`);
        const down = randomBetween(280, 620);
        const up = randomBetween(48, 110);
        yield* callTool("network_speed_test", { target: "auto", samples: 4 }, {
          status: "success",
          connection: "unprotected",
          download_mbps: down,
          upload_mbps: up,
          latency_ms: Math.round(randomBetween(12, 38, 0)),
          jitter_ms: randomBetween(1, 4),
          packet_loss_percent: randomBetween(0, 0.3, 2),
        }, 1600);
        yield patch({ speed: { down, up, ping: current.ping } });
        yield* say(
          `Baseline complete: ${down} Mbps down and ${up} Mbps up. Connect a VPN region whenever you want a protected measurement.`,
        );
        return;
      }

      yield* say(`Running a multi-stream throughput test through ${current.city}.`);
      const testDown = randomBetween(360, 690);
      const testUp = randomBetween(58, 118);
      const testPing = clamp(current.ping + Math.round(randomBetween(-3, 4, 0)), 8, 220);
      yield* callTool("vpn_speed_test", {
        server: current.server,
        samples: 5,
        streams: 8,
        profile: "multi-stream",
      }, {
        status: "success",
        server: current.server,
        download_mbps: testDown,
        upload_mbps: testUp,
        latency_ms: testPing,
        jitter_ms: randomBetween(0.4, 2.6),
        packet_loss_percent: randomBetween(0, 0.14, 2),
        route: `${current.shortCode.toLowerCase()} edge → backbone → ${current.ip}`,
      }, 1900);

      yield patch({ speed: { down: testDown, up: testUp, ping: testPing } });
      await sleep(200);
      yield* say(
        `Speed test complete: ${testDown} Mbps down, ${testUp} Mbps up, ${testPing} ms latency with minimal jitter. The tunnel to ${current.city} looks healthy.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "check": {
      yield* say(`Running diagnostics on the tunnel, DNS path and exit route.`);
      yield* callTool("vpn_diagnostics", { checks: ["tunnel", "dns", "ipv6", "handshake"] }, state.connected
        ? {
            status: "healthy",
            tunnel: "up",
            handshake_ms: current.ping + 6,
            latency_ms: current.ping,
            dns_leak: "protected",
            ipv6: "blocked",
            packet_loss_percent: randomBetween(0, 0.2, 2),
            exit_ip: current.ip,
          }
        : {
            status: "inactive",
            tunnel: "down",
            dns_leak: "not_applicable",
            ipv6: "not_applicable",
            exit_ip: null,
            note: "No tunnel is running",
          }, 1400);

      yield* say(
        state.connected
          ? `Diagnostics passed. The tunnel to ${current.city} is up, DNS is leak-protected, IPv6 is blocked and there is no packet loss.`
          : `There is no tunnel to check. Your connection is unprotected right now — I can connect you to ${current.city} if you'd like.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "stats": {
      yield* say(`Pulling session statistics from the VPN controller.`);
      yield* callTool("vpn_get_statistics", { period: "session" }, {
        status: "success",
        session: state.connected ? "active" : "none",
        location: locationLabel(current),
        duration: state.connected ? uptime(state) : "00:00:00",
        data_transferred: formatDataShort(state.dataMB),
        download_mbps: state.speed.down,
        upload_mbps: state.speed.up,
        latency_ms: state.connected ? state.speed.ping : null,
        protocol: state.protocol,
      }, TOOL_DELAY.fast);

      yield* say(
        state.connected
          ? `Session to ${current.city}: ${formatDataShort(state.dataMB)} transferred over ${uptime(state)}, averaging ${state.speed.down} Mbps down and ${state.speed.up} Mbps up at ${state.speed.ping} ms latency.`
          : `There's no active session, so only configuration values are available. Protocol is ${state.protocol} and Network Lock is ${state.networkLock ? "armed" : "off"}.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    case "help": {
      yield* say(
        `I can operate the Crafto tunnel over MCP. Here's what I can do:\n\n• Tunnel control — connect, disconnect, reconnect, status\n• Locations — change region, list the catalogue\n• Network — show the exit IP, run a speed test, diagnostics\n• Security — Network Lock, Auto Connect, protocol selection\n\nAsk in plain language, or use one of the suggested commands below.`,
      );
      return;
    }

    /* ------------------------------------------------------------------ */
    default: {
      yield* say(
        `I couldn't map “${raw.trim()}” to an available VPN tool, so I haven't changed anything.`,
      );
      await sleep(150);
      yield* say(
        `Try: “change location to Japan”, “enable network lock”, “show connection status” or “run speed test”.`,
      );
      return;
    }
  }
}

export function resolveRegion(regionId: string): Region {
  return REGION_MAP[regionId as keyof typeof REGION_MAP] ?? REGIONS[0];
}
