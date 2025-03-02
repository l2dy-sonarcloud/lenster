import { HEY_API_PRODUCTION_URL } from "@hey/data/constants";

export const HEY_USER_AGENT = "HeyBot/0.1 (like TwitterBot)";
export const VERIFICATION_ENDPOINT = `${HEY_API_PRODUCTION_URL}/lens/verification`;

// Cache
// Cache for 30 minutes
export const CACHE_AGE_30_MINS = "public, s-maxage=1800, max-age=1800";
// Cache for 1 day
export const CACHE_AGE_1_DAY = "public, s-maxage=86400, max-age=86400";
