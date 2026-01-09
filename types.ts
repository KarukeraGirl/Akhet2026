
export type Category = 'Finance' | 'Lecture' | 'Voyage' | 'Connaissance' | 'Sport' | 'Santé' | 'Rappels';

export type BookStatus = 'À lire' | 'En cours' | 'Lu';

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  status: BookStatus;
  addedAt: string;
}

export type TravelStatus = 'À organiser' | 'Organisé' | 'Effectué' | 'Annulé' | 'Reporté';
export type TravelMotive = 'Vacances' | 'Sport' | 'Autre';

export interface Trip {
  id: string;
  country: string;
  countryCode: string;
  flagUrl: string;
  bgImageUrl: string;
  status: TravelStatus;
  motive: TravelMotive;
  duration: number;
  startDate: string;
  comment: string;
  lat?: number;
  lng?: number;
}

export type CertificationStatus = 'À réaliser' | 'En cours' | 'Examen planifié' | 'Réussie' | 'Échouée';

export interface Certification {
  id: string;
  title: string;
  deadline: string;
  comment: string;
  status: CertificationStatus;
}

export type TrainingStatus = 'À faire' | 'En cours' | 'Terminé';

export interface Training {
  id: string;
  title: string;
  description: string;
  platformUrl: string;
  startDate: string;
  endDate: string;
  comment: string;
  status: TrainingStatus;
}

export type WatchType = 'Newsletter' | 'Podcast' | 'Vidéo';

export interface ActiveWatch {
  id: string;
  title: string;
  type: WatchType;
  date: string;
}

export interface IoTProject {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  linkUrl: string;
}

export type RunSlot = 'r1' | 'r2' | 'r3' | 'r4';

export interface WeeklyRun {
  week: number;
  r1: boolean; // Mandatory 1
  r2: boolean; // Mandatory 2
  r3: boolean; // Facultative 1
  r4: boolean; // Facultative 2
}

export type GymSessionType = 'Cours' | 'Libre';

export interface GymSession {
  id: string;
  type: GymSessionType;
  title: string;
  date: string;
}

export interface Goal {
  id: string;
  category: Category;
  title: string;
  month: number; // 1-12
  completed: boolean;
  type: 'recurring' | 'once';
  amount?: number; // Optional amount for financial goals
  comment?: string; // Optional comment/notes for goals
  day?: number;    // Specific day of the month (1-31)
  date?: string;   // Specific full date (YYYY-MM-DD)
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  threshold: number; // Completion percentage 0-100
  unlocked: boolean;
  icon: string;
  category?: Category; // Optional: if null, it's a global reward
}

export interface MonthlyTheme {
  name: string;
  motif: string;
  color: string;
}
