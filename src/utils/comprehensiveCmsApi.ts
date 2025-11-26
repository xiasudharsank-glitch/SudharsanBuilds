/**
 * Comprehensive CMS API - Handles 10 content management systems
 * Settings, Hero, Contact, Social, SEO, Email, Navigation, Footer, Skills, Achievements
 */

import { supabase } from '../lib/supabase';

// ===================================================================
// 1. SITE SETTINGS
// ===================================================================
export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json' | 'url' | 'email';
  category: string;
  description?: string;
  updated_at: string;
}

export async function fetchSiteSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase.from('site_settings').select('*').order('setting_key');
  if (error) throw error;
  return data || [];
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from('site_settings').upsert({ setting_key: key, setting_value: value });
  if (error) throw error;
}

export async function getSetting(key: string, fallback?: string): Promise<string | null> {
  const { data } = await supabase.from('site_settings').select('setting_value').eq('setting_key', key).single();
  return data?.setting_value || fallback || null;
}

// ===================================================================
// 2. HERO CONTENT
// ===================================================================
export interface HeroContent {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  background_image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function fetchActiveHero(): Promise<HeroContent | null> {
  const { data, error } = await supabase.from('hero_content').select('*').eq('is_active', true).order('display_order').limit(1).single();
  if (error) return null;
  return data;
}

export async function fetchAllHeroContent(): Promise<HeroContent[]> {
  const { data, error } = await supabase.from('hero_content').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createHeroContent(hero: Partial<HeroContent>): Promise<string | null> {
  const { data, error } = await supabase.from('hero_content').insert(hero).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateHeroContent(id: string, updates: Partial<HeroContent>): Promise<void> {
  const { error } = await supabase.from('hero_content').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteHeroContent(id: string): Promise<void> {
  const { error } = await supabase.from('hero_content').delete().eq('id', id);
  if (error) throw error;
}

// ===================================================================
// 3. CONTACT INFO
// ===================================================================
export interface ContactInfo {
  id: string;
  label: string;
  value: string;
  icon_name?: string;
  link_url?: string;
  info_type: 'email' | 'phone' | 'address' | 'website' | 'general';
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export async function fetchVisibleContactInfo(): Promise<ContactInfo[]> {
  const { data, error } = await supabase.from('contact_info').select('*').eq('is_visible', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllContactInfo(): Promise<ContactInfo[]> {
  const { data, error } = await supabase.from('contact_info').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createContactInfo(contact: Partial<ContactInfo>): Promise<string | null> {
  const { data, error } = await supabase.from('contact_info').insert(contact).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateContactInfo(id: string, updates: Partial<ContactInfo>): Promise<void> {
  const { error } = await supabase.from('contact_info').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteContactInfo(id: string): Promise<void> {
  const { error } = await supabase.from('contact_info').delete().eq('id', id);
  if (error) throw error;
}

// ===================================================================
// 4. SOCIAL LINKS
// ===================================================================
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name?: string;
  username?: string;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export async function fetchVisibleSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase.from('social_links').select('*').eq('is_visible', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase.from('social_links').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createSocialLink(link: Partial<SocialLink>): Promise<string | null> {
  const { data, error } = await supabase.from('social_links').insert(link).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<void> {
  const { error } = await supabase.from('social_links').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteSocialLink(id: string): Promise<void> {
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) throw error;
}

// ===================================================================
// 5. SEO META
// ===================================================================
export interface SeoMeta {
  id: string;
  page_path: string;
  title?: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_card: string;
  canonical_url?: string;
  robots: string;
  structured_data?: any;
  updated_at: string;
}

export async function fetchSeoMeta(pagePath: string): Promise<SeoMeta | null> {
  const { data, error } = await supabase.from('seo_meta').select('*').eq('page_path', pagePath).single();
  if (error) return null;
  return data;
}

export async function fetchAllSeoMeta(): Promise<SeoMeta[]> {
  const { data, error } = await supabase.from('seo_meta').select('*').order('page_path');
  if (error) throw error;
  return data || [];
}

export async function upsertSeoMeta(seo: Partial<SeoMeta>): Promise<void> {
  const { error } = await supabase.from('seo_meta').upsert(seo);
  if (error) throw error;
}

// ===================================================================
// 6. EMAIL TEMPLATES
// ===================================================================
export interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables?: any;
  is_active: boolean;
  updated_at: string;
}

export async function fetchEmailTemplate(key: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase.from('email_templates').select('*').eq('template_key', key).eq('is_active', true).single();
  if (error) return null;
  return data;
}

export async function fetchAllEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase.from('email_templates').select('*').order('template_key');
  if (error) throw error;
  return data || [];
}

export async function updateEmailTemplate(key: string, updates: Partial<EmailTemplate>): Promise<void> {
  const { error } = await supabase.from('email_templates').update(updates).eq('template_key', key);
  if (error) throw error;
}

// ===================================================================
// 7. NAVIGATION ITEMS
// ===================================================================
export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon_name?: string;
  parent_id?: string;
  is_external: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export async function fetchVisibleNavigation(): Promise<NavigationItem[]> {
  const { data, error } = await supabase.from('navigation_items').select('*').eq('is_visible', true).is('parent_id', null).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllNavigation(): Promise<NavigationItem[]> {
  const { data, error } = await supabase.from('navigation_items').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createNavigationItem(item: Partial<NavigationItem>): Promise<string | null> {
  const { data, error } = await supabase.from('navigation_items').insert(item).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateNavigationItem(id: string, updates: Partial<NavigationItem>): Promise<void> {
  const { error } = await supabase.from('navigation_items').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationItem(id: string): Promise<void> {
  const { error } = await supabase.from('navigation_items').delete().eq('id', id);
  if (error) throw error;
}

// ===================================================================
// 8. FOOTER CONTENT
// ===================================================================
export interface FooterSection {
  id: string;
  title: string;
  content?: string;
  section_type: 'text' | 'links' | 'contact' | 'social';
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export interface FooterLink {
  id: string;
  section_id: string;
  label: string;
  url: string;
  is_external: boolean;
  display_order: number;
}

export async function fetchVisibleFooterSections(): Promise<FooterSection[]> {
  const { data, error } = await supabase.from('footer_sections').select('*').eq('is_visible', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchFooterLinks(sectionId: string): Promise<FooterLink[]> {
  const { data, error } = await supabase.from('footer_links').select('*').eq('section_id', sectionId).order('display_order');
  if (error) throw error;
  return data || [];
}

// ===================================================================
// 9. SKILLS
// ===================================================================
export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_url?: string;
  years_experience?: number;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export async function fetchVisibleSkills(): Promise<Skill[]> {
  const { data, error } = await supabase.from('skills').select('*').eq('is_visible', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchFeaturedSkills(): Promise<Skill[]> {
  const { data, error } = await supabase.from('skills').select('*').eq('is_visible', true).eq('is_featured', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllSkills(): Promise<Skill[]> {
  const { data, error } = await supabase.from('skills').select('*').order('category', { ascending: true }).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createSkill(skill: Partial<Skill>): Promise<string | null> {
  const { data, error } = await supabase.from('skills').insert(skill).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateSkill(id: string, updates: Partial<Skill>): Promise<void> {
  const { error } = await supabase.from('skills').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
}

// ===================================================================
// 10. ACHIEVEMENTS/STATS
// ===================================================================
export interface Achievement {
  id: string;
  label: string;
  value: string;
  icon_name?: string;
  description?: string;
  is_visible: boolean;
  display_order: number;
  created_at: string;
}

export async function fetchVisibleAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from('achievements').select('*').eq('is_visible', true).order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from('achievements').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createAchievement(achievement: Partial<Achievement>): Promise<string | null> {
  const { data, error } = await supabase.from('achievements').insert(achievement).select('id').single();
  if (error) throw error;
  return data?.id || null;
}

export async function updateAchievement(id: string, updates: Partial<Achievement>): Promise<void> {
  const { error } = await supabase.from('achievements').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) throw error;
}
