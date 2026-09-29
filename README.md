# Open Community Hub Specification (OCHS)

[![NPM Version](https://img.shields.io/npm/v/@agentngo/open-community-hub-spec.svg)](https://www.npmjs.com/package/@agentngo/open-community-hub-spec)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![JSON Schema](https://img.shields.io/badge/Schema-Draft%202020--12-green.svg)](schema/v1/community-hub.schema.json)

> **A global open data standard for physical civic sharing hubs, safe exchange zones, and mutual aid deposit centers.**

The **Open Community Hub Specification (OCHS)** defines a standardized, vendor-neutral schema for publishing, discovering, and verifying physical locations where community members exchange physical resources, borrow equipment, return library books, or drop off mutual-aid surplus.

Originally formalized from the [ANG](https://github.com/agentngo/ang) decentralized civic network in Reykjavík, Iceland, OCHS decouples physical civic exchange infrastructure from any single application, enabling municipalities, libraries, neighborhood groups, and circular-economy platforms to interoperate seamlessly.

---

## 🎯 The Mission

Physical resource circulation faces a recurring bottleneck: **coordination and safety at physical meeting points**. While digital peer-to-peer sharing platforms abound, people need reliable, well-lit, accessible, and verified physical spaces to conduct exchanges without sharing private home addresses.

OCHS establishes a universal format for these venues by cataloging:
- **Spatial Coordinates**: GeoJSON Point (RFC 7946) standard.
- **Civic Attributes**: Public staffing, lighting quality score (1–5), indoor shelter, and step-free accessibility.
- **Physical Capacity**: Holding shelves, secure lockers, maximum dimensions/weight, and food refrigeration.
- **Verification Integrity**: Municipal endorsements and cryptographic attestation hashes.
- **OpenStreetMap (OSM) Integration**: Bidirectional alignment with the world's civic geographic database.

---

## 📦 Installation

```bash
npm install @agentngo/open-community-hub-spec
```

---

## 🚀 Quickstart

### Validating a Community Hub in TypeScript

```typescript
import { validateHub, CommunityHub } from '@agentngo/open-community-hub-spec';

const myHubData = {
  id: "urn:ochs:hub:is:reykjavik:grofin",
  name: "Borgarbókasafnið Grófin",
  venueType: "library",
  location: {
    type: "Point",
    coordinates: [-21.9408, 64.1488], // [longitude, latitude]
    address: "Tryggvagata 15",
    municipality: "Reykjavík",
    countryCode: "IS"
  },
  operatingHours: {
    display: "Mon-Thu 10:00 - 19:00, Fri 11:00 - 18:00, Sat-Sun 13:00 - 17:00"
  },
  physicalExchangeCapacity: {
    storageTier: "designated_shelf",
    acceptsPerishables: false,
    maxWeightKg: 15.0
  },
  verificationProtocol: {
    tier: "cryptographically_anchored",
    lightingScore: 5,
    isStaffed: true,
    verificationHash: "0x3c7e84920b8e1f57a916327e5b9f02c6d8312e7a4b09f18e9502847c5d901a2f"
  }
};

const result = validateHub(myHubData);

if (result.valid) {
  console.log("Valid OCHS hub:", result.hub.name);
} else {
  console.error("Validation failed:", result.errors);
}
```

---

## 🗺️ OpenStreetMap (OSM) Tagging Alignment

OCHS is designed to harmonize with OpenStreetMap tagging conventions. When mapping community sharing spots in OSM:

| OCHS Attribute | OSM Key / Tag Recommendation | Notes |
| :--- | :--- | :--- |
| `venueType: "library"` | `amenity=library` | Municipal or community library |
| `venueType: "civic_center"` | `amenity=townhall` or `office=government` | City hall or civic center |
| `venueType: "community_hall"` | `amenity=community_centre` | Neighborhood community space |
| `venueType: "tool_library"` | `amenity=give_box` + `borrow=tools` | Dedicated tool lending venue |
| `storageTier: "designated_shelf"` | `amenity=give_box` + `give_box:type=shelf` | Indoor sharing shelf |
| `operatingHours.osmOpeningHours` | `opening_hours=*` | Standard OSM opening_hours syntax |
| `accessibility.wheelchairAccessible` | `wheelchair=yes / limited / no` | Physical wheelchair access |
| `accessibility.isIndoor` | `indoor=yes` | Sheltered indoor facility |
| `accessibility.publicRestroom` | `toilets=yes` + `toilets:wheelchair=yes` | Public restroom available |
| `id` | `ref:ochs=*` | Cross-reference tag storing the OCHS URN |

---

## 🏛️ Flagship Reference Implementation: Borgarbókasafnið Grófin

The canonical reference implementation is available in [`examples/reykjavik-grofin.json`](examples/reykjavik-grofin.json). It defines the main branch of the Reykjavík City Library at Tryggvagata 15:

```json
{
  "$schema": "../schema/v1/community-hub.schema.json",
  "id": "urn:ochs:hub:is:reykjavik:grofin",
  "name": "Borgarbókasafnið Grófin (Reykjavík City Library)",
  "venueType": "library",
  "location": {
    "type": "Point",
    "coordinates": [-21.9408, 64.1488],
    "address": "Tryggvagata 15",
    "neighborhood": "Downtown / Kvosin",
    "municipality": "Reykjavík",
    "countryCode": "IS"
  },
  "physicalExchangeCapacity": {
    "storageTier": "designated_shelf",
    "maxHoldDurationHours": 72,
    "acceptsPerishables": false
  },
  "verificationProtocol": {
    "tier": "cryptographically_anchored",
    "lightingScore": 5,
    "isStaffed": true,
    "verificationHash": "0x3c7e84920b8e1f57a916327e5b9f02c6d8312e7a4b09f18e9502847c5d901a2f"
  }
}
```

---

## 📋 Schema Specification

The full specification document is located at [`spec/SPECIFICATION.md`](spec/SPECIFICATION.md).  
The formal JSON Schema is located at [`schema/v1/community-hub.schema.json`](schema/v1/community-hub.schema.json).

### Validating via JSON Schema CLI (AJV)

```bash
npx ajv-cli validate -s schema/v1/community-hub.schema.json -d examples/reykjavik-grofin.json
```

---

## 🤝 Contributing & Submitting Hubs

We welcome contributions from municipal open-data teams, library systems, mutual-aid networks, and developers!
1. Fork the repository.
2. Add your local community hub to `examples/`.
3. Run `npm test` to ensure your example validates.
4. Submit a Pull Request.

---

## 📄 License

- Code and TypeScript library: [MIT License](LICENSE)
- Specification text and documentation: [CC-BY-4.0 International](https://creativecommons.org/licenses/by/4.0/)
