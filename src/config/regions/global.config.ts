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
    heroTagline: 'AI-Powered Web Developer | Building Smart Digital Experiences Worldwide',
    heroSubtitle: 'Leveraging AI & Modern Tech to Build Intelligent Web Applications',
    heroDescription: 'Expert in React, TypeScript, Node.js & AI Integration — Building modern web applications, AI-powered SaaS platforms, and intelligent digital solutions that drive global business growth',
    areaServed: 'Worldwide',
    paymentNote: 'Secure payments via PayPal - All major cards accepted',
    aboutDescription: 'Hey! I\'m Sudharsan, an AI-powered web developer serving clients worldwide. I specialize in building intelligent, modern websites that leverage cutting-edge technology to help businesses scale globally.',
    localTargetingTitle: 'Why Work Remote?',
    localTargetingSubtitle: 'Benefits of working with a remote developer',
  },

  seo: {
    title: 'AI-Powered Web Developer | Intelligent Websites & SaaS Worldwide',
    description: 'AI-powered web developer offering intelligent website development, AI-integrated SaaS platforms, e-commerce stores, and custom web applications. Leveraging cutting-edge AI technology with competitive pricing starting from $300. Serving clients worldwide with secure PayPal payments.',
    keywords: 'ai powered web developer, ai website development, intelligent web applications, ai saas development, machine learning web apps, ai integration, custom ai solutions, web developer worldwide, affordable ai websites, paypal payment integration, international ai developer, react ai developer, typescript ai development',
    geoRegion: 'WORLDWIDE',
    geoPlace: 'Global',
    priceRange: '$$',
    currenciesAccepted: 'USD',
  },

  domain: 'sudharsanbuilds.com',
};
