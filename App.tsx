
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Calendar as CalendarIcon, 
  Settings, Bell, Gift, Menu, X, 
  ChevronLeft, ChevronRight,
  TrendingUp, Activity, Map as MapIcon, GraduationCap,
  Plus, CheckCircle, Circle, Trash2, Camera, Sun,
  Save, Download, Upload, Trash, PiggyBank, BookOpen, Dumbbell, Sparkles
} from 'lucide-react';
import { CATEGORIES, MONTHS, INITIAL_REWARDS } from './constants';
import { Category, Goal, Book, Trip, Reward, Certification, IoTProject, Training, ActiveWatch, WeeklyRun, GymSession, RunSlot } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import FinanceView from './components/FinanceView';
import ReadingView from './components/ReadingView';
import TravelView from './components/TravelView';
import KnowledgeView from './components/KnowledgeView';
import SportView from './components/SportView';
import HealthView from './components/HealthView';
import RemindersView from './components/RemindersView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings' | Category>('dashboard');
  
  // State Initialization from LocalStorage
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(`akhet_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('goals', []));
  const [books, setBooks] = useState<Book[]>(() => getInitialState('books', []));
  const [trips, setTrips] = useState<Trip[]>(() => getInitialState('trips', []));
  const [certifications, setCertifications] = useState<Certification[]>(() => getInitialState('certifications', [
    { id: 'cert-1', title: '', deadline: '', comment: '', status: 'À réaliser' },
    { id: 'cert-2', title: '', deadline: '', comment: '', status: 'À réaliser' }
  ]));
  const [trainings, setTrainings] = useState<Training[]>(() => getInitialState('trainings', [
    { id: 'train-1', title: '', description: '', platformUrl: '', startDate: '', endDate: '', comment: '', status: 'À faire' },
    { id: 'train-2', title: '', description: '', platformUrl: '', startDate: '', endDate: '', comment: '', status: 'À faire' },
    { id: 'train-3', title: '', description: '', platformUrl: '', startDate: '', endDate: '', comment: '', status: 'À faire' },
    { id: 'train-4', title: '', description: '', platformUrl: '', startDate: '', endDate: '', comment: '', status: 'À faire' }
  ]));
  const [iotProjects, setIotProjects] = useState<IoTProject[]>(() => getInitialState('iotProjects', [
    { id: 'iot-1', title: '', description: '', startDate: '', endDate: '', linkUrl: '' },
    { id: 'iot-2', title: '', description: '', startDate: '', endDate: '', linkUrl: '' }
  ]));
  
  const [weeklyRuns, setWeeklyRuns] = useState<WeeklyRun[]>(() => getInitialState('weeklyRuns', 
    Array.from({ length: 52 }, (_, i) => ({ week: i + 1, r1: false, r2: false, r3: false, r4: false }))
  ));
  const [gymSessions, setGymSessions] = useState<GymSession[]>(() => getInitialState('gymSessions', []));
  const [darebeeUrl, setDarebeeUrl] = useState<string>(() => getInitialState('darebeeUrl', ''));
  const [activeWatches, setActiveWatches] = useState<ActiveWatch[]>(() => getInitialState('activeWatches', []));
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebratedFirst, setHasCelebratedFirst] = useState(() => localStorage.getItem('akhet_celebrated_first') === 'true');

  // Persistent Sync Effect
  useEffect(() => {
    localStorage.setItem('akhet_goals', JSON.stringify(goals));
    localStorage.setItem('akhet_books', JSON.stringify(books));
    localStorage.setItem('akhet_trips', JSON.stringify(trips));
    localStorage.setItem('akhet_certifications', JSON.stringify(certifications));
    localStorage.setItem('akhet_trainings', JSON.stringify(trainings));
    localStorage.setItem('akhet_iotProjects', JSON.stringify(iotProjects));
    localStorage.setItem('akhet_weeklyRuns', JSON.stringify(weeklyRuns));
    localStorage.setItem('akhet_gymSessions', JSON.stringify(gymSessions));
    localStorage.setItem('akhet_darebeeUrl', JSON.stringify(darebeeUrl));
    localStorage.setItem('akhet_activeWatches', JSON.stringify(activeWatches));
  }, [goals, books, trips, certifications, trainings, iotProjects, weeklyRuns, gymSessions, darebeeUrl, activeWatches]);

  // Logic to detect first goal ever
  useEffect(() => {
    if (!hasCelebratedFirst) {
      const completedCount = goals.filter(g => g.completed).length;
      if (completedCount === 1) {
        setShowCelebration(true);
        setHasCelebratedFirst(true);
        localStorage.setItem('akhet_celebrated_first', 'true');
      }
    }
  }, [goals, hasCelebratedFirst]);

  // Initialize recurring goals for each month if goals are empty
  useEffect(() => {
    if (goals.length === 0) {
      const initialGoals: Goal[] = [];
      MONTHS.forEach((_, index) => {
        const month = index + 1;
        initialGoals.push({ id: `fin-per-${month}`, category: 'Finance', title: 'Versement PER', month, completed: false, type: 'recurring', amount: 945 });
        initialGoals.push({ id: `fin-etf-${month}`, category: 'Finance', title: 'Achats ETF', month, completed: false, type: 'recurring', amount: 0 });
        initialGoals.push({ id: `fin-ver-${month}`, category: 'Finance', title: 'Vérification des comptes', month, completed: false, type: 'recurring' });
        initialGoals.push({ id: `hlt-fast-${month}`, category: 'Santé', title: 'Journée de jeûne', month, completed: false, type: 'recurring' });
        initialGoals.push({ id: `spr-campus-${month}`, category: 'Sport', title: 'Suivi Campus Coach', month, completed: false, type: 'recurring' });
        initialGoals.push({ id: `knw-study-${month}`, category: 'Connaissance', title: 'Formation / Étude', month, completed: false, type: 'recurring' });
        initialGoals.push({ id: `knw-content-${month}`, category: 'Connaissance', title: 'Veille technologique', month, completed: false, type: 'recurring' });
      });
      initialGoals.push({ id: 'hlt-dent', category: 'Santé', title: 'Rendez-vous Dentiste', month: 6, completed: false, type: 'once' });
      initialGoals.push({ id: 'hlt-opht', category: 'Santé', title: 'Rendez-vous Ophtalmo', month: 10, completed: false, type: 'once' });
      initialGoals.push({ id: 'hlt-gen', category: 'Santé', title: 'Rendez-vous Généraliste', month: 1, completed: false, type: 'once' });
      setGoals(initialGoals);
    }
  }, [goals.length]);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'completed'>) => {
    const newGoal: Goal = { ...goal, id: `custom-${Date.now()}`, completed: false };
    setGoals(prev => [newGoal, ...prev]);
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, amount } : g));
  };

  const updateGoalTitle = (id: string, title: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, title } : g));
  };

  const updateGoalComment = (id: string, comment: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, comment } : g));
  };

  const updateGoalDate = (id: string, date: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, date } : g));
  };

  const updateGoalDay = (id: string, day: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, day } : g));
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateTraining = (id: string, updates: Partial<Training>) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateIoTProject = (id: string, updates: Partial<IoTProject>) => {
    setIotProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleRun = (week: number, slot: RunSlot) => {
    setWeeklyRuns(prev => prev.map(w => w.week === week ? { ...w, [slot]: !w[slot] } : w));
  };

  const addGymSession = (session: Omit<GymSession, 'id'>) => {
    setGymSessions(prev => [{ ...session, id: Date.now().toString() }, ...prev]);
  };

  const removeGymSession = (id: string) => {
    setGymSessions(prev => prev.filter(s => s.id !== id));
  };

  const addActiveWatch = (watch: Omit<ActiveWatch, 'id'>) => {
    setActiveWatches(prev => [{ ...watch, id: Date.now().toString() }, ...prev]);
  };

  const removeActiveWatch = (id: string) => {
    setActiveWatches(prev => prev.filter(w => w.id !== id));
  };

  const getCategoryProgress = useCallback((category: Category) => {
    if (category === 'Lecture') return Math.min(100, (books.filter(b => b.status === 'Lu').length / 12) * 100);
    if (category === 'Voyage') return Math.min(100, (trips.filter(t => t.status === 'Effectué').length / 4) * 100);
    if (category === 'Sport') {
      const runsCount = weeklyRuns.reduce((acc, w) => acc + (w.r1 ? 1 : 0) + (w.r2 ? 1 : 0) + (w.r3 ? 1 : 0) + (w.r4 ? 1 : 0), 0);
      const totalRunsTarget = 52 * 4;
      const runProgress = (runsCount / totalRunsTarget) * 100;
      const goalsProgress = goals.filter(g => g.category === 'Sport').length > 0 
        ? (goals.filter(g => g.category === 'Sport' && g.completed).length / goals.filter(g => g.category === 'Sport').length) * 100
        : 100;
      return Math.round((runProgress + goalsProgress) / 2);
    }
    if (category === 'Connaissance') {
       const catGoals = goals.filter(g => g.category === 'Connaissance');
       const certsDone = certifications.filter(c => c.status === 'Réussie').length;
       const trainsDone = trainings.filter(t => t.status === 'Terminé').length;
       const iotDone = iotProjects.filter(p => p.title && p.endDate).length;
       const totalWeight = catGoals.length + 2 + 4 + 2; 
       const progressWeight = catGoals.filter(g => g.completed).length + certsDone + trainsDone + (iotDone * 0.5);
       return Math.round((progressWeight / totalWeight) * 100);
    }
    const catGoals = goals.filter(g => g.category === category);
    if (catGoals.length === 0) return 0;
    return Math.round((catGoals.filter(g => g.completed).length / catGoals.length) * 100);
  }, [goals, books, trips, certifications, iotProjects, trainings, weeklyRuns]);

  const calculateGlobalProgress = useCallback(() => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  }, [goals]);

  useEffect(() => {
    const globalProgress = calculateGlobalProgress();
    setRewards(prev => prev.map(r => {
      let isUnlocked = false;
      if (!r.category) {
        isUnlocked = globalProgress >= r.threshold;
      } else {
        const catProgress = getCategoryProgress(r.category);
        isUnlocked = catProgress >= r.threshold;
      }
      return { ...r, unlocked: isUnlocked };
    }));
  }, [goals, books, trips, certifications, iotProjects, trainings, calculateGlobalProgress, getCategoryProgress]);

  const exportData = () => {
    const data = { goals, books, trips, certifications, trainings, iotProjects, weeklyRuns, gymSessions, darebeeUrl, activeWatches };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akhet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.goals) setGoals(data.goals);
        if (data.books) setBooks(data.books);
        if (data.trips) setTrips(data.trips);
        if (data.certifications) setCertifications(data.certifications);
        if (data.trainings) setTrainings(data.trainings);
        if (data.iotProjects) setIotProjects(data.iotProjects);
        if (data.weeklyRuns) setWeeklyRuns(data.weeklyRuns);
        if (data.gymSessions) setGymSessions(data.gymSessions);
        if (data.darebeeUrl) setDarebeeUrl(data.darebeeUrl);
        if (data.activeWatches) setActiveWatches(data.activeWatches);
        alert('Archives restaurées avec succès.');
      } catch (err) {
        alert('Fichier corrompu ou invalide.');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (window.confirm('Voulez-vous vraiment effacer toutes les archives d\'Akhet ? Cette action est irréversible.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    const rubricRewards = rewards.filter(r => r.category === activeTab);
    const rubricGoals = goals.filter(g => g.category === activeTab);

    switch (activeTab) {
      case 'dashboard': return <Dashboard goals={goals} books={books} trips={trips} rewards={rewards} />;
      case 'calendar': return <CalendarView goals={goals} toggleGoal={toggleGoal} />;
      case 'settings': return <SettingsView exportData={exportData} importData={importData} resetData={resetData} />;
      case 'Finance': return <FinanceView goals={rubricGoals} toggleGoal={toggleGoal} updateGoalAmount={updateGoalAmount} updateGoalComment={updateGoalComment} rubricRewards={rubricRewards} addGoal={addGoal} removeGoal={removeGoal} />;
      case 'Lecture': return <ReadingView books={books} setBooks={setBooks} rubricRewards={rubricRewards} rubricGoals={rubricGoals} addGoal={addGoal} removeGoal={removeGoal} toggleGoal={toggleGoal} />;
      case 'Voyage': return <TravelView trips={trips} setTrips={setTrips} rubricRewards={rubricRewards} rubricGoals={rubricGoals} addGoal={addGoal} removeGoal={removeGoal} toggleGoal={toggleGoal} />;
      case 'Connaissance': return <KnowledgeView goals={rubricGoals} certifications={certifications} iotProjects={iotProjects} trainings={trainings} activeWatches={activeWatches} updateCertification={updateCertification} updateIoTProject={updateIoTProject} updateTraining={updateTraining} addActiveWatch={addActiveWatch} removeActiveWatch={removeActiveWatch} rubricRewards={rubricRewards} addGoal={addGoal} removeGoal={removeGoal} toggleGoal={toggleGoal} updateGoalTitle={updateGoalTitle} />;
      case 'Sport': return <SportView goals={rubricGoals} weeklyRuns={weeklyRuns} toggleRun={toggleRun} gymSessions={gymSessions} addGymSession={addGymSession} removeGymSession={removeGymSession} darebeeUrl={darebeeUrl} setDarebeeUrl={setDarebeeUrl} toggleGoal={toggleGoal} rubricRewards={rubricRewards} addGoal={addGoal} removeGoal={removeGoal} />;
      case 'Santé': return <HealthView goals={rubricGoals} toggleGoal={toggleGoal} updateGoalDate={updateGoalDate} updateGoalDay={updateGoalDay} rubricRewards={rubricRewards} addGoal={addGoal} removeGoal={removeGoal} />;
      case 'Rappels': return <RemindersView goals={goals.filter(g => g.category === 'Rappels' || g.type === 'once')} toggleGoal={toggleGoal} addGoal={addGoal} removeGoal={removeGoal} />;
      default: return <Dashboard goals={goals} books={books} trips={trips} rewards={rewards} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-gray-200 overflow-hidden hieroglyph-bg">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-lg w-full p-8 text-center space-y-8 animate-scaleUp">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 bg-[#d4af37] rounded-full animate-ping opacity-20"></div>
               <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37] to-[#f0e68c] rounded-full shadow-[0_0_50px_rgba(212,175,55,0.6)] flex items-center justify-center">
                 <Sun size={64} className="text-black animate-pulse" />
               </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="egyptian-font text-3xl text-[#d4af37] leading-tight">Le Premier Rayon de l'Horizon a jailli !</h2>
              <p className="text-gray-400 text-sm leading-relaxed italic">
                "Celui qui déplace une montagne commence par enlever les petites pierres." <br/>
                Votre voyage vers l'équilibre et la Maât vient de franchir son premier seuil sacré.
              </p>
            </div>
            
            <button 
              onClick={() => setShowCelebration(false)}
              className="px-10 py-4 bg-[#d4af37] text-black font-black rounded-full uppercase tracking-widest text-xs hover:scale-110 active:scale-95 transition-all shadow-xl shadow-[#d4af37]/20"
            >
              Poursuivre ma quête
            </button>
            
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="text-[#d4af37]/40" size={12} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop only */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-[#d4af37]/20 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] text-xl">🌅</div>
                <h1 className="egyptian-font text-2xl font-bold text-[#d4af37]">AKHET</h1>
              </div>
              <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
              <NavItem icon={<CalendarIcon size={20} />} label="Calendrier" active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(false); }} />
              <div className="pt-6 pb-2 text-xs font-semibold text-[#d4af37]/60 uppercase tracking-widest px-4">Rubriques</div>
              {CATEGORIES.map(cat => (
                <NavItem key={cat.name} icon={cat.icon} label={cat.name} active={activeTab === cat.name} onClick={() => { setActiveTab(cat.name); setIsSidebarOpen(false); }} />
              ))}
              <div className="pt-6 pb-2 text-xs font-semibold text-gray-600 uppercase tracking-widest px-4">Système</div>
              <NavItem icon={<Settings size={20} />} label="Paramètres" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            </nav>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#d4af37]/10 sticky top-0 z-40">
            <button className="lg:hidden p-2 text-[#d4af37]" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
              <h2 className="text-sm md:text-lg font-bold text-gray-400 uppercase tracking-widest">
                {activeTab === 'dashboard' ? "Vue d'ensemble" : activeTab === 'settings' ? "Paramètres" : activeTab}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors relative"><Bell size={20} />{notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
              <div className="flex items-center gap-2 bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30">
                <Gift size={16} className="text-[#d4af37]" />
                <span className="text-sm font-bold text-[#d4af37]">{rewards.filter(r => r.unlocked).length}</span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-egyptian-pattern pb-24 lg:pb-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1a1a1a] border-t border-[#d4af37]/20 flex items-center justify-around px-2 z-50 backdrop-blur-lg">
        <BottomNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <BottomNavItem icon={<CalendarIcon size={24} />} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <BottomNavItem icon={<Dumbbell size={24} />} active={activeTab === 'Sport'} onClick={() => setActiveTab('Sport')} />
        <BottomNavItem icon={<PiggyBank size={24} />} active={activeTab === 'Finance'} onClick={() => setActiveTab('Finance')} />
        <BottomNavItem icon={<Menu size={24} />} active={isSidebarOpen} onClick={() => setIsSidebarOpen(true)} />
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-[#d4af37]/20 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>{icon}<span className="font-medium">{label}</span></button>
);

const BottomNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-gray-500'}`}>
    {icon}
  </button>
);

export default App;
