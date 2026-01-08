
import React, { useState } from 'react';
import { Goal, Reward, WeeklyRun, GymSession, RunSlot, GymSessionType } from '../types';
import { 
  Dumbbell, Footprints, Activity, ExternalLink, Calendar, 
  Trophy, Plus, Trash2, CheckCircle2, Circle, Star, 
  Map as MapIcon, Link as LinkIcon, User, Users, Search,
  Flame, Medal
} from 'lucide-react';
import { MONTHS } from '../constants';

interface Props {
  goals: Goal[];
  weeklyRuns: WeeklyRun[];
  toggleRun: (week: number, slot: RunSlot) => void;
  gymSessions: GymSession[];
  addGymSession: (session: Omit<GymSession, 'id'>) => void;
  removeGymSession: (id: string) => void;
  darebeeUrl: string;
  setDarebeeUrl: (url: string) => void;
  toggleGoal: (id: string) => void;
  rubricRewards: Reward[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
}

const SportView: React.FC<Props> = ({ 
  goals, 
  weeklyRuns, 
  toggleRun, 
  gymSessions, 
  addGymSession, 
  removeGymSession, 
  darebeeUrl, 
  setDarebeeUrl, 
  toggleGoal, 
  rubricRewards, 
  addGoal, 
  removeGoal 
}) => {
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);
  
  // Gym session form
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionType, setSessionType] = useState<GymSessionType>('Libre');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddGoal = () => {
    if (!customGoalTitle) return;
    addGoal({ title: customGoalTitle, month: customMonth, category: 'Sport', type: 'once' });
    setCustomGoalTitle('');
  };

  const handleAddGymSession = () => {
    if (!sessionTitle) return;
    addGymSession({ title: sessionTitle, type: sessionType, date: sessionDate });
    setSessionTitle('');
  };

  const mandatoryCompleted = weeklyRuns.reduce((acc, w) => acc + (w.r1 ? 1 : 0) + (w.r2 ? 1 : 0), 0);
  const facultativeCompleted = weeklyRuns.reduce((acc, w) => acc + (w.r3 ? 1 : 0) + (w.r4 ? 1 : 0), 0);

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-24 animate-fadeIn">
      {/* Récompenses de la rubrique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rubricRewards.map(reward => (
          <div key={reward.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${reward.unlocked ? 'bg-orange-500/10 border-orange-500/40 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}>
            <span className="text-3xl">{reward.icon}</span>
            <div>
              <div className={`font-black text-[10px] uppercase tracking-widest ${reward.unlocked ? 'text-orange-500' : 'text-gray-500'}`}>{reward.title}</div>
              <div className="text-[9px] text-gray-400 font-medium">{reward.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course à Pied - Tracker Spécialisé */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-orange-500/30 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12">
            <Footprints size={180} className="text-orange-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div>
            <h2 className="egyptian-font text-3xl text-orange-500 flex items-center gap-3">
              <Activity size={28} /> Chemin du Nil (Course)
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              4 Sorties / Semaine : <span className="text-orange-500">2 Obligatoires ★</span> & 2 Facultatifs
            </p>
          </div>
          <div className="flex gap-4">
            <StatSmall label="Obligatoires (★)" value={`${mandatoryCompleted}/104`} color="text-orange-500" />
            <StatSmall label="Facultatifs" value={`${facultativeCompleted}/104`} color="text-gray-500" />
          </div>
        </div>

        {/* Grille des 52 Semaines */}
        <div className="overflow-x-auto pb-6 custom-scrollbar">
          <div className="flex gap-4 min-w-max px-2">
            {weeklyRuns.map((w) => (
              <div key={w.week} className="flex flex-col items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all">
                <span className="text-[10px] font-black text-gray-600 uppercase">Sem. {w.week}</span>
                <div className="grid grid-cols-2 gap-2">
                  <RunCheckbox checked={w.r1} onClick={() => toggleRun(w.week, 'r1')} mandatory />
                  <RunCheckbox checked={w.r2} onClick={() => toggleRun(w.week, 'r2')} mandatory />
                  <RunCheckbox checked={w.r3} onClick={() => toggleRun(w.week, 'r3')} />
                  <RunCheckbox checked={w.r4} onClick={() => toggleRun(w.week, 'r4')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Renforcement - Journal de Musculation */}
        <div className="bg-[#1a1a1a] rounded-3xl border border-blue-500/20 p-8 shadow-2xl relative">
          <h2 className="egyptian-font text-2xl text-blue-500 mb-8 flex items-center gap-3">
             <Dumbbell className="text-blue-500" /> Atelier de Force (Salle)
          </h2>
          
          <div className="space-y-6">
            {/* Formulaire Nouvelle Séance */}
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
               <div className="flex gap-2 p-1 bg-black/60 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setSessionType('Libre')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${sessionType === 'Libre' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <User size={12}/> Séance Libre
                  </button>
                  <button 
                    onClick={() => setSessionType('Cours')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${sessionType === 'Cours' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Users size={12}/> Cours / Coach
                  </button>
               </div>
               <div className="flex flex-col gap-3">
                 <input 
                  value={sessionTitle} 
                  onChange={(e) => setSessionTitle(e.target.value)} 
                  placeholder="Intitulé (ex: Full Body, Yoga, Pecs...)" 
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                 />
                 <div className="flex gap-3">
                    <input 
                      type="date" 
                      value={sessionDate} 
                      onChange={(e) => setSessionDate(e.target.value)} 
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-white"
                    />
                    <button onClick={handleAddGymSession} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                      <Plus size={20}/>
                    </button>
                 </div>
               </div>
            </div>

            {/* Liste des séances */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {gymSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${session.type === 'Cours' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {session.type === 'Cours' ? <Users size={18}/> : <User size={18}/>}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-200">{session.title}</div>
                      <div className="text-[9px] text-gray-500 font-black uppercase">{session.type} • {session.date}</div>
                    </div>
                  </div>
                  <button onClick={() => removeGymSession(session.id)} className="p-2 text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              {gymSessions.length === 0 && (
                <div className="text-center py-10 text-gray-700 italic text-xs">Aucune séance consignée dans les archives.</div>
              )}
            </div>
          </div>
        </div>

        {/* Darebee & Challenges */}
        <div className="space-y-8">
           <div className="bg-[#1a1a1a] rounded-3xl border border-rose-500/20 p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  <Flame size={140} className="text-rose-500 animate-pulse" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 shadow-lg shadow-rose-500/5">
                    <Medal size={24} />
                  </div>
                  <div>
                    <h2 className="egyptian-font text-2xl text-rose-500">Défi Darebee</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Forge de la Persévérance</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Le grand livre des défis. Incorporez l'URL de votre quête Darebee pour rester focalisé sur votre progression quotidienne.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={darebeeUrl}
                        onChange={(e) => setDarebeeUrl(e.target.value)}
                        placeholder="https://darebee.com/challenges/..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 pl-12 text-sm focus:outline-none focus:border-rose-500 text-rose-400 placeholder:text-gray-700 transition-all"
                      />
                      <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    </div>

                    {darebeeUrl ? (
                      <div className="animate-scaleUp">
                        <a 
                          href={darebeeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black px-6 py-4 rounded-xl transition-all shadow-xl shadow-rose-600/20 group/btn"
                        >
                          <div className="flex items-center gap-3">
                            <Flame size={18} className="group-hover/btn:animate-bounce" />
                            <span className="text-[10px] uppercase tracking-widest">Lancer l'Entraînement</span>
                          </div>
                          <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                        <div className="mt-3 text-center">
                           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Lien actif : {new URL(darebeeUrl).hostname}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50">
                        <Search size={24} className="text-gray-700" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">En attente d'une quête...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>

           {/* Objectifs Sportifs Personnalisés */}
           <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-6 flex items-center gap-2">Décrets Sportifs de l'Année</h3>
              <div className="space-y-3 mb-8 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                 {goals.map(g => (
                   <div key={g.id} className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${g.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/5'}`}>
                     <div className="flex items-center gap-4">
                       <button onClick={() => toggleGoal(g.id)} className={g.completed ? 'text-green-500' : 'text-gray-600'}>
                         {g.completed ? <CheckCircle2 size={24}/> : <Circle size={24}/>}
                       </button>
                       <div>
                         <div className={`font-bold text-sm ${g.completed ? 'line-through text-green-500/60' : 'text-gray-200'}`}>{g.title}</div>
                         <div className="text-[10px] text-gray-500 uppercase font-black">{MONTHS[g.month-1].name}</div>
                       </div>
                     </div>
                     <button onClick={() => removeGoal(g.id)} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                   </div>
                 ))}
              </div>
              <div className="flex flex-col gap-3">
                 <input 
                  value={customGoalTitle} 
                  onChange={(e) => setCustomGoalTitle(e.target.value)} 
                  placeholder="Ex: Marathon de Paris, 100km vélo..." 
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-white" 
                 />
                 <div className="flex gap-2">
                    <select 
                      value={customMonth} 
                      onChange={(e) => setCustomMonth(parseInt(e.target.value))} 
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-white cursor-pointer"
                    >
                      {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
                    </select>
                    <button onClick={handleAddGoal} className="bg-orange-600 hover:bg-orange-500 text-white px-6 rounded-xl transition-all font-black text-xs uppercase shadow-lg shadow-orange-600/20">
                      Ajouter
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const RunCheckbox = ({ checked, onClick, mandatory = false }: { checked: boolean; onClick: () => void; mandatory?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
      checked 
        ? mandatory ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gray-500 text-white'
        : 'bg-black/60 border border-white/10 hover:border-orange-500/40'
    } ${mandatory && !checked ? 'border-orange-500/40 shadow-[inset_0_0_8px_rgba(245,158,11,0.1)]' : ''}`}
    title={mandatory ? 'Sortie Obligatoire' : 'Sortie Facultative'}
  >
    {checked ? (
      mandatory ? <Star size={16} fill="currentColor"/> : <CheckCircle2 size={16}/>
    ) : (
      mandatory ? <Star size={12} className="text-gray-800" /> : <div className="w-1 h-1 bg-gray-800 rounded-full" />
    )}
  </button>
);

const StatSmall = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="text-right">
    <div className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-0.5">{label}</div>
    <div className={`text-base font-black ${color} tracking-tighter`}>{value}</div>
  </div>
);

export default SportView;
