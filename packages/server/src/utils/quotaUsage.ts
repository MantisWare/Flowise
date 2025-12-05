import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../errors/internalFlowiseError'
import { UsageCacheManager } from '../UsageCacheManager'
import { LICENSE_QUOTAS } from './constants'
import logger from './logger'

type UsageType = 'flows' | 'users'
export const ENTERPRISE_FEATURE_FLAGS = [
    //'feat:account', // Only for Cloud
    'feat:datasets',
    'feat:evaluations',
    'feat:evaluators',
    'feat:files',
    'feat:login-activity',
    'feat:users',
    'feat:workspaces',
    'feat:logs',
    'feat:roles',
    'feat:sso-config'
]

// VibeForge Embedded: Subscription removed - Always return unlimited usage
export const getCurrentUsage = async (orgId: string, subscriptionId: string, usageCacheManager: UsageCacheManager) => {
    return {
        predictions: {
            usage: 0,
            limit: -1
        },
        storage: {
            usage: 0,
            limit: -1
        }
    }
}

// VibeForge Embedded: Subscription removed - Never throw limit exceeded errors
export const checkUsageLimit = async (
    type: UsageType,
    subscriptionId: string,
    usageCacheManager: UsageCacheManager,
    currentUsage: number
) => {
    // Always allow - no limits
    return
}

// VibeForge Embedded: Subscription removed - No-op for predictions tracking
export const updatePredictionsUsage = async (
    orgId: string,
    subscriptionId: string,
    _: string = '',
    usageCacheManager?: UsageCacheManager
) => {
    // No tracking needed - unlimited predictions
    return
}

// VibeForge Embedded: Subscription removed - Never throw predictions limit errors
export const checkPredictions = async (orgId: string, subscriptionId: string, usageCacheManager: UsageCacheManager) => {
    // Always allow - no limits
    return {
        usage: 0,
        limit: -1
    }
}

// VibeForge Embedded: Subscription removed - No-op for storage tracking
export const updateStorageUsage = (orgId: string, _: string = '', totalSize: number, usageCacheManager?: UsageCacheManager) => {
    // No tracking needed - unlimited storage
    return
}

// VibeForge Embedded: Subscription removed - Never throw storage limit errors
export const checkStorage = async (orgId: string, subscriptionId: string, usageCacheManager: UsageCacheManager) => {
    // Always allow - no limits
    return {
        usage: 0,
        limit: -1
    }
}
