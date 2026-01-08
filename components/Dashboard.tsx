
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
  const [visionRatio, setVisionRatio] = useState('16:9');
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

  // Data for monthly distribution chart
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
    
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return;
      }
    }

    setIsGenerating(true);
    try {
      const url = await generateVisionImage(visionPrompt, visionRatio);
      setVisionUrl(url);
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper for category colors in the chart
  const getCatColor = (name: string) => {
    switch(name) {
      case 'Finance': return '#f59e0b';
      case 'Lecture': return '#3b82f6';
      case 'Voyage': return '#10b981';
      case 'Connaissance': return '#a855f7';
      case 'Sport': return '#f97316';
      case 'Santé': return '#f43f5e';
      case 'Rappels': return '#06b6d4';
      default: return '#d4af37';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Progression Globale" value={`${globalProgress}%`} icon={<TrendingUp className="text-[#d4af37]" />} />
        <StatCard title="Livres Lus" value={`${books.filter(b => b.status === 'Lu').length}/12`} icon={<BookOpen className="text-blue-500" />} />
        <StatCard title="Voyages Réalisés" value={`${trips.filter(t => t.status === 'Effectué').length}/4`} icon={<Plane className="text-emerald-500" />} />
        <StatCard title="Objectifs Complétés" value={`${goals.filter(g => g.completed).length}/${goals.length}`} icon={<CheckCircle2 className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Chart */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#d4af37]/10 shadow-xl">
            <h3 className="egyptian-font text-xl text-[#d4af37] mb-6 flex items-center gap-2">
              <TrendingUp size={20} /> Progression par Rubrique
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#999" width={100} fontSize={10} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37', borderRadius: '8px' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={15}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress > 70 ? '#10b981' : entry.progress > 30 ? '#d4af37' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Distribution Chart */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-blue-500/20 shadow-xl overflow-hidden relative">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                <BarChart3 size={200} className="text-blue-500" />
            </div>
            <h3 className="egyptian-font text-xl text-blue-400 mb-6 flex items-center gap-2">
              <BarChart3 size={20} /> Répartition Mensuelle des Efforts
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                  {CATEGORIES.map(cat => (
                    <Area 
                      key={cat.name}
                      type="monotone" 
                      dataKey={cat.name} 
                      stackId="1" 
                      stroke={getCatColor(cat.name)} 
                      fill={getCatColor(cat.name)} 
                      fillOpacity={0.4} 
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI COACH / ORACLE SECTION */}
          <div className="bg-[#1a1a1a] rounded-3xl border-2 border-[#d4af37]/20 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Sparkles size={150} className="text-[#d4af37]" />
            </div>
            
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="egyptian-font text-2xl text-[#d4af37] flex items-center gap-2">
                    <Wand2 className="animate-pulse" /> L'Oracle d'Akhet
                  </h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Intelligence Divine de l'Horizon</p>
                </div>
                <button 
                  onClick={handleAskOracle}
                  disabled={isAnalyzing}
                  className="bg-[#d4af37] text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <><Loader2 className="animate-spin" size={18} /> L'Oracle réfléchit...</> : <><Sparkles size={18} /> Demander Conseil</>}
                </button>
              </div>

              {oracleResponse && (
                <div className="bg-black/40 border border-[#d4af37]/20 p-6 rounded-2xl animate-scaleUp">
                  <p className="text-gray-300 italic leading-relaxed text-sm whitespace-pre-wrap">{oracleResponse}</p>
                </div>
              )}

              {!oracleResponse && !isAnalyzing && (
                <div className="text-center py-8 opacity-40">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#d4af37]">Les dieux attendent votre requête...</p>
                </div>
              )}
            </div>
          </div>

          {/* VISION GENERATOR SECTION */}
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <h3 className="egyptian-font text-xl text-white">Vision de l'Horizon</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Matérialisez vos rêves en 4K</p>
                </div>
             </div>

             <div className="space-y-4">
               <div className="flex flex-col md:flex-row gap-4">
                 <input 
                    type="text"
                    value={visionPrompt}
                    onChange={(e) => setVisionPrompt(e.target.value)}
                    placeholder="Décrivez votre vision de succès (ex: Ma villa au bord du Nil...)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                 />
                 <select 
                    value={visionRatio}
                    onChange={(e) => setVisionRatio(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500"
                 >
                    <option value="1:1">1:1 Carré</option>
                    <option value="16:9">16:9 Cinéma</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="4:3">4:3 Classique</option>
                    <option value="3:4">3:4 Portrait</option>
                    <option value="2:3">2:3 Photo</option>
                    <option value="3:2">3:2 Photo</option>
                    <option value="21:9">21:9 UltraWide</option>
                 </select>
               </div>
               
               <button 
                onClick={handleGenerateVision}
                disabled={isGenerating || !visionPrompt}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30"
               >
                 {isGenerating ? <><Loader2 className="animate-spin" /> Évocation en cours...</> : <><Sparkles size={18}/> Invoquer la Vision</>}
               </button>

               {visionUrl && (
                 <div className="mt-6 rounded-2xl overflow-hidden border-2 border-[#d4af37]/30 shadow-2xl relative group animate-scaleUp">
                   <img src={visionUrl} alt="Vision d'Akhet" className="w-full h-auto" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <p className="egyptian-font text-white text-lg drop-shadow-lg">Ta destinée est écrite</p>
                   </div>
                 </div>
               )}

               <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                 <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Key size={12} />
                    <span>Nécessite une clé API pour les modèles Pro (Gemini 3 Pro Image)</span>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="ml-auto text-blue-500 hover:underline">Documentation Billing</a>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Rewards Section */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#d4af37]/10 shadow-xl">
            <h3 className="egyptian-font text-xl text-[#d4af37] mb-6 flex items-center gap-2">
              <Trophy size={20} /> Récompenses
            </h3>
            <div className="space-y-4">
              {rewards.map(reward => (
                <div key={reward.id} className={`p-4 rounded-xl border transition-all ${reward.unlocked ? 'bg-[#d4af37]/10 border-[#d4af37]/50' : 'bg-black/20 border-white/5 opacity-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{reward.icon}</span>
                    <div>
                      <h4 className={`font-bold text-sm ${reward.unlocked ? 'text-[#d4af37]' : 'text-gray-500'}`}>{reward.title}</h4>
                      <p className="text-[10px] text-gray-400">{reward.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-cyan-500/20 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Clock size={100} className="text-cyan-500" />
             </div>
             <h3 className="egyptian-font text-xl text-cyan-500 mb-6 flex items-center gap-2">
               <AlertCircle size={20} /> Échéances
             </h3>
             <div className="space-y-3">
               {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(goal => (
                 <div key={goal.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-200">{goal.title}</div>
                      <div className="text-[8px] font-black uppercase text-cyan-500/60 mt-1">{MONTHS[goal.month-1].name} • {goal.category}</div>
                    </div>
                    {goal.month === currentMonth && (
                      <span className="text-[7px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Imminent</span>
                    )}
                 </div>
               )) : (
                 <div className="text-center py-4 text-gray-600 italic text-xs">Aucun rappel imminent.</div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#d4af37]/10 shadow-lg group hover:border-[#d4af37]/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      <span className="text-xs text-gray-500 font-medium">2026</span>
    </div>
    <h4 className="text-gray-400 text-xs mb-1 font-bold uppercase tracking-widest">{title}</h4>
    <div className="text-2xl font-black text-white">{value}</div>
  </div>
);

export default Dashboard;
