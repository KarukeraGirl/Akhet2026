
import React from 'react';
import { MonthlyTheme, Category, Reward } from './types';
import { 
  PiggyBank, BookOpen, Plane, Brain, Dumbbell, HeartPulse, 
  Crown, Star, Award, Shield, Sun, Eye, Bell
} from 'lucide-react';

export const CATEGORIES: { name: Category; icon: React.ReactNode; color: string }[] = [
  { name: 'Finance', icon: <PiggyBank size={20} />, color: 'text-amber-500' },
  { name: 'Lecture', icon: <BookOpen size={20} />, color: 'text-blue-500' },
  { name: 'Voyage', icon: <Plane size={20} />, color: 'text-emerald-500' },
  { name: 'Connaissance', icon: <Brain size={20} />, color: 'text-purple-500' },
  { name: 'Sport', icon: <Dumbbell size={20} />, color: 'text-orange-500' },
  { name: 'Santé', icon: <HeartPulse size={20} />, color: 'text-rose-500' },
  { name: 'Rappels', icon: <Bell size={20} />, color: 'text-cyan-500' },
];

export const MONTHS: MonthlyTheme[] = [
  { name: 'Janvier', motif: 'Eye of Horus', color: '#1a3a5a' },
  { name: 'Février', motif: 'Scarabaeus', color: '#5a2a1a' },
  { name: 'Mars', motif: 'Ankh Cross', color: '#1a5a3a' },
  { name: 'Avril', motif: 'Lotus Flower', color: '#5a1a3a' },
  { name: 'Mai', motif: 'Pyramid', color: '#5a4a1a' },
  { name: 'Juin', motif: 'Ra Sun', color: '#1a5a5a' },
  { name: 'Juillet', motif: 'Scepter', color: '#3a1a5a' },
  { name: 'Août', motif: 'Djed Pillar', color: '#5a1a1a' },
  { name: 'Septembre', motif: 'Papyrus', color: '#4a5a1a' },
  { name: 'Octobre', motif: 'Sphinx', color: '#1a1a5a' },
  { name: 'Novembre', motif: 'Winged Isis', color: '#1a5a2a' },
  { name: 'Décembre', motif: 'Obelisk', color: '#2a2a2a' },
];

export const INITIAL_REWARDS: Reward[] = [
  // Global Rewards
  { id: 'g1', title: 'Scribe Royal', description: 'Atteindre 25% des objectifs annuels', threshold: 25, unlocked: false, icon: '📜' },
  { id: 'g2', title: 'Grand Prêtre', description: 'Atteindre 50% des objectifs annuels', threshold: 50, unlocked: false, icon: '⚖️' },
  { id: 'g3', title: 'Pharaon de l\'Horizon', description: 'Atteindre 75% des objectifs annuels', threshold: 75, unlocked: false, icon: '👑' },
  { id: 'g4', title: 'Divinité de l\'Akhet', description: 'Réussir tous les objectifs 2026', threshold: 100, unlocked: false, icon: '🌅' },
  
  // Category Specific - Finance
  { id: 'f1', category: 'Finance', title: 'Porteur d\'Offrandes', description: '33% des objectifs financiers', threshold: 33, unlocked: false, icon: '🏺' },
  { id: 'f2', category: 'Finance', title: 'Scribe du Trésor', description: '66% des objectifs financiers', threshold: 66, unlocked: false, icon: '💎' },
  { id: 'f3', category: 'Finance', title: 'Grand Argentier', description: '100% des objectifs financiers', threshold: 100, unlocked: false, icon: '💰' },

  // Category Specific - Santé
  { id: 'h1', category: 'Santé', title: 'Herboriste du Palais', description: '33% des objectifs santé', threshold: 33, unlocked: false, icon: '🌿' },
  { id: 'h2', category: 'Santé', title: 'Prêtre de Sekhmet', description: '66% des objectifs santé', threshold: 66, unlocked: false, icon: '🦁' },
  { id: 'h3', category: 'Santé', title: 'Élu d\'Imhotep', description: '100% des objectifs santé', threshold: 100, unlocked: false, icon: '⚕️' },

  // Category Specific - Sport
  { id: 's1', category: 'Sport', title: 'Archer Royal', description: '33% des objectifs sportifs', threshold: 33, unlocked: false, icon: '🏹' },
  { id: 's2', category: 'Sport', title: 'Guerrier de Koush', description: '66% des objectifs sportifs', threshold: 66, unlocked: false, icon: '🛡️' },
  { id: 's3', category: 'Sport', title: 'Hercule de l\'Oasis', description: '100% des objectifs sportifs', threshold: 100, unlocked: false, icon: '🦁' },

  // Category Specific - Lecture (Calculé sur 12 livres)
  { id: 'l1', category: 'Lecture', title: 'Apprenti Scribe', description: '4 livres lus', threshold: 33, unlocked: false, icon: '📝' },
  { id: 'l2', category: 'Lecture', title: 'Liseur de Papyrus', description: '8 livres lus', threshold: 66, unlocked: false, icon: '📚' },
  { id: 'l3', category: 'Lecture', title: 'Thot l\'Érudit', description: '12 livres lus', threshold: 100, unlocked: false, icon: '🦉' },

  // Category Specific - Voyage (Calculé sur 4 voyages)
  { id: 'v1', category: 'Voyage', title: 'Nomade du Nil', description: '1 voyage effectué', threshold: 25, unlocked: false, icon: '🛶' },
  { id: 'v2', category: 'Voyage', title: 'Explorateur de Pount', description: '2 voyages effectués', threshold: 50, unlocked: false, icon: '🚢' },
  { id: 'v3', category: 'Voyage', title: 'Maître des Terres', description: '4 voyages effectués', threshold: 100, unlocked: false, icon: '🌍' },
];
