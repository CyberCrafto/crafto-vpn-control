export type Page = "dashboard" | "terminal";

export type Protocol = "WireGuard" | "Lightway UDP" | "OpenVPN UDP" | "OpenVPN TCP";

export type RegionId = "de" | "us" | "uk" | "fr" | "nl" | "jp" | "tr" | "ca";

export interface Region {
  id: RegionId;
  country: string;
  city: string;
  shortCode: string;
  ip: string;
  server: string;
  ping: number;
  load: number;
  status: "online";
}

export interface VpnSettings {
  protocol: Protocol;
  networkLock: boolean;
  autoConnect: boolean;
  splitTunneling: boolean;
}

export interface VpnState extends VpnSettings {
  connected: boolean;
  locationId: RegionId;
  connectedAt: number | null;
  dataMB: number;
  speed: { down: number; up: number; ping: number };
  downHistory: number[];
  upHistory: number[];
}

export type VpnPatch = Partial<VpnState>;

export interface BaseMsg {
  id: string;
  at: number;
}

export interface UserMsg extends BaseMsg {
  kind: "user";
  text: string;
}

export interface AgentMsg extends BaseMsg {
  kind: "agent";
  text: string;
  streaming?: boolean;
}

export interface SystemMsg extends BaseMsg {
  kind: "system";
  text: string;
  tone?: "info" | "success" | "warning";
  source?: "dashboard" | "agent" | "system";
}

export interface ToolMsg extends BaseMsg {
  kind: "tool";
  callId: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "running" | "success";
  durationMs?: number;
  startedAt?: number;
}

export type TerminalMessage = UserMsg | AgentMsg | SystemMsg | ToolMsg;

export const PROTOCOLS: Protocol[] = [
  "WireGuard",
  "Lightway UDP",
  "OpenVPN UDP",
  "OpenVPN TCP",
];
