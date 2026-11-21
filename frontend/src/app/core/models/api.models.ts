/** Types mirroring the Django REST API (`/api/`). Decimal fields arrive as strings. */

export type PricingCategory = 'jednorazove' | 'permanentky' | 'pozicovna';
export type CourseCategory = 'zaciatocnici' | 'lano_istenie' | 'deti_mladez' | 'treningy';
export type SkillLevel = 'uplny_zaciatocnik' | 'mierne_pokrocily' | 'vsetky_urovne';
export type ExperienceLevel = 'ziadne' | 'zaklady' | 'pokrocily';
export type EventType = 'teambuilding' | 'narodeniny' | 'skola' | 'sukromny_trening';
export type EstimatorKey =
  | 'adult_entry'
  | 'student_entry'
  | 'child_entry'
  | 'family_entry'
  | 'pass_10'
  | 'shoes_rental'
  | 'rope_set_rental';

export interface ClimbingZone {
  id: number;
  name: string;
  slug: string;
  max_height_meters: string | null;
  wall_area_sqm: number | null;
  routes_count_label: string;
  difficulty_scale: string;
  description: string;
  image_url: string;
  display_order: number;
  updated_at: string;
}

export interface PricingPass {
  id: number;
  category: PricingCategory;
  category_label: string;
  title: string;
  subtitle_note: string;
  price_eur: string;
  is_popular: boolean;
  estimator_key: EstimatorKey | null;
  display_order: number;
}

export interface ClimbingCourse {
  id: number;
  title: string;
  slug: string;
  category: CourseCategory;
  category_label: string;
  skill_level: SkillLevel;
  skill_level_label: string;
  duration_label: string;
  schedule_info: string;
  price_eur: string;
  includes_equipment: boolean;
  short_description: string;
  image_url: string;
  is_featured: boolean;
}

export interface ClimbingCourseDetail extends ClimbingCourse {
  target_audience: string;
  detailed_description: string;
  what_you_will_learn: string[];
}

export interface CoachMember {
  id: number;
  full_name: string;
  role_title: string;
  certifications: string;
  bio: string;
  photo_url: string;
  display_order: number;
}

export interface CourseFilters {
  category?: CourseCategory | null;
  skill_level?: SkillLevel | null;
  featured?: boolean;
  search?: string;
  ordering?: string;
}

export interface CourseRegistrationPayload {
  course: string;
  participant_name: string;
  participant_age: number | null;
  experience_level: ExperienceLevel;
  preferred_schedule_note: string;
  contact_name: string;
  email: string;
  phone: string;
  notes: string;
  gdpr_consent: boolean;
}

export interface GroupEventPayload {
  event_type: EventType;
  estimated_participants: number;
  preferred_date: string;
  group_or_company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  gdpr_consent: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  gdpr_consent: boolean;
}

/** DRF validation error body: field name → list of messages. */
export type ApiFieldErrors = Record<string, string[]>;
