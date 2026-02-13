export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface Employee {
  id: string;
  name: string;
  empNumber: string;
  designation: string;
  department: string;
  validTill: string;
  photo?: string; // Base64 string
  customFields: CustomField[];
  createdAt: number;
}

export interface AdminSettings {
  username: string;
  passwordHash: string; // Storing as plain text for this demo, but named hash for semantics
}

export interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}
