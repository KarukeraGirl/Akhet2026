
import React, { useState, useMemo } from 'react';
import { Goal, Book, Trip, Reward } from '../types';
import { CATEGORIES, MONTHS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
  CheckCircle2, Trophy, TrendingUp, BookOpen, Plane, 
  AlertCircle, Clock, Sparkles, Wand2, Image as ImageIcon, 
  Loader2, Key, BarChart3 
} from 'lucide-react';
import { analyzeProgress, generateVisionImage } from '../services/gemini';

interface Props {
  goals: Goal[];
  books: Book[];
  trips: Trip[];
  rewards: Reward[];
}

const Dashboard: React.FC<Props> = ({ goals, books, trips, rewards }) => {
  const currentMonth = new (Date)().getMonth() + 1;
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionPrompt, setVisionPrompt] = useState('');
  const [visionRatio, setVisionRatio] = useState('1:1');
  const [visionUrl, setVisionUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getCategoryProgress = (category: string) => {
    const catGoals = goals.filter(g => g.category === category);
    if (catGoals.length === 0) {
      if (category === 'Lecture') return Math.min(100, (books.filter(b => b.status === 'Lu').length / 12) * 100);
      if (category === 'Voyage') return Math.min(100, (trips.filter(t => t.status === 'Effectué').length / 4) * 100);
      return 0;
    }
    return Math.round((catGoals.filter(g => g.completed).length / catGoals.length) * 100);
  };

  const chartData = CATEGORIES.map(cat => ({
    name: cat.name,
    progress: getCategoryProgress(cat.name),
    color: cat.color
  }));

  const monthlyDistributionData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const monthNum = idx + 1;
      const monthGoals = goals.filter(g => g.month === monthNum);
      const dataPoint: any = { name: m.name.substring(0, 3) };
      CATEGORIES.forEach(cat => {
        dataPoint[cat.name] = monthGoals.filter(g => g.category === cat.name).length;
      });
      return dataPoint;
    });
  }, [goals]);

  const globalProgress = Math.round(chartData.reduce((acc, curr) => acc + curr.progress, 0) / chartData.length);

  const upcomingDeadlines = goals
    .filter(g => !g.completed && (g.month === currentMonth || g.month === currentMonth + 1))
    .sort((a,b) => a.month - b.month)
    .slice(0, 4);

  const handleAskOracle = async () => {
    setIsAnalyzing(true);
    try {
      const data = {
        goals: goals.filter(g => g.completed).map(g => g.title),
        remaining: goals.filter(g => !g.completed).length,
        books: books.filter(b => b.status === 'Lu').length,
        trips: trips.filter(t => t.status === 'Effectué').length
      };
      const res = await analyzeProgress(data);
      setOracleResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateVision = async () => {
    if (!visionPrompt) return;
    setIsGenerating(true);
    try {
      const url = await generateVisionImage(visionPrompt, visionRatio);
      setVisionUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCatColor = (name: string) => {
    switch(name) {
      case 'Finance': return '#f59e0b';
      case 'Lecture': return '#3b82f6';
      case 'Voyage': return '#10b981';
      case 'Connaissance': return '#a855f7';
      case 'Sport': return '#f97316';
      case 'Santé': return '#f43f5e';
      default: return '#d4af37';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Global" value={`${globalProgress}%`} icon={<TrendingUp size={18} className="text-[#d4af37]" />} />
        <StatCard title="Livres" value={`${books.filter(b => b.status === 'Lu').length}/12`} icon={<BookOpen size={18} className="text-blue-500" />} />
        <StatCard title="Voyages" value={`${trips.filter(t => t.status === 'Effectué').length}/4`} icon={<Plane size={18} className="text-emerald-500" />} />
        <StatCard title="Objectifs" value={`${goals.filter(g => g.completed).length}`} icon={<CheckCircle2 size={18} className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Chart - Responsive height */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 md:p-6 border border-[#d4af37]/10 shadow-xl overflow-hidden">
            <h3 className="egyptian-font text-base md:text-xl text-[#d4af37] mb-4 md:mb-6 flex items-center gap-2">
              <TrendingUp size={20} /> Progression
            </h3>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#999" width={80} fontSize={10} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '8px' }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress > 70 ? '#10b981' : entry.progress > 30 ? '#d4af37' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI ORACLE - Full width on mobile */}
          <div className="bg-[#1a1a1a] rounded-3xl border-2 border-[#d4af37]/20 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="egyptian-font text-xl md:text-2xl text-[#d4af37] flex items-center gap-2">
                    <Wand2 size={20} className="animate-pulse" /> Oracle d'Akhet
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Sagesse Artificielle</p>
                </div>
                <button 
                  onClick={handleAskOracle}
                  disabled={isAnalyzing}
                  className="w-full md:w-auto bg-[#d4af37] text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Demander conseil
                </button>
              </div>
              {oracleResponse && (
                <div className="bg-black/40 border border-[#d4af37]/10 p-4 md:p-6 rounded-2xl animate-scaleUp">
                  <p className="text-gray-300 italic leading-relaxed text-xs md:text-sm whitespace-pre-wrap">{oracleResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets - Stack on mobile */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#d4af37]/10 shadow-xl">
            <h3 className="egyptian-font text-lg text-[#d4af37] mb-4 flex items-center gap-2">
              <Trophy size={18} /> Paliers
            </h3>
            <div className="space-y-3">
              {rewards.filter(r => !r.category).map(reward => (
                <div key={reward.id} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${reward.unlocked ? 'bg-[#d4af37]/10 border-[#d4af37]/40' : 'bg-black/20 border-white/5 opacity-40'}`}>
                  <span className="text-2xl">{reward.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{reward.title}</h4>
                    <p className="text-[9px] text-gray-500">{reward.threshold}% global</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
             <h3 className="egyptian-font text-lg text-cyan-500 mb-4 flex items-center gap-2">
               <Clock size={18} /> Rappels
             </h3>
             <div className="space-y-2">
               {upcomingDeadlines.map(goal => (
                 <div key={goal.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 truncate pr-2">{goal.title}</span>
                    <span className="text-[8px] bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded font-black whitespace-nowrap">{MONTHS[goal.month-1].name}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-2xl border border-[#d4af37]/10 shadow-lg group">
    <div className="flex justify-between items-center mb-2">
      <div className="p-1.5 bg-white/5 rounded-lg">{icon}</div>
      <span className="text-[8px] text-gray-600 font-bold uppercase">2026</span>
    </div>
    <h4 className="text-gray-500 text-[10px] md:text-xs mb-0.5 font-bold uppercase tracking-widest">{title}</h4>
    <div className="text-xl md:text-2xl font-black text-white">{value}</div>
  </div>
);

export default Dashboard;
