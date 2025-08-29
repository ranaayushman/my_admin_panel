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
