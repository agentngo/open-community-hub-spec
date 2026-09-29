# Open Community Hub Specification (OCHS)
**Specification Version:** 1.0.0  
**Status:** Working Draft / Living Standard  
**Published:** 2026-03-29  
**Repository:** [github.com/agentngo/open-community-hub-spec](https://github.com/agentngo/open-community-hub-spec)  
**License:** [MIT License](https://opensource.org/licenses/MIT) / [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

---

## 1. Executive Summary & Purpose

The **Open Community Hub Specification (OCHS)** defines a standardized, open-data specification for physical civic sharing hubs, safe exchange zones, and mutual aid deposit centers.

As peer-to-peer circular economies, public libraries of things, tool-sharing cooperatives, and municipal mutual aid platforms proliferate, a critical friction remains: **the lack of standardized, interoperable physical handover locations**. Neighbor-to-neighbor sharing often requires meeting in public or semi-public spaces. Without reliable data on physical accessibility, staffing, indoor shelter, ambient lighting, opening hours, and parcel capacity, users face coordination failures and safety concerns.

OCHS provides a canonical, machine-readable data schema that enables:
1. **Civic & Mutual Aid Applications**: Seamless discovery, distance ranking, and selection of safe exchange zones.
2. **Municipalities & Libraries**: Publishing and managing municipal sharing shelves, tool libraries, and safe corners using open data.
3. **OpenStreetMap (OSM) Interoperability**: Direct mapping between OCHS records and OpenStreetMap nodes/ways.
4. **Verifiable Trust & Safety**: Cryptographically anchored attestation hashes and crowd-reported spot health metrics.

---

## 2. Terminology & Definitions

- **Community Hub / Safe Zone**: A clearly identified, publicly or civically accessible physical location designated for neighbor-to-neighbor resource sharing, physical item handovers, or temporary shelf deposits.
- **Physical Exchange Capacity**: The operational constraints of a hub, including whether it supports unattended shelf/locker holding, maximum item dimensions/weight, and whether perishable food is permitted.
- **GeoJSON Point**: A geographical location representation adhering to [RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946), utilizing `[longitude, latitude]` coordinate ordering in the WGS 84 datum.
- **Storage Tier**: The infrastructure available at the hub (`direct_handover_only`, `designated_shelf`, `secure_locker`, `dedicated_room`, or `community_depot`).
- **Verification Protocol**: The audit trail confirming the safety, public access, and operating reality of a hub, ranging from community attestations to municipal endorsements and cryptographic ledger anchors.

---

## 3. Data Model & Field Dictionary

An OCHS document is represented as a JSON object adhering to `schema/v1/community-hub.schema.json`.

### 3.1 Primary Identification

| Field | Type | Required | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier (URN or UUIDv4) | `"urn:ochs:hub:is:reykjavik:grofin"` |
| `name` | `string` | **Yes** | Primary venue name | `"Borgarbókasafnið Grófin"` |
| `alternateNames` | `string[]` | No | Translated or colloquial names | `["Reykjavík City Library — Main Branch"]` |
| `description` | `string` | No | Detailed public description | `"Main public library cafe lobby..."` |
| `venueType` | `VenueType` | **Yes** | Classified venue category | `"library"`, `"civic_center"`, `"public_cafe"` |

#### Allowed `venueType` Values:
- `library`: Public municipal or institutional libraries.
- `civic_center`: City halls, municipal customer service centers, citizen atriums.
- `community_hall`: Neighborhood community centers and social halls.
- `public_cafe`: Commercial cafes hosting an official civic exchange shelf.
- `community_space`: Cooperative spaces, grassroots mutual aid hubs.
- `tool_library`: Dedicated tool-lending and equipment libraries.
- `makerspace`: Public fabrication and repair cafes.
- `educational_facility`: Universities, public colleges, adult education centers.
- `neighborhood_pantry`: Dedicated food pantry or dry goods sharing locker.
- `cultural_center`: Museums, art halls, civic exhibition spaces.

---

### 3.2 Geographical Location (`location`)

The `location` object is fully compatible with GeoJSON Point (RFC 7946).

```json
{
  "type": "Point",
  "coordinates": [-21.9408, 64.1488],
  "latitude": 64.1488,
  "longitude": -21.9408,
  "address": "Tryggvagata 15",
  "postalCode": "101",
  "neighborhood": "Downtown / Kvosin",
  "district": "Vesturbær / Miðborg",
  "municipality": "Reykjavík",
  "countryCode": "IS"
}
```

> **CRITICAL GEOJSON RULE**:  
> In accordance with RFC 7946, `coordinates` MUST be specified as `[longitude, latitude]`, where:
> - Longitude: between `-180.0` and `+180.0` (East/West).
> - Latitude: between `-90.0` and `+90.0` (North/South).  
> The explicit fields `latitude` and `longitude` are provided as convenience accessors.

---

### 3.3 Operating Hours (`operatingHours`)

Operating hours combine human-readable strings with structured OpenStreetMap syntax:

| Property | Type | Description |
| :--- | :--- | :--- |
| `display` | `string` (Required) | Human-readable schedule (e.g., `"Mon-Thu 10:00 - 19:00, Fri 11:00 - 18:00"`) |
| `osmOpeningHours` | `string` | Valid OpenStreetMap opening_hours string |
| `timezone` | `string` | Canonical IANA Timezone (e.g., `"Atlantic/Reykjavik"`) |
| `is24_7` | `boolean` | Flag for continuous day-and-night availability |
| `weeklySchedule` | `ScheduleDay[]` | Structured array of day opening/closing times |

---

### 3.4 Physical Exchange Capacity (`physicalExchangeCapacity`)

Standardizes how items can be physically received, deposited, and collected:

| Field | Type | Allowed Values / Constraint |
| :--- | :--- | :--- |
| `storageTier` | `string` (Required) | `"direct_handover_only"`, `"designated_shelf"`, `"secure_locker"`, `"dedicated_room"`, `"community_depot"` |
| `maxItemDimensionsCm` | `object` | `{ "length": number, "width": number, "height": number }` |
| `maxWeightKg` | `number` | Maximum weight in kg (e.g., `15.0`) |
| `maxHoldDurationHours` | `integer` | Maximum unattended shelf hold duration (e.g., `72`) |
| `acceptsPerishables` | `boolean` (Required) | If true, verified for perishable food donations |
| `refrigerationAvailable` | `boolean` | If true, food-safe refrigerator is on site |

---

### 3.5 Verification Protocol (`verificationProtocol`)

Provides security, trust, and auditability for civic networks:

- **Tiers**:
  1. `unverified`: Newly proposed by community members, awaiting check.
  2. `community_attested`: Multiple verified local neighbors have successfully completed handovers.
  3. `partner_endorsed`: Formally agreed with venue owner or local commercial partner.
  4. `municipal_verified`: Officially verified and maintained by municipal authorities or library systems.
  5. `cryptographically_anchored`: Cryptographic hash anchored to an immutable ledger or state merkle root.
- **Lighting Score (1–5)**: Rating of night-time and ambient lighting for user safety.
- **Staffing (`isStaffed`)**: Whether public employees or monitors are present.
- **Verification Hash (`verificationHash`)**: 32-byte hexadecimal SHA-256 hash formatted as `^0x[0-9a-fA-F]{64}$`.

---

## 4. OpenStreetMap (OSM) Tagging Alignment

To foster two-way data interchange between OCHS hubs and OpenStreetMap, implementations SHOULD adhere to the following tagging guidelines:

| OCHS Venue Type | Recommended OSM Tags |
| :--- | :--- |
| `library` | `amenity=library` + `operator=*` + `wheelchair=*` |
| `civic_center` | `amenity=townhall` OR `office=government` + `public_service=*` |
| `community_hall` | `amenity=community_centre` + `community_centre=*` |
| `public_cafe` | `amenity=cafe` + `social_facility=community_space` |
| `tool_library` | `amenity=give_box` OR `craft=tool_library` + `borrow=tools` |
| `makerspace` | `leisure=hackerspace` + `amenity=workshop` |

**Key Supplementary Tags:**
- `opening_hours=*`: Evaluated directly against `operatingHours.osmOpeningHours`.
- `wheelchair=yes / limited / no`: Mapped to `accessibility.wheelchairAccessible`.
- `ref:ochs=*`: Recommended OSM tag on the node referencing the OCHS URN.

---

## 5. Reference Implementation & Canonical Example

See [examples/reykjavik-grofin.json](../examples/reykjavik-grofin.json) for the canonical municipal library implementation:
- **Location**: Tryggvagata 15, 101 Reykjavík (`[-21.9408, 64.1488]`).
- **Venue Type**: `library`
- **Storage Tier**: `designated_shelf`
- **Verification**: `cryptographically_anchored` (`0x3c7e84920b8e1f57a916327e5b9f02c6d8312e7a4b09f18e9502847c5d901a2f`)

---

## 6. Schema Governance & Versioning

OCHS adheres to [Semantic Versioning 2.0.0](https://semver.org/):
- **Major versions (`v1`, `v2`)**: Breaking schema changes or mandatory field removals.
- **Minor versions**: Non-breaking additions of new optional properties or enum entries.
- **Patch versions**: Clarifications to descriptions, regex adjustments, and documentation improvements.
