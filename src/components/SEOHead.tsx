/**
 * SEO Head Component
 *
 * Dynamically updates meta tags based on active region configuration
 * Runs on component mount to ensure region-specific SEO is applied
 */

import { useEffect } from 'react';
import { getActiveRegion } from '../config/regions';

export default function SEOHead() {
  useEffect(() => {
    const regionConfig = getActiveRegion();
    const { seo, content, currency, payment, domain } = regionConfig;

    // Update document title
    document.title = seo.title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, property: string, value: string) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('property=')) {
          meta.setAttribute('property', selector.split('"')[1]);
        } else {
          meta.setAttribute('name', selector.split('"')[1]);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute(property, value);
    };

    // Update basic SEO meta tags
    updateMetaTag('meta[name="description"]', 'content', seo.description);
    updateMetaTag('meta[name="keywords"]', 'content', seo.keywords);
    updateMetaTag('meta[name="geo.region"]', 'content', seo.geoRegion);
    updateMetaTag('meta[name="geo.placename"]', 'content', seo.geoPlace);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', seo.title);
    updateMetaTag('meta[property="og:description"]', 'content', seo.description);
    updateMetaTag('meta[property="og:url"]', 'content', `https://${domain}`);
    updateMetaTag('meta[property="og:locale"]', 'content',
      regionConfig.region === 'india' ? 'en_IN' : 'en_US'
    );

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', 'content', seo.title);
    updateMetaTag('meta[name="twitter:description"]', 'content', seo.description);

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = `https://${domain}`;
    }

    // Update JSON-LD structured data for Professional Service
    const professionalServiceScript = document.querySelector('script[type="application/ld+json"]');
    if (professionalServiceScript) {
      try {
        const structuredData = JSON.parse(professionalServiceScript.textContent || '{}');

        if (structuredData['@type'] === 'Person') {
          // Update Person schema
          structuredData.jobTitle = regionConfig.region === 'global'
            ? 'AI-Powered Full Stack Web Developer'
            : 'Full Stack Web Developer';
          structuredData.description = regionConfig.region === 'global'
            ? 'AI-powered Full Stack Web Developer specializing in intelligent web applications, AI-powered SaaS platforms, and modern e-commerce solutions for global clients'
            : 'Full Stack Web Developer specializing in modern web applications, SaaS platforms, and e-commerce solutions';
          structuredData.url = `https://${domain}`;

          professionalServiceScript.textContent = JSON.stringify(structuredData);
        }
      } catch (e) {
        console.warn('Could not update structured data:', e);
      }
    }

    // Update all script tags containing Professional Service data
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '{}');

        if (data['@type'] === 'ProfessionalService') {
          // Update service description
          data.description = seo.description;
          data.url = `https://${domain}`;
          data.priceRange = seo.priceRange;
          data.currenciesAccepted = seo.currenciesAccepted;
          data.paymentAccepted = payment.methods.join(', ');

          if (regionConfig.region === 'global') {
            data.areaServed = {
              "@type": "Place",
              "name": "Worldwide"
            };
            // Remove India-specific address for global
            delete data.address;
          }

          script.textContent = JSON.stringify(data);
        }

        if (data['@type'] === 'WebSite') {
          data.url = `https://${domain}`;
          script.textContent = JSON.stringify(data);
        }
      } catch (e) {
        console.warn('Could not update structured data:', e);
      }
    });

  }, []); // Run once on mount

  return null; // This component doesn't render anything
}
