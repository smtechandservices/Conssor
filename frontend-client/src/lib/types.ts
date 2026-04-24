export interface ClientProfile {
  id: string;
  organization_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  country: string;
  domain_tags: string[];
  engagement_scope: string[];
  project_stage: string;
  budget_range: string;
  project_summary?: string;
  assignment_status: string;
  onboarded_at: string;
}

export interface Stats {
  active_engagements: number;
  pending_quotes: number;
  total_spend_usd: number;
}

export interface Quote {
  id: string;
  scope: string[];
  stage: string;
  ai_recommended_price: number;
  ai_price_range_low: number;
  ai_price_range_high: number;
  ai_rationale: string;
  ai_scope_of_work: string;
  ai_confidence_score: number;
  ai_estimated_weeks: number;
  final_price: number;
  status: string;
  created_at: string;
}

export interface Consultant {
  full_name: string;
  email: string;
  bio: string;
  years_experience: number;
  domain_expertise: string[];
  rating: number;
  linkedin_url: string;
}

export interface Milestone {
  id: string;
  name: string;
  due_date: string;
  status: string;
  owner: string;
  notes: string;
}

export interface Engagement {
  id: string;
  scope: string[];
  stage: string;
  status: string;
  start_date: string;
  end_date: string | null;
  consultant: Consultant | null;
  milestones: Milestone[];
}

export interface StoredClient {
  client_id: string;
  email: string;
  name: string;
  organization?: string;
}
