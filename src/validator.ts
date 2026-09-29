import {
  CommunityHub,
  ValidationResult,
  ValidationError,
  VenueType,
  StorageTier,
  VerificationTier,
} from './types.js';

const ALLOWED_VENUE_TYPES: Set<string> = new Set<VenueType>([
  'library',
  'civic_center',
  'community_hall',
  'public_cafe',
  'community_space',
  'tool_library',
  'makerspace',
  'educational_facility',
  'neighborhood_pantry',
  'cultural_center',
]);

const ALLOWED_STORAGE_TIERS: Set<string> = new Set<StorageTier>([
  'direct_handover_only',
  'designated_shelf',
  'secure_locker',
  'dedicated_room',
  'community_depot',
]);

const ALLOWED_VERIFICATION_TIERS: Set<string> = new Set<VerificationTier>([
  'unverified',
  'community_attested',
  'partner_endorsed',
  'municipal_verified',
  'cryptographically_anchored',
]);

const HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validates any candidate JSON object against the Open Community Hub Specification (OCHS).
 * Completely zero-dependency and deterministic.
 */
export function validateHub(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: [{ path: '', message: 'Hub data must be a non-null object' }],
    };
  }

  const obj = data as Record<string, unknown>;

  // 1. id
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    errors.push({ path: 'id', message: 'Missing or invalid id string', received: obj.id });
  }

  // 2. name
  if (typeof obj.name !== 'string' || obj.name.trim().length < 2) {
    errors.push({ path: 'name', message: 'Name must be a string of at least 2 characters', received: obj.name });
  }

  // 3. venueType
  if (typeof obj.venueType !== 'string' || !ALLOWED_VENUE_TYPES.has(obj.venueType)) {
    errors.push({
      path: 'venueType',
      message: `venueType must be one of: ${Array.from(ALLOWED_VENUE_TYPES).join(', ')}`,
      received: obj.venueType,
    });
  }

  // 4. location
  if (!obj.location || typeof obj.location !== 'object' || Array.isArray(obj.location)) {
    errors.push({ path: 'location', message: 'location must be an object' });
  } else {
    const loc = obj.location as Record<string, unknown>;

    if (loc.type !== 'Point') {
      errors.push({ path: 'location.type', message: "location.type must be 'Point'", received: loc.type });
    }

    if (!Array.isArray(loc.coordinates) || loc.coordinates.length < 2) {
      errors.push({
        path: 'location.coordinates',
        message: 'location.coordinates must be an array of at least 2 numbers [longitude, latitude]',
        received: loc.coordinates,
      });
    } else {
      const [lon, lat] = loc.coordinates;
      if (typeof lon !== 'number' || isNaN(lon) || lon < -180 || lon > 180) {
        errors.push({
          path: 'location.coordinates[0]',
          message: 'Longitude must be a number between -180.0 and +180.0',
          received: lon,
        });
      }
      if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
        errors.push({
          path: 'location.coordinates[1]',
          message: 'Latitude must be a number between -90.0 and +90.0',
          received: lat,
        });
      }
    }

    if (typeof loc.address !== 'string' || loc.address.trim() === '') {
      errors.push({ path: 'location.address', message: 'location.address is required', received: loc.address });
    }

    if (typeof loc.municipality !== 'string' || loc.municipality.trim() === '') {
      errors.push({ path: 'location.municipality', message: 'location.municipality is required', received: loc.municipality });
    }

    if (typeof loc.countryCode !== 'string' || !COUNTRY_CODE_REGEX.test(loc.countryCode)) {
      errors.push({
        path: 'location.countryCode',
        message: 'location.countryCode must be a 2-letter uppercase ISO 3166-1 alpha-2 code',
        received: loc.countryCode,
      });
    }
  }

  // 5. operatingHours
  if (!obj.operatingHours || typeof obj.operatingHours !== 'object' || Array.isArray(obj.operatingHours)) {
    errors.push({ path: 'operatingHours', message: 'operatingHours must be an object' });
  } else {
    const op = obj.operatingHours as Record<string, unknown>;
    if (typeof op.display !== 'string' || op.display.trim() === '') {
      errors.push({ path: 'operatingHours.display', message: 'operatingHours.display is required', received: op.display });
    }

    if (Array.isArray(op.weeklySchedule)) {
      op.weeklySchedule.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
          errors.push({ path: `operatingHours.weeklySchedule[${idx}]`, message: 'Schedule entry must be an object' });
        } else {
          const s = item as Record<string, unknown>;
          if (typeof s.opens === 'string' && !TIME_REGEX.test(s.opens)) {
            errors.push({ path: `operatingHours.weeklySchedule[${idx}].opens`, message: 'opens must be in HH:MM format', received: s.opens });
          }
          if (typeof s.closes === 'string' && !TIME_REGEX.test(s.closes)) {
            errors.push({ path: `operatingHours.weeklySchedule[${idx}].closes`, message: 'closes must be in HH:MM format', received: s.closes });
          }
        }
      });
    }
  }

  // 6. physicalExchangeCapacity
  if (!obj.physicalExchangeCapacity || typeof obj.physicalExchangeCapacity !== 'object' || Array.isArray(obj.physicalExchangeCapacity)) {
    errors.push({ path: 'physicalExchangeCapacity', message: 'physicalExchangeCapacity must be an object' });
  } else {
    const cap = obj.physicalExchangeCapacity as Record<string, unknown>;
    if (typeof cap.storageTier !== 'string' || !ALLOWED_STORAGE_TIERS.has(cap.storageTier)) {
      errors.push({
        path: 'physicalExchangeCapacity.storageTier',
        message: `storageTier must be one of: ${Array.from(ALLOWED_STORAGE_TIERS).join(', ')}`,
        received: cap.storageTier,
      });
    }

    if (typeof cap.acceptsPerishables !== 'boolean') {
      errors.push({
        path: 'physicalExchangeCapacity.acceptsPerishables',
        message: 'acceptsPerishables must be a boolean',
        received: cap.acceptsPerishables,
      });
    }

    if (cap.maxWeightKg !== undefined && (typeof cap.maxWeightKg !== 'number' || cap.maxWeightKg < 0)) {
      errors.push({
        path: 'physicalExchangeCapacity.maxWeightKg',
        message: 'maxWeightKg must be a non-negative number',
        received: cap.maxWeightKg,
      });
    }
  }

  // 7. verificationProtocol
  if (!obj.verificationProtocol || typeof obj.verificationProtocol !== 'object' || Array.isArray(obj.verificationProtocol)) {
    errors.push({ path: 'verificationProtocol', message: 'verificationProtocol must be an object' });
  } else {
    const ver = obj.verificationProtocol as Record<string, unknown>;
    if (typeof ver.tier !== 'string' || !ALLOWED_VERIFICATION_TIERS.has(ver.tier)) {
      errors.push({
        path: 'verificationProtocol.tier',
        message: `tier must be one of: ${Array.from(ALLOWED_VERIFICATION_TIERS).join(', ')}`,
        received: ver.tier,
      });
    }

    if (typeof ver.lightingScore !== 'number' || !Number.isInteger(ver.lightingScore) || ver.lightingScore < 1 || ver.lightingScore > 5) {
      errors.push({
        path: 'verificationProtocol.lightingScore',
        message: 'lightingScore must be an integer between 1 and 5',
        received: ver.lightingScore,
      });
    }

    if (typeof ver.isStaffed !== 'boolean') {
      errors.push({
        path: 'verificationProtocol.isStaffed',
        message: 'isStaffed must be a boolean',
        received: ver.isStaffed,
      });
    }

    if (ver.verificationHash !== undefined && (typeof ver.verificationHash !== 'string' || !HASH_REGEX.test(ver.verificationHash))) {
      errors.push({
        path: 'verificationProtocol.verificationHash',
        message: 'verificationHash must be a 66-character hex string starting with 0x',
        received: ver.verificationHash,
      });
    }

    if (ver.trustScore !== undefined && (typeof ver.trustScore !== 'number' || ver.trustScore < 0 || ver.trustScore > 5)) {
      errors.push({
        path: 'verificationProtocol.trustScore',
        message: 'trustScore must be a number between 0 and 5',
        received: ver.trustScore,
      });
    }
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    hub: valid ? (data as CommunityHub) : undefined,
  };
}
