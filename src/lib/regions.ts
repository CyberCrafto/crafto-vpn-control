import type { Region, RegionId } from "./types";

export const REGIONS: Region[] = [
  {
    id: "de",
    country: "Germany",
    city: "Frankfurt",
    shortCode: "DE",
    ip: "203.0.113.42",
    server: "de-fra-02.edge.crafto.net",
    ping: 18,
    load: 41,
    status: "online",
  },
  {
    id: "us",
    country: "United States",
    city: "New York",
    shortCode: "US",
    ip: "198.51.100.24",
    server: "us-nyc-04.edge.crafto.net",
    ping: 24,
    load: 36,
    status: "online",
  },
  {
    id: "uk",
    country: "United Kingdom",
    city: "London",
    shortCode: "UK",
    ip: "203.0.113.87",
    server: "uk-lon-03.edge.crafto.net",
    ping: 31,
    load: 44,
    status: "online",
  },
  {
    id: "fr",
    country: "France",
    city: "Paris",
    shortCode: "FR",
    ip: "198.51.100.61",
    server: "fr-par-01.edge.crafto.net",
    ping: 35,
    load: 29,
    status: "online",
  },
  {
    id: "nl",
    country: "Netherlands",
    city: "Amsterdam",
    shortCode: "NL",
    ip: "203.0.113.19",
    server: "nl-ams-02.edge.crafto.net",
    ping: 27,
    load: 22,
    status: "online",
  },
  {
    id: "jp",
    country: "Japan",
    city: "Tokyo",
    shortCode: "JP",
    ip: "198.51.100.132",
    server: "jp-tyo-02.edge.crafto.net",
    ping: 148,
    load: 57,
    status: "online",
  },
  {
    id: "tr",
    country: "Turkey",
    city: "Istanbul",
    shortCode: "TR",
    ip: "203.0.113.204",
    server: "tr-ist-01.edge.crafto.net",
    ping: 61,
    load: 33,
    status: "online",
  },
  {
    id: "ca",
    country: "Canada",
    city: "Toronto",
    shortCode: "CA",
    ip: "198.51.100.77",
    server: "ca-yyz-01.edge.crafto.net",
    ping: 82,
    load: 19,
    status: "online",
  },
];

export const REGION_MAP: Record<RegionId, Region> = REGIONS.reduce(
  (acc, region) => {
    acc[region.id] = region;
    return acc;
  },
  {} as Record<RegionId, Region>,
);

export function getRegion(id: RegionId): Region {
  return REGION_MAP[id] ?? REGIONS[0];
}

const ALIASES: Record<string, RegionId> = {
  germany: "de",
  german: "de",
  deutschland: "de",
  frankfurt: "de",
  de: "de",
  usa: "us",
  us: "us",
  "united states": "us",
  "united states of america": "us",
  america: "us",
  "new york": "us",
  nyc: "us",
  uk: "uk",
  "united kingdom": "uk",
  britain: "uk",
  "great britain": "uk",
  england: "uk",
  london: "uk",
  gb: "uk",
  france: "fr",
  french: "fr",
  paris: "fr",
  fr: "fr",
  netherlands: "nl",
  holland: "nl",
  amsterdam: "nl",
  nl: "nl",
  japan: "jp",
  japanese: "jp",
  tokyo: "jp",
  jp: "jp",
  turkey: "tr",
  turkiye: "tr",
  türkiye: "tr",
  istanbul: "tr",
  tr: "tr",
  canada: "ca",
  canadian: "ca",
  toronto: "ca",
  ca: "ca",
};

/** Resolve a free-text country / city / alias into a region. */
export function findRegion(input: string): Region | null {
  const raw = input
    .toLowerCase()
    .replace(/[.!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cleaned = raw
    .replace(/^(the|a|an)\s+/, "")
    .replace(/\s+(server|servers|region|regions|location|locations|vpn)$/g, "")
    .trim();

  if (ALIASES[cleaned]) return REGION_MAP[ALIASES[cleaned]];

  const match = REGIONS.find(
    (r) =>
      cleaned.includes(r.country.toLowerCase()) ||
      cleaned.includes(r.city.toLowerCase()) ||
      cleaned === r.shortCode.toLowerCase(),
  );
  if (match) return match;

  const first = cleaned.split(" ")[0];
  return ALIASES[first] ? REGION_MAP[ALIASES[first]] : null;
}

export function regionSummary(region: Region) {
  return {
    country: region.country,
    city: region.city,
    server: region.server,
    vpn_ip: region.ip,
    latency_ms: region.ping,
    load_percent: region.load,
    status: region.status,
  };
}
