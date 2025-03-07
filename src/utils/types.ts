
export type FeatureStatus = 'planned' | 'in-progress' | 'completed';

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRequestInput {
  title: string;
  description: string;
}
