import Stripe from 'stripe'
import { Request } from 'express'
import { UsageCacheManager } from './UsageCacheManager'
import { UserPlan } from './Interface'
import { LICENSE_QUOTAS } from './utils/constants'

// VibeForge Embedded: Subscription removed - All Stripe methods now return mock/unlimited values
export class StripeManager {
    private static instance: StripeManager
    private stripe?: Stripe
    private cacheManager: UsageCacheManager

    public static async getInstance(): Promise<StripeManager> {
        if (!StripeManager.instance) {
            StripeManager.instance = new StripeManager()
            await StripeManager.instance.initialize()
        }
        return StripeManager.instance
    }

    private async initialize() {
        // VibeForge Embedded: Subscription removed - Never initialize Stripe
        this.stripe = undefined
        this.cacheManager = await UsageCacheManager.getInstance()
    }

    public getStripe() {
        // VibeForge Embedded: Subscription removed - Always return null
        return null
    }

    public getSubscriptionObject(subscription: Stripe.Response<Stripe.Subscription>) {
        // VibeForge Embedded: Subscription removed - Return mock object
        return {
            customer: '',
            status: 'active',
            created: Math.floor(Date.now() / 1000)
        }
    }

    public async getProductIdFromSubscription(subscriptionId: string) {
        // VibeForge Embedded: Subscription removed - Always return empty string
        return ''
    }

    public async getFeaturesByPlan(subscriptionId: string, withoutCache: boolean = false) {
        // VibeForge Embedded: Subscription removed - Return empty features (all features enabled elsewhere)
        return {}
    }

    public async createStripeCustomerPortalSession(req: Request) {
        // VibeForge Embedded: Subscription removed - Return empty URL (no subscription portal needed)
        return { url: '' }
    }

    public async getAdditionalSeatsQuantity(subscriptionId: string): Promise<{ quantity: number; includedSeats: number }> {
        // VibeForge Embedded: Subscription removed - Return unlimited seats
        return { quantity: 0, includedSeats: -1 }
    }

    public async getCustomerWithDefaultSource(customerId: string) {
        // VibeForge Embedded: Subscription removed - Return null (no customer needed)
        return null
    }

    public async getAdditionalSeatsProration(subscriptionId: string, quantity: number) {
        // VibeForge Embedded: Subscription removed - Return free proration (no payment needed)
        return {
            basePlanAmount: 0,
            additionalSeatsProratedAmount: 0,
            seatPerUnitPrice: 0,
            prorationAmount: 0,
            creditBalance: 0,
            nextInvoiceTotal: 0,
            currency: 'USD',
            prorationDate: Math.floor(Date.now() / 1000),
            currentPeriodStart: Math.floor(Date.now() / 1000),
            currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        }
    }

    public async updateAdditionalSeats(subscriptionId: string, quantity: number, prorationDate: number) {
        // VibeForge Embedded: Subscription removed - Return mock success (no subscription needed)
        return {
            success: true,
            subscription: null,
            invoice: null
        }
    }

    public async getPlanProration(subscriptionId: string, newPlanId: string) {
        // VibeForge Embedded: Subscription removed - Return free proration (no payment needed)
        return {
            newPlanAmount: 0,
            prorationAmount: 0,
            creditBalance: 0,
            currency: 'USD',
            prorationDate: Math.floor(Date.now() / 1000),
            currentPeriodStart: Math.floor(Date.now() / 1000),
            currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            eligibleForFirstMonthFree: false
        }
    }

    public async updateSubscriptionPlan(subscriptionId: string, newPlanId: string, prorationDate: number) {
        // VibeForge Embedded: Subscription removed - Return mock success (no subscription needed)
        return {
            success: true,
            subscription: null,
            invoice: null
        }
    }

    private async getPriceIds() {
        // VibeForge Embedded: Subscription removed - Private helper no longer needed
        return {}
    }

    private async createPortalConfiguration(_: Record<string, { product: string; price: string }>) {
        // VibeForge Embedded: Subscription removed - Private helper no longer needed
        return { id: '' }
    }
}
