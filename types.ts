export enum StudentStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Graduated = 'Graduated',
  Inactive = 'Inactive'
}

export interface Student {
  id: string;
  fullName: string;
  studentId: string;
  department: string;
  email: string;
  photoUrl: string;
  validUntil: string;
  status: StudentStatus;
  emergencyContact: string;
  bloodType?: string;
}

export interface VerificationResult {
  verified: boolean;
  message: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}