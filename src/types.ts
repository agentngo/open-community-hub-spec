/**
 * Open Community Hub Specification (OCHS) — TypeScript Type Definitions
 * Version: 1.0.0
 * Standardized data model for physical civic sharing hubs, safe exchange zones,
 * and mutual aid deposit centers.
 */

export type VenueType =
  | 'library'
  | 'civic_center'
  | 'community_hall'
  | 'public_cafe'
  | 'community_space'
  | 'tool_library'
  | 'makerspace'
  | 'educational_facility'
  | 'neighborhood_pantry'
  | 'cultural_center';

export type StorageTier =
  | 'direct_handover_only'
  | 'designated_shelf'
  | 'secure_locker'
  | 'dedicated_room'
  | 'community_depot';

export type VerificationTier =
  | 'unverified'
  | 'community_attested'
  | 'partner_endorsed'
  | 'municipal_verified'
  | 'cryptographically_anchored';

export type WheelchairAccessibility = 'yes' | 'no' | 'limited' | 'designated';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * GeoJSON Point Location conforming to RFC 7946, supplemented with postal address.
 */
export interface HubLocation {
  type: 'Point';
  /** Coordinates in [longitude, latitude] order as specified by RFC 7946 */
  coordinates: [number, number] | [number, number, number];
  /** Convenience accessor for latitude (-90 to +90) */
  latitude?: number;
  /** Convenience accessor for longitude (-180 to +180) */
  longitude?: number;
  address: string;
  postalCode?: string;
  neighborhood?: string;
  district?: string;
  municipality: string;
  countryCode: string;
}

export interface ScheduleDay {
  dayOfWeek: DayOfWeek;
  /** HH:MM 24h format */
  opens: string;
  /** HH:MM 24h format */
  closes: string;
}

export interface HubOperatingHours {
  display: string;
  osmOpeningHours?: string;
  timezone?: string;
  is24_7?: boolean;
  weeklySchedule?: ScheduleDay[];
}

export interface ItemDimensionsCm {
  length: number;
  width: number;
  height: number;
}

export interface PhysicalExchangeCapacity {
  storageTier: StorageTier;
  maxItemDimensionsCm?: ItemDimensionsCm;
  maxWeightKg?: number;
  maxHoldDurationHours?: number;
  acceptsPerishables: boolean;
  refrigerationAvailable?: boolean;
}

export interface VerificationProtocol {
  tier: VerificationTier;
  lightingScore: number; // 1 to 5
  isStaffed: boolean;
  verificationHash?: string; // 0x + 64 hex characters
  verifierIdentity?: string;
  verifiedAt?: string; // ISO 8601
  trustScore?: number; // 0.0 to 5.0
  activeIssueCount?: number;
}

export interface HubAccessibility {
  isIndoor?: boolean;
  isStepFree?: boolean;
  wheelchairAccessible?: WheelchairAccessibility;
  weekendAccessible?: boolean;
  publicRestroom?: boolean;
  publicWifi?: boolean;
  transitNearby?: string[];
}

export interface OsmAlignment {
  osmId?: string; // e.g. "node/438831920"
  osmTags?: Record<string, string>;
  wikidataId?: string; // e.g. "Q16420542"
}

export interface HubContact {
  website?: string;
  phone?: string;
  email?: string;
}

/**
 * Standardized Canonical Community Hub
 */
export interface CommunityHub {
  $schema?: string;
  id: string;
  name: string;
  alternateNames?: string[];
  description?: string;
  venueType: VenueType;
  location: HubLocation;
  operatingHours: HubOperatingHours;
  physicalExchangeCapacity: PhysicalExchangeCapacity;
  verificationProtocol: VerificationProtocol;
  accessibility?: HubAccessibility;
  osmAlignment?: OsmAlignment;
  contact?: HubContact;
}

export interface ValidationError {
  path: string;
  message: string;
  received?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  hub?: CommunityHub;
}
