// User type definition
export type User = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "user" | "domain_lead" | "super_domain_admin";
  assignedDomains?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Auth response type
export type AuthResponse = {
  success: boolean;
  user: User;
  accessToken: string;
};

// Login credentials type
export type LoginCredentials = {
  email: string;
  password: string;
};

// Member type definition
export type Member = {
  _id: string;
  name: string;
  email_id: string;
  mobile_number: string;
  department: string;
  designation: string;
  batch: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  isActive?: boolean;
  profile_image: {
    public_id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Optional unique key for rendering (to handle duplicate members in different categories)
  uniqueKey?: string;
};

// Tech team structure
export type TechTeam = {
  webDeveloper: Member[];
  appDeveloper: Member[];
  machineLearning: Member[];
  techMember: Member[];
};

// Media team structure
export type MediaTeam = {
  videoEditor: Member[];
  graphicDesigner: Member[];
  contentWriter: Member[];
  photographer: Member[];
};

// Members response type
export type MembersResponse = {
  success: boolean;
  members: {
    coreTeam: Member[];
    techTeam: TechTeam;
    mediaTeam: MediaTeam;
    prTeam: Member[];
  };
};

// Admin all members (flat) response with counts
export type MembersAdminAllResponse = {
  success: boolean;
  members: Member[];
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
};

// Single member response type
export type MemberResponse = {
  success: boolean;
  member: Member;
};

// API response wrapper type
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

// New member form data type
export type NewMemberFormData = {
  name: string;
  email_id: string;
  mobile_number: string; // Added field
  department: string;
  designation: string;
  batch: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  profile_image?: File;
};

// Event type definition
export type Event = {
  _id: string;
  name: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  category: string;
  registrationFee: string;
  upiID: string;
  details: string;
  is_upcoming: boolean;
  registration_open: boolean;
  eventBanner?: {
    public_id: string;
    url: string;
  };
  poster?: {
    public_id: string;
    url: string;
  };
  contactInfo: Array<{
    _id?: string;
    name: string;
    mobile: string;
    year: string;
  }>;
  gallery: Array<{
    _id?: string;
    public_id: string;
    url: string;
  }>;
  faq: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Events response type
export type EventsResponse = {
  success: boolean;
  events: Event[];
};

// Event participants response type
export type EventParticipantsResponse = {
  success: boolean;
  totalParticipants: number;
  participants: Array<{
    _id: string;
    user: string;
    event: string;
    name: string;
    classRollNo: string;
    department: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
};

// Recruitment Form Types
export type IFormField = {
  _id?: string;
  fieldName: string;
  fieldType: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type IRoleDefinition = {
  _id?: string;
  roleName: string;
  description?: string;
  fields: IFormField[];
  whatsappLink?: string;
};

export type RecruitmentForm = {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  roles: IRoleDefinition[];
  createdAt: string;
  updatedAt: string;
};

export type RecruitmentFormsResponse = {
  success: boolean;
  forms: RecruitmentForm[];
};

export type RecruitmentFormResponse = {
  success: boolean;
  form: RecruitmentForm;
};

// ========== SUPER ADMIN TYPES ==========

// Admin user type (for super admin management)
export type Admin = {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "domain_lead" | "super_domain_admin";
  assignedDomains?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// Activity log type
export type ActivityLog = {
  _id: string;
  admin: string | Admin;
  action: "add_admin" | "remove_admin" | "shortlist" | "reject" | "accept" | "update_status";
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  domain?: string;
  oldStatus?: string;
  newStatus?: string;
  targetAdminId?: string;
  targetAdminEmail?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

// Add admin request
export type AddAdminRequest = {
  name: string;
  email: string;
  password?: string;
};

// Add admin response
export type AddAdminResponse = {
  success: boolean;
  message: string;
  admin: Admin & { password?: string };
};

// Get admins response
export type GetAdminsResponse = {
  success: boolean;
  admins: Admin[];
};

// Activity logs response
export type ActivityLogsResponse = {
  success: boolean;
  logs: ActivityLog[];
  totalLogs: number;
  page: number;
  limit: number;
};

// Activity logs summary response
export type ActivityLogsSummaryResponse = {
  success: boolean;
  summary: {
    totalActions: number;
    adminCount: number;
    actionCounts: Record<string, number>;
    timestampRange: {
      from: string;
      to: string;
    };
  };
};
