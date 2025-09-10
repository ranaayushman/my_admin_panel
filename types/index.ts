// User type definition
export type User = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
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
  department: string;
  designation: string;
  batch: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
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
