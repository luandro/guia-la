# 06. Maps

- **Decision register:** D-05
- **Status:** approved — by the owner on 2026-11-21 for the pilot: OSM-derived tiles; the hosted-vs-PMTiles question below is revisited later. Follow the OSM tile usage policy and attribution rules
- **Date:** 2026-11-21
- **Deciders:** owner
- **Phase gate:** 08
- **Reversal cost:** not stated in the register; the tile source is revisited later by design
- **Related:** [decision register](../../planning/decisions.md); D-10 (offline v1)

## Context

Native and web both need maps, behind one contract. The pilot uses tiles from an OSM-derived source.

## Options considered

| Option | Pros | Cons | Evidence needed |
|---|---|---|---|
| Hosted tiles (open) | No tile hosting work | Free tier limits; attribution duty | Tile cost estimate for pilot traffic |
| PMTiles on R2 (open) | One-time extract; cheap; offline-friendly | Extract step to maintain | S6 (New Arch + offline pack) |

## Decision

`@maplibre/maplibre-react-native` (native) and `maplibre-gl` (web), both behind the `@guia-la/map` contract. Tiles come from an OSM-derived source for the pilot. The hosted-vs-PMTiles question is revisited later. Follow the OSM tile usage policy and attribution rules: production and offline packs must not use `tile.openstreetmap.org` directly — the OSMF tile usage policy forbids heavy app use and bulk offline download. Use an OSM-based tile provider under its terms or a PMTiles extract, with ODbL attribution.

**Fallback:** static map image plus an "open in Google/Apple Maps" deep link.

## Evidence

Source: [decision register, D-05](../../planning/decisions.md). Evidence needed: S6 (New Arch + offline pack) and a tile cost estimate for pilot traffic.

## Consequences

One map contract to keep honest across two runtimes. `@maplibre/maplibre-react-native` needs a development build — it does not run in Expo Go. Offline packs inherit the tile source's terms: the OSMF bulk-download rule is why `tile.openstreetmap.org` is off-limits for them.
