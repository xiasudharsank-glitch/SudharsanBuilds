import { supabase } from '../lib/supabase';
import type { Project, TechStack, ClientTestimonial } from '../data/projectsData';

// Database types (matches Supabase schema)
export interface DBProject {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'client' | 'personal' | 'open-source' | 'freelance';
  status: 'completed' | 'in-progress' | 'on-hold';
  role: string;
  tags: string[];
  start_date: string;
  end_date?: string;
  featured: boolean;
  client_name?: string;
  github_url?: string;
  case_study_url?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends DBProject {
  tech_stack: TechStack[];
  screenshots: string[];
  key_achievements: string[];
  challenges: string[];
  client_testimonial?: ClientTestimonial;
}

// Fetch all published projects with full details
export async function fetchPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects_with_details')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  // Transform database format to frontend format
  return (data || []).map(transformDBToProject);
}

// Fetch a single project by ID
export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects_with_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data ? transformDBToProject(data) : null;
}

// Fetch projects by type
export async function fetchProjectsByType(type: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects_with_details')
    .select('*')
    .eq('type', type)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching projects by type:', error);
    throw error;
  }

  return (data || []).map(transformDBToProject);
}

// Fetch featured projects
export async function fetchFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects_with_details')
    .select('*')
    .eq('featured', true)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured projects:', error);
    throw error;
  }

  return (data || []).map(transformDBToProject);
}

// Admin: Fetch all projects (including unpublished)
export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects_with_details')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }

  return (data || []).map(transformDBToProject);
}

// Admin: Create a new project
export async function createProject(project: Partial<Project>): Promise<string | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: project.title,
      description: project.description,
      link: project.link,
      type: project.type,
      status: project.status,
      role: project.role,
      tags: project.tags || [],
      start_date: project.startDate,
      end_date: project.endDate,
      featured: project.featured || false,
      client_name: project.clientName,
      github_url: project.githubUrl,
      case_study_url: project.caseStudyUrl,
      display_order: 0,
      is_published: false
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  const projectId = data?.id;

  // Insert related data
  if (projectId) {
    await Promise.all([
      insertTechStack(projectId, project.techStack || []),
      insertScreenshots(projectId, project.screenshots || []),
      insertKeyAchievements(projectId, project.keyAchievements || []),
      insertChallenges(projectId, project.challenges || []),
      project.clientTestimonial && insertTestimonial(projectId, project.clientTestimonial)
    ]);
  }

  return projectId;
}

// Admin: Update an existing project
export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      title: project.title,
      description: project.description,
      link: project.link,
      type: project.type,
      status: project.status,
      role: project.role,
      tags: project.tags,
      start_date: project.startDate,
      end_date: project.endDate,
      featured: project.featured,
      client_name: project.clientName,
      github_url: project.githubUrl,
      case_study_url: project.caseStudyUrl,
      is_published: project.featured !== undefined ? true : undefined
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  // Update related data (delete and re-insert)
  await deleteRelatedData(id);
  await Promise.all([
    insertTechStack(id, project.techStack || []),
    insertScreenshots(id, project.screenshots || []),
    insertKeyAchievements(id, project.keyAchievements || []),
    insertChallenges(id, project.challenges || []),
    project.clientTestimonial && insertTestimonial(id, project.clientTestimonial)
  ]);
}

// Admin: Delete a project
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Admin: Toggle project published status
export async function toggleProjectPublished(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ is_published: isPublished })
    .eq('id', id);

  if (error) {
    console.error('Error toggling project published status:', error);
    throw error;
  }
}

// Admin: Update project display order
export async function updateProjectOrder(id: string, displayOrder: number): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ display_order: displayOrder })
    .eq('id', id);

  if (error) {
    console.error('Error updating project order:', error);
    throw error;
  }
}

// Image upload to Supabase Storage
export async function uploadProjectImage(file: File, projectId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Delete image from Supabase Storage
export async function deleteProjectImage(imageUrl: string): Promise<void> {
  // Extract path from URL
  const path = imageUrl.split('/project-images/')[1];

  if (!path) {
    console.error('Invalid image URL:', imageUrl);
    return;
  }

  const { error } = await supabase.storage
    .from('project-images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Helper functions for inserting related data
async function insertTechStack(projectId: string, techStack: TechStack[]): Promise<void> {
  if (techStack.length === 0) return;

  const { error } = await supabase
    .from('project_tech_stack')
    .insert(
      techStack.map((tech, index) => ({
        project_id: projectId,
        name: tech.name,
        icon: tech.icon,
        display_order: index
      }))
    );

  if (error) {
    console.error('Error inserting tech stack:', error);
    throw error;
  }
}

async function insertScreenshots(projectId: string, screenshots: string[]): Promise<void> {
  if (screenshots.length === 0) return;

  const { error } = await supabase
    .from('project_screenshots')
    .insert(
      screenshots.map((url, index) => ({
        project_id: projectId,
        image_url: url,
        display_order: index
      }))
    );

  if (error) {
    console.error('Error inserting screenshots:', error);
    throw error;
  }
}

async function insertKeyAchievements(projectId: string, achievements: string[]): Promise<void> {
  if (achievements.length === 0) return;

  const { error } = await supabase
    .from('project_key_achievements')
    .insert(
      achievements.map((achievement, index) => ({
        project_id: projectId,
        achievement,
        display_order: index
      }))
    );

  if (error) {
    console.error('Error inserting key achievements:', error);
    throw error;
  }
}

async function insertChallenges(projectId: string, challenges: string[]): Promise<void> {
  if (challenges.length === 0) return;

  const { error} = await supabase
    .from('project_challenges')
    .insert(
      challenges.map((challenge, index) => ({
        project_id: projectId,
        challenge,
        display_order: index
      }))
    );

  if (error) {
    console.error('Error inserting challenges:', error);
    throw error;
  }
}

async function insertTestimonial(projectId: string, testimonial: ClientTestimonial): Promise<void> {
  const { error } = await supabase
    .from('project_testimonials')
    .insert({
      project_id: projectId,
      text: testimonial.text,
      client_name: testimonial.name,
      client_role: testimonial.role
    });

  if (error) {
    console.error('Error inserting testimonial:', error);
    throw error;
  }
}

async function deleteRelatedData(projectId: string): Promise<void> {
  await Promise.all([
    supabase.from('project_tech_stack').delete().eq('project_id', projectId),
    supabase.from('project_screenshots').delete().eq('project_id', projectId),
    supabase.from('project_key_achievements').delete().eq('project_id', projectId),
    supabase.from('project_challenges').delete().eq('project_id', projectId),
    supabase.from('project_testimonials').delete().eq('project_id', projectId)
  ]);
}

// Transform database format to frontend format
function transformDBToProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    link: dbProject.link,
    type: dbProject.type,
    status: dbProject.status,
    role: dbProject.role,
    techStack: Array.isArray(dbProject.tech_stack) ? dbProject.tech_stack : [],
    tags: dbProject.tags || [],
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    featured: dbProject.featured,
    clientName: dbProject.client_name,
    githubUrl: dbProject.github_url,
    caseStudyUrl: dbProject.case_study_url,
    screenshots: Array.isArray(dbProject.screenshots) ? dbProject.screenshots : [],
    keyAchievements: Array.isArray(dbProject.key_achievements) ? dbProject.key_achievements : [],
    challenges: Array.isArray(dbProject.challenges) ? dbProject.challenges : [],
    clientTestimonial: dbProject.client_testimonial
  };
}
