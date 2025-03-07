
import { Feature } from './types';

export const initialFeatures: Feature[] = [
  {
    id: '1',
    title: 'Dark Mode',
    description: 'Add support for dark mode throughout the application.',
    status: 'planned',
    votes: 42,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
  },
  {
    id: '2',
    title: 'Mobile App',
    description: 'Create native mobile apps for iOS and Android platforms.',
    status: 'planned',
    votes: 38,
    createdAt: new Date('2023-05-18'),
    updatedAt: new Date('2023-05-18'),
  },
  {
    id: '3',
    title: 'CSV Export',
    description: 'Add ability to export data to CSV format for offline analysis.',
    status: 'in-progress',
    votes: 27,
    createdAt: new Date('2023-04-25'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '4',
    title: 'User Profiles',
    description: 'Enhanced user profiles with additional customization options.',
    status: 'in-progress',
    votes: 19,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-05-05'),
  },
  {
    id: '5',
    title: 'Email Notifications',
    description: 'Send email notifications for important events and updates.',
    status: 'completed',
    votes: 31,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-04-20'),
  },
  {
    id: '6',
    title: 'Two-Factor Authentication',
    description: 'Enhance security with two-factor authentication support.',
    status: 'completed',
    votes: 35,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-04-10'),
  },
];
