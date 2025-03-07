
export type FeatureStatus = 'planned' | 'in-progress' | 'completed';

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  votes: number;
  votedBy: Set<string>; // Track which users have voted
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRequestInput {
  title: string;
  description: string;
}

export interface OutsetaUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}
