import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateHub } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('validateHub - validates reykjavik-grofin.json flagship reference example', () => {
  const examplePath = path.resolve(__dirname, '../examples/reykjavik-grofin.json');
  const raw = fs.readFileSync(examplePath, 'utf8');
  const data = JSON.parse(raw);

  const result = validateHub(data);
  assert.equal(result.valid, true, `Errors: ${JSON.stringify(result.errors)}`);
  assert.equal(result.errors.length, 0);
  assert.ok(result.hub);
  assert.equal(result.hub?.name, 'Borgarbókasafnið Grófin (Reykjavík City Library)');
  assert.equal(result.hub?.venueType, 'library');
  assert.equal(result.hub?.location.coordinates[0], -21.9408);
  assert.equal(result.hub?.location.coordinates[1], 64.1488);
  assert.equal(result.hub?.verificationProtocol.tier, 'cryptographically_anchored');
});

test('validateHub - validates reykjavik-radhus.json secondary civic center example', () => {
  const examplePath = path.resolve(__dirname, '../examples/reykjavik-radhus.json');
  const raw = fs.readFileSync(examplePath, 'utf8');
  const data = JSON.parse(raw);

  const result = validateHub(data);
  assert.equal(result.valid, true, `Errors: ${JSON.stringify(result.errors)}`);
  assert.equal(result.errors.length, 0);
  assert.equal(result.hub?.venueType, 'civic_center');
});

test('validateHub - rejects missing required top-level fields', () => {
  const badData = {
    id: 'test-hub',
    // missing name, venueType, location, etc.
  };

  const result = validateHub(badData);
  assert.equal(result.valid, false);
  const errorPaths = result.errors.map(e => e.path);
  assert.ok(errorPaths.includes('name'));
  assert.ok(errorPaths.includes('venueType'));
  assert.ok(errorPaths.includes('location'));
  assert.ok(errorPaths.includes('operatingHours'));
  assert.ok(errorPaths.includes('physicalExchangeCapacity'));
  assert.ok(errorPaths.includes('verificationProtocol'));
});

test('validateHub - rejects invalid GeoJSON coordinates', () => {
  const badCoords = {
    id: 'urn:ochs:hub:test:1',
    name: 'Invalid Coordinate Hub',
    venueType: 'community_space',
    location: {
      type: 'Point',
      coordinates: [999.0, 45.0], // Longitude out of range [-180, 180]
      address: 'Main St 1',
      municipality: 'Capital',
      countryCode: 'IS',
    },
    operatingHours: { display: 'Open Daily' },
    physicalExchangeCapacity: { storageTier: 'designated_shelf', acceptsPerishables: false },
    verificationProtocol: { tier: 'unverified', lightingScore: 3, isStaffed: false },
  };

  const result = validateHub(badCoords);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.path === 'location.coordinates[0]'));
});

test('validateHub - rejects invalid verification hash format', () => {
  const badHash = {
    id: 'urn:ochs:hub:test:2',
    name: 'Bad Hash Hub',
    venueType: 'library',
    location: {
      type: 'Point',
      coordinates: [-21.9, 64.1],
      address: 'Main St 1',
      municipality: 'Reykjavík',
      countryCode: 'IS',
    },
    operatingHours: { display: 'Open Daily' },
    physicalExchangeCapacity: { storageTier: 'designated_shelf', acceptsPerishables: false },
    verificationProtocol: {
      tier: 'cryptographically_anchored',
      lightingScore: 5,
      isStaffed: true,
      verificationHash: 'invalid-hash-string-not-0x-hex',
    },
  };

  const result = validateHub(badHash);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.path === 'verificationProtocol.verificationHash'));
});
