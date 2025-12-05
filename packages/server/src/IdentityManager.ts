/**
 * Copyright (c) 2023-present FlowiseAI, Inc.
 *
 * The Enterprise and Cloud versions of Flowise are licensed under the [Commercial License](https://github.com/FlowiseAI/Flowise/tree/main/packages/server/src/enterprise/LICENSE.md).
 * Unauthorized copying, modification, distribution, or use of the Enterprise and Cloud versions is strictly prohibited without a valid license agreement from FlowiseAI, Inc.
 *
 * The Open Source version is licensed under the Apache License, Version 2.0 (the "License")
 *
 * For information about licensing of the Enterprise and Cloud versions, please contact:
 * security@flowiseai.com
 */

import axios from 'axios'
import express, { Application, NextFunction, Request, Response } from 'express'
import * as fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import path from 'path'
import { LoginMethodStatus } from './enterprise/database/entities/login-method.entity'
import { ErrorMessage, LoggedInUser } from './enterprise/Interface.Enterprise'
import { Permissions } from './enterprise/rbac/Permissions'
import { LoginMethodService } from './enterprise/services/login-method.service'
import { OrganizationService } from './enterprise/services/organization.service'
import Auth0SSO from './enterprise/sso/Auth0SSO'
import AzureSSO from './enterprise/sso/AzureSSO'
import GithubSSO from './enterprise/sso/GithubSSO'
import GoogleSSO from './enterprise/sso/GoogleSSO'
import SSOBase from './enterprise/sso/SSOBase'
import { InternalFlowiseError } from './errors/internalFlowiseError'
import { Platform, UserPlan } from './Interface'
import { StripeManager } from './StripeManager'
import { UsageCacheManager } from './UsageCacheManager'
import { GeneralErrorMessage, LICENSE_QUOTAS } from './utils/constants'
import { getRunningExpressApp } from './utils/getRunningExpressApp'
import { ENTERPRISE_FEATURE_FLAGS } from './utils/quotaUsage'
import Stripe from 'stripe'

const allSSOProviders = ['azure', 'google', 'auth0', 'github']
export class IdentityManager {
    private static instance: IdentityManager
    private stripeManager?: StripeManager
    licenseValid: boolean = false
    permissions: Permissions
    ssoProviderName: string = ''
    currentInstancePlatform: Platform = Platform.OPEN_SOURCE
    // create a map to store the sso provider name and the sso provider instance
    ssoProviders: Map<string, SSOBase> = new Map()

    public static async getInstance(): Promise<IdentityManager> {
        if (!IdentityManager.instance) {
            IdentityManager.instance = new IdentityManager()
            await IdentityManager.instance.initialize()
        }
        return IdentityManager.instance
    }

    public async initialize() {
        await this._validateLicenseKey()
        this.permissions = new Permissions()
        if (process.env.STRIPE_SECRET_KEY) {
            this.stripeManager = await StripeManager.getInstance()
        }
    }

    public getPlatformType = () => {
        return this.currentInstancePlatform
    }

    public getPermissions = () => {
        return this.permissions
    }

    public isEnterprise = () => {
        return this.currentInstancePlatform === Platform.ENTERPRISE
    }

    public isCloud = () => {
        return this.currentInstancePlatform === Platform.CLOUD
    }

    public isOpenSource = () => {
        return this.currentInstancePlatform === Platform.OPEN_SOURCE
    }

    public isLicenseValid = () => {
        return this.licenseValid
    }

    private _offlineVerifyLicense(licenseKey: string): any {
        try {
            const publicKey = fs.readFileSync(path.join(__dirname, '../', 'src/enterprise/license/public.pem'), 'utf8')
            const decoded = jwt.verify(licenseKey, publicKey, {
                algorithms: ['RS256']
            })
            return decoded
        } catch (error) {
            console.error('Error verifying license key:', error)
            return null
        }
    }

    private _validateLicenseKey = async () => {
        const LICENSE_URL = process.env.LICENSE_URL
        const FLOWISE_EE_LICENSE_KEY = process.env.FLOWISE_EE_LICENSE_KEY

        // First check if license key is missing
        if (!FLOWISE_EE_LICENSE_KEY) {
            this.licenseValid = false
            this.currentInstancePlatform = Platform.OPEN_SOURCE
            return
        }

        try {
            if (process.env.OFFLINE === 'true') {
                const decodedLicense = this._offlineVerifyLicense(FLOWISE_EE_LICENSE_KEY)

                if (!decodedLicense) {
                    this.licenseValid = false
                } else {
                    const issuedAtSeconds = decodedLicense.iat
                    if (!issuedAtSeconds) {
                        this.licenseValid = false
                    } else {
                        const issuedAt = new Date(issuedAtSeconds * 1000)
                        const expiryDurationInMonths = decodedLicense.expiryDurationInMonths || 0

                        const expiryDate = new Date(issuedAt)
                        expiryDate.setMonth(expiryDate.getMonth() + expiryDurationInMonths)

                        if (new Date() > expiryDate) {
                            this.licenseValid = false
                        } else {
                            this.licenseValid = true
                        }
                    }
                }
                this.currentInstancePlatform = Platform.ENTERPRISE
            } else if (LICENSE_URL) {
                try {
                    const response = await axios.post(`${LICENSE_URL}/enterprise/verify`, { license: FLOWISE_EE_LICENSE_KEY })
                    this.licenseValid = response.data?.valid

                    if (!LICENSE_URL.includes('api')) this.currentInstancePlatform = Platform.ENTERPRISE
                    else if (LICENSE_URL.includes('v1')) this.currentInstancePlatform = Platform.ENTERPRISE
                    else if (LICENSE_URL.includes('v2')) this.currentInstancePlatform = response.data?.platform
                    else throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, GeneralErrorMessage.UNHANDLED_EDGE_CASE)
                } catch (error) {
                    console.error('Error verifying license key:', error)
                    this.licenseValid = false
                    this.currentInstancePlatform = Platform.ENTERPRISE
                    return
                }
            }
        } catch (error) {
            this.licenseValid = false
        }
    }

    public initializeSSO = async (app: express.Application) => {
        if (this.getPlatformType() === Platform.CLOUD || this.getPlatformType() === Platform.ENTERPRISE) {
            const loginMethodService = new LoginMethodService()
            let queryRunner
            try {
                queryRunner = getRunningExpressApp().AppDataSource.createQueryRunner()
                await queryRunner.connect()
                let organizationId = undefined
                if (this.getPlatformType() === Platform.ENTERPRISE) {
                    const organizationService = new OrganizationService()
                    const organizations = await organizationService.readOrganization(queryRunner)
                    if (organizations.length > 0) {
                        organizationId = organizations[0].id
                    } else {
                        this.initializeEmptySSO(app)
                        return
                    }
                }
                const loginMethods = await loginMethodService.readLoginMethodByOrganizationId(organizationId, queryRunner)
                if (loginMethods && loginMethods.length > 0) {
                    for (let method of loginMethods) {
                        if (method.status === LoginMethodStatus.ENABLE) {
                            method.config = JSON.parse(await loginMethodService.decryptLoginMethodConfig(method.config))
                            this.initializeSsoProvider(app, method.name, method.config)
                        }
                    }
                }
            } finally {
                if (queryRunner) await queryRunner.release()
            }
        }
        // iterate through the remaining providers and initialize them with configEnabled as false
        this.initializeEmptySSO(app)
    }

    initializeEmptySSO(app: Application) {
        allSSOProviders.map((providerName) => {
            if (!this.ssoProviders.has(providerName)) {
                this.initializeSsoProvider(app, providerName, undefined)
            }
        })
    }

    initializeSsoProvider(app: Application, providerName: string, providerConfig: any) {
        if (this.ssoProviders.has(providerName)) {
            const provider = this.ssoProviders.get(providerName)
            if (provider) {
                if (providerConfig && providerConfig.configEnabled === true) {
                    provider.setSSOConfig(providerConfig)
                    provider.initialize()
                } else {
                    // if false, disable the provider
                    provider.setSSOConfig(undefined)
                }
            }
        } else {
            switch (providerName) {
                case 'azure': {
                    const azureSSO = new AzureSSO(app, providerConfig)
                    azureSSO.initialize()
                    this.ssoProviders.set(providerName, azureSSO)
                    break
                }
                case 'google': {
                    const googleSSO = new GoogleSSO(app, providerConfig)
                    googleSSO.initialize()
                    this.ssoProviders.set(providerName, googleSSO)
                    break
                }
                case 'auth0': {
                    const auth0SSO = new Auth0SSO(app, providerConfig)
                    auth0SSO.initialize()
                    this.ssoProviders.set(providerName, auth0SSO)
                    break
                }
                case 'github': {
                    const githubSSO = new GithubSSO(app, providerConfig)
                    githubSSO.initialize()
                    this.ssoProviders.set(providerName, githubSSO)
                    break
                }
                default:
                    throw new Error(`SSO Provider ${providerName} not found`)
            }
        }
    }

    async getRefreshToken(providerName: any, ssoRefreshToken: string) {
        if (!this.ssoProviders.has(providerName)) {
            throw new Error(`SSO Provider ${providerName} not found`)
        }
        return await (this.ssoProviders.get(providerName) as SSOBase).refreshToken(ssoRefreshToken)
    }

    public async getProductIdFromSubscription(subscriptionId: string) {
        // VibeForge Embedded: Subscription removed - Always return empty string
        return ''
    }

    public async getFeaturesByPlan(subscriptionId: string, withoutCache: boolean = false) {
        // VibeForge Embedded: Subscription removed - All features enabled by default
        const features: Record<string, string> = {}
        for (const feature of ENTERPRISE_FEATURE_FLAGS) {
            features[feature] = 'true'
        }
        return features
    }

    public static checkFeatureByPlan(feature: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            // VibeForge Embedded: Subscription removed - All features always allowed
            return next()
        }
    }

    public async createStripeCustomerPortalSession(req: Request) {
        // VibeForge Embedded: Subscription removed - Return empty URL (no portal needed)
        return { url: '' }
    }

    public async getAdditionalSeatsQuantity(subscriptionId: string) {
        // VibeForge Embedded: Subscription removed - Return unlimited seats
        return { quantity: 0, includedSeats: -1 }
    }

    public async getCustomerWithDefaultSource(customerId: string) {
        // VibeForge Embedded: Subscription removed - Return null (no customer needed)
        return null
    }

    public async getAdditionalSeatsProration(subscriptionId: string, newQuantity: number) {
        // VibeForge Embedded: Subscription removed - Return free proration
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
        // VibeForge Embedded: Subscription removed - Return mock success (no seats limit)
        return {
            success: true,
            subscription: null,
            invoice: null
        }
    }

    public async getPlanProration(subscriptionId: string, newPlanId: string) {
        // VibeForge Embedded: Subscription removed - Return free proration
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

    public async updateSubscriptionPlan(req: Request, subscriptionId: string, newPlanId: string, prorationDate: number) {
        // VibeForge Embedded: Subscription removed - Return mock success (no plan changes needed)
        if (!req.user) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, GeneralErrorMessage.UNAUTHORIZED)
        }

        // Get all features enabled
        const features = await this.getFeaturesByPlan('', false)

        const loggedInUser: LoggedInUser = {
            ...req.user,
            features
        }

        req.user = {
            ...req.user,
            ...loggedInUser
        }

        return {
            status: 'success',
            user: loggedInUser
        }
    }

    public async createStripeUserAndSubscribe({ email, userPlan, referral }: { email: string; userPlan: UserPlan; referral?: string }) {
        // VibeForge Embedded: Subscription removed - Return empty values (no Stripe customer/subscription needed)
        return {
            customerId: '',
            subscriptionId: ''
        }
    }
}
