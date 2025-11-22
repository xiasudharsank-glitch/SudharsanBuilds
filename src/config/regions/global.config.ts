/**
 * Global Region Configuration
 *
 * Configuration for international/worldwide market:
 * - Currency: USD ($)
 * - Payment: PayPal
 * - Domain: sudharsanbuilds.com
 */

import { RegionConfig } from './types';

export const globalConfig: RegionConfig = {
  region: 'global',

  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },

  payment: {
    gateway: 'paypal',
    methods: ['PayPal', 'Credit Card', 'Debit Card'],
    gatewayKey: 'VITE_PAYPAL_CLIENT_ID',
  },

  pricing: {
    landingPage: {
      total: 300,
      deposit: 100,
      timeline: '1-2 weeks',
    },
    portfolio: {
      total: 350,
      deposit: 120,
      timeline: '2-3 weeks',
    },
    business: {
      total: 500,
      deposit: 175,
      timeline: '3-4 weeks',
    },
    personalBrand: {
      total: 400,
      deposit: 135,
      timeline: '3 weeks',
    },
    ecommerce: {
      total: 1000,
      deposit: 350,
      timeline: '4-6 weeks',
    },
    saas: {
      total: 1500,
      deposit: 500,
      timeline: '6-10 weeks',
    },
    webApp: {
      total: 1200,
      deposit: 400,
      timeline: '5-8 weeks',
    },
    hourly: {
      rate: 10,
      unit: 'hour',
    },
  },

  content: {
    heroTagline: 'Professional Web Developer | Building Digital Experiences Worldwide',
    areaServed: 'Worldwide',
    paymentNote: 'Secure payments via PayPal - All major cards accepted',
    aboutDescription: 'Hey! I\'m Sudharsan, a professional web developer serving clients worldwide. I build fast, modern websites that help businesses grow online.',
    localTargetingTitle: 'Why Work Remote?',
    localTargetingSubtitle: 'Benefits of working with a remote developer',
  },

  seo: {
    title: 'Professional Web Developer | Custom Websites Worldwide',
    description: 'Professional web developer offering custom website development, portfolio sites, e-commerce stores, and web applications. Competitive pricing starting from $300. Serving clients worldwide with secure PayPal payments.',
    keywords: 'professional web developer, website development worldwide, custom web development, web developer remote, affordable website design, paypal payment integration, international web developer',
    geoRegion: 'WORLDWIDE',
    geoPlace: 'Global',
    priceRange: '$$',
    currenciesAccepted: 'USD',
  },

  domain: 'sudharsanbuilds.com',
};
