import { supabase } from '../services/supabaseClient';

// Types
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  tags: string[];
  source: string;
  last_contacted_at?: string;
  converted_at?: string;
  converted_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  note: string;
  created_by?: string;
  created_at: string;
}

export interface InquiryActivity {
  id: string;
  inquiry_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export interface InquiryFunnel {
  new_count: number;
  contacted_count: number;
  qualified_count: number;
  proposal_sent_count: number;
  negotiating_count: number;
  won_count: number;
  lost_count: number;
  conversion_rate: number;
  total_revenue: number;
}

// Fetch all inquiries with optional filters
export async function fetchInquiries(filters?: {
  status?: string;
  service?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Inquiry[]> {
  let query = supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.service && filters.service !== 'all') {
    query = query.eq('service', filters.service);
  }

  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }

  return data || [];
}

// Fetch single inquiry with notes and activities
export async function fetchInquiryById(id: string): Promise<{
  inquiry: Inquiry;
  notes: InquiryNote[];
  activities: InquiryActivity[];
} | null> {
  const [inquiryResult, notesResult, activitiesResult] = await Promise.all([
    supabase.from('inquiries').select('*').eq('id', id).single(),
    supabase.from('inquiry_notes').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }),
    supabase.from('inquiry_activities').select('*').eq('inquiry_id', id).order('created_at', { ascending: false })
  ]);

  if (inquiryResult.error) {
    console.error('Error fetching inquiry:', inquiryResult.error);
    return null;
  }

  return {
    inquiry: inquiryResult.data,
    notes: notesResult.data || [],
    activities: activitiesResult.data || []
  };
}

// Update inquiry status
export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<void> {
  const updates: any = { status };

  if (status === 'contacted' || status === 'qualified') {
    updates.last_contacted_at = new Date().toISOString();
  }

  if (status === 'won') {
    updates.converted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('inquiries')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
}

// Update inquiry priority
export async function updateInquiryPriority(id: string, priority: Inquiry['priority']): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ priority })
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry priority:', error);
    throw error;
  }
}

// Update inquiry tags
export async function updateInquiryTags(id: string, tags: string[]): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ tags })
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry tags:', error);
    throw error;
  }
}

// Update inquiry converted value
export async function updateInquiryValue(id: string, value: number): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ converted_value: value })
    .eq('id', id);

  if (error) {
    console.error('Error updating inquiry value:', error);
    throw error;
  }
}

// Add note to inquiry
export async function addInquiryNote(inquiryId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('inquiry_notes')
    .insert({
      inquiry_id: inquiryId,
      note
    });

  if (error) {
    console.error('Error adding inquiry note:', error);
    throw error;
  }

  // Also log activity
  await supabase
    .from('inquiry_activities')
    .insert({
      inquiry_id: inquiryId,
      activity_type: 'note_added',
      description: 'Added a note',
      metadata: { note_preview: note.substring(0, 100) }
    });
}

// Delete inquiry
export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
}

// Archive inquiry (soft delete)
export async function archiveInquiry(id: string): Promise<void> {
  await updateInquiryStatus(id, 'archived');
}

// Get inquiry statistics
export async function getInquiryStats(): Promise<{
  total: number;
  new: number;
  contacted: number;
  won: number;
  lost: number;
  conversionRate: number;
}> {
  const { data, error } = await supabase
    .from('inquiries')
    .select('status');

  if (error) {
    console.error('Error fetching inquiry stats:', error);
    throw error;
  }

  const total = data.length;
  const new_count = data.filter(i => i.status === 'new').length;
  const contacted = data.filter(i => i.status === 'contacted').length;
  const won = data.filter(i => i.status === 'won').length;
  const lost = data.filter(i => i.status === 'lost').length;
  const conversionRate = total > 0 ? (won / total) * 100 : 0;

  return {
    total,
    new: new_count,
    contacted,
    won,
    lost,
    conversionRate
  };
}

// Get conversion funnel
export async function getConversionFunnel(): Promise<InquiryFunnel | null> {
  const { data, error } = await supabase
    .from('inquiry_funnel')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching conversion funnel:', error);
    return null;
  }

  return data;
}

// Export inquiries to CSV
export function exportInquiriesToCSV(inquiries: Inquiry[]): void {
  const headers = [
    'Date',
    'Name',
    'Email',
    'Phone',
    'Service',
    'Budget',
    'Timeline',
    'Status',
    'Priority',
    'Message'
  ];

  const rows = inquiries.map(inquiry => [
    new Date(inquiry.created_at).toLocaleDateString(),
    inquiry.name,
    inquiry.email,
    inquiry.phone,
    inquiry.service,
    inquiry.budget,
    inquiry.timeline,
    inquiry.status,
    inquiry.priority,
    `"${inquiry.message.replace(/"/g, '""')}"` // Escape quotes in message
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `inquiries_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Subscribe to real-time inquiry updates
export function subscribeToInquiries(callback: (inquiry: Inquiry) => void) {
  const channel = supabase
    .channel('inquiries_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'inquiries'
      },
      (payload) => {
        callback(payload.new as Inquiry);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
