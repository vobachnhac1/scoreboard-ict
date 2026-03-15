/**
 * FILE: app/config/constants/packageFeatures.js
 * 
 * Defines feature toggles and configuration options available for each Package Tier.
 * This is the single source of truth for all feature access rules based on subscription tiers.
 * 
 * BASIC (1) -> ADVANCED (2) -> ENTERPRISE (3)
 */

import { PACKAGE_TIERS } from '../../components/FeatureLock';

// ============================================================================
// Core Feature Access Definitions
// Map route paths or global feature names to minimum required tier
// ============================================================================
export const FEATURE_ROUTES = {
    // --- Admin / Management ---
    '/management/connect': PACKAGE_TIERS.BASIC,
    '/management/general-setting/config-system': PACKAGE_TIERS.BASIC,
    '/management/general-setting/competition-management': PACKAGE_TIERS.BASIC,
    '/management/competition-data': PACKAGE_TIERS.BASIC,

    // --- Scoreboards ---
    '/bang-diem/doi-khang': PACKAGE_TIERS.BASIC,
    '/bang-diem/quyen': PACKAGE_TIERS.BASIC,
    '/bang-diem/vo-nhac': PACKAGE_TIERS.ADVANCED,

    // --- External Displays ---
    '/secondary-display': PACKAGE_TIERS.ADVANCED,

    // --- Enterprise level ---
    '/management/data-sync': PACKAGE_TIERS.ENTERPRISE,
};

// ============================================================================
// Keyboard configs & Game System Config Overrides
// Based on the tier, we might want to restrict some configurations
// ============================================================================
export const PACKAGE_OVERRIDES = {
    [PACKAGE_TIERS.BASIC]: {
        disabledOptions: {
            ap_dung_vonhac: 1, // Basic cannot use Võ Nhạc
            cau_hinh_lan_sync: 1, // Basic cannot use LAN Sync
        },
        hiddenGroups: [
            // If you want to hide entire groups of settings based on tier
        ],
        max_devices: 5,   // Ví dụ về cấu hình số lượng thiết bị
    },
    [PACKAGE_TIERS.ADVANCED]: {
        disabledOptions: {
            cau_hinh_lan_sync: 1, // Advanced cannot use LAN sync
        },
        hiddenGroups: [],
        max_devices: 15,
    },
    [PACKAGE_TIERS.ENTERPRISE]: {
        disabledOptions: {}, // Enterprise has no restrictions
        hiddenGroups: [],
        max_devices: 999,
    }
};

/**
 * Checks if a specific config option (like 'ap_dung_vonhac') is locked for the current tier
 * @param {Number} currentTier - The current active tier from state
 * @param {String} fieldKey - The property key being checked
 * @returns {Boolean} true if the field should be disabled/locked
 */
export const isConfigFieldLocked = (currentTier, fieldKey) => {
    if (!currentTier) return false;

    const overrides = PACKAGE_OVERRIDES[currentTier];
    if (!overrides || !overrides.disabledOptions) return false;

    return Object.hasOwn(overrides.disabledOptions, fieldKey);
};

export default {
    FEATURE_ROUTES,
    PACKAGE_OVERRIDES,
    isConfigFieldLocked
};
