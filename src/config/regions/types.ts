/**
 * Region Configuration Types
 *
 * Defines the structure for region-specific configurations (India vs Global)
 */

export type RegionType = 'india' | 'global';
export type PaymentGateway = 'razorpay' | 'paypal';

export interface ServicePricing {
  total: number;
  deposit: number;
  timeline: string;
}

export interface HourlyPricing {
  rate: number;
  unit: 'hour';
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

export interface PaymentConfig {
  gateway: PaymentGateway;
  methods: string[];
  gatewayKey: string; // Environment variable key for the payment gateway
}

export interface PricingConfig {
  landingPage: ServicePricing;
  portfolio: ServicePricing;
  business: ServicePricing;
  personalBrand: ServicePricing;
  ecommerce: ServicePricing;
  saas: ServicePricing;
  webApp: ServicePricing;
  hourly: HourlyPricing;
}

export interface ContentConfig {
  heroTagline: string;
  heroSubtitle?: string; // Optional: for region-specific hero subtitle
  heroDescription?: string; // Optional: for region-specific hero description
  areaServed: string;
  paymentNote: string;
  aboutDescription: string;
  localTargetingTitle: string;
  localTargetingSubtitle: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  geoRegion: string;
  geoPlace: string;
  priceRange: string;
  currenciesAccepted: string;
}

export interface RegionConfig {
  region: RegionType;
  currency: CurrencyConfig;
  payment: PaymentConfig;
  pricing: PricingConfig;
  content: ContentConfig;
  seo: SEOConfig;
  domain: string;
}
