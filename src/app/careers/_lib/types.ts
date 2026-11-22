export type EmploymentType = "full_time" | "part_time" | "internship" | "contract";
export type RoleStatus = "draft" | "open" | "closed";
export type ApplicationStatus = "new" | "reviewing" | "interview" | "offer" | "rejected";

export interface PublicRole {
  id: string;
  title: string;
  employment_type: EmploymentType;
  location: string;
  pay: string | null;
  description: string;
  updated_at: string;
}

export interface AdminRole extends PublicRole {
  status: RoleStatus;
  created_at: string;
  created_by: string;
  updated_by: string;
  application_count: number;
}

export interface ApplicationSummary {
  id: string;
  role_id: string | null;
  role_title: string;
  name: string;
  email: string;
  status: ApplicationStatus;
  created_at: string;
}

export interface ApplicationNote {
  author_email: string;
  text: string;
  created_at: string;
}

export interface StatusChange {
  from: ApplicationStatus;
  to: ApplicationStatus;
  by: string;
  at: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  phone: string | null;
  link: string | null;
  why: string;
  resume_filename: string;
  resume_size: number;
  notes: ApplicationNote[];
  history: StatusChange[];
}

export interface RoleInput {
  title: string;
  employment_type: EmploymentType;
  location: string;
  pay: string | null;
  description: string;
  status?: RoleStatus;
}
