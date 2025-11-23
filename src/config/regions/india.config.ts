/**
 * India Region Configuration
 *
 * Configuration for Indian market:
 * - Currency: INR (₹)
 * - Payment: Razorpay
 * - Domain: sudharsanbuilds.online
 */

import { RegionConfig } from './types';

export const indiaConfig: RegionConfig = {
  region: 'india',

  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },

  payment: {
    gateway: 'razorpay',
    methods: ['UPI', 'Cards', 'Net Banking', 'Wallets'],
    gatewayKey: 'VITE_RAZORPAY_KEY_ID',
  },

  pricing: {
    landingPage: {
      total: 15000,
      deposit: 5000,
      timeline: '1-2 weeks',
    },
    portfolio: {
      total: 20000,
      deposit: 7000,
      timeline: '2-3 weeks',
    },
    business: {
      total: 30000,
      deposit: 10000,
      timeline: '3-4 weeks',
    },
    personalBrand: {
      total: 25000,
      deposit: 8000,
      timeline: '3 weeks',
    },
    ecommerce: {
      total: 50000,
      deposit: 15000,
      timeline: '4-6 weeks',
    },
    saas: {
      total: 75000,
      deposit: 25000,
      timeline: '6-10 weeks',
    },
    webApp: {
      total: 60000,
      deposit: 20000,
      timeline: '5-8 weeks',
    },
    hourly: {
      rate: 500,
      unit: 'hour',
    },
  },

  content: {
    heroTagline: 'Freelance Web Developer India | Building Digital Experiences',
    areaServed: 'India',
    paymentNote: 'Secure payments via Razorpay - UPI, Cards, Net Banking accepted',
    aboutDescription: 'Hey! I\'m Sudharsan, an indie developer serving clients across India. I build fast, modern websites that help businesses grow online.',
    localTargetingTitle: 'Why Work Remote?',
    localTargetingSubtitle: 'Benefits of working with a freelance developer in India',
  },

  seo: {
    title: 'Freelance Web Developer India | Affordable Website Development Services',
    description: 'Professional freelance web developer in India offering custom website development, portfolio sites, e-commerce stores, and web applications. Affordable pricing starting from ₹15,000. Serving clients across India with secure Razorpay payments.',
    keywords: 'freelance web developer india, website development india, web developer tamil nadu, affordable website design, custom web development india, razorpay payment integration',
    geoRegion: 'IN',
    geoPlace: 'India',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
  },

  domain: 'sudharsanbuilds.online',
};
