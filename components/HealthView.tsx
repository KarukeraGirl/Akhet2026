
import React, { useState } from 'react';
import { Goal, Reward } from '../types';
import { MONTHS } from '../constants';
import { HeartPulse, CheckCircle2, Circle, Apple, Stethoscope, Droplet, User, Eye, Pill, Calendar as CalendarIcon, Trophy, Plus, Trash2 } from 'lucide-react';

interface Props {
  goals: Goal[];
  toggleGoal: (id: string) => void;
  updateGoalDate: (id: string, date: string) => void;
  updateGoalDay: (id: string, day: number) => void;
  rubricRewards: Reward[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
}

const HealthView: React.FC<Props> = ({ goals, toggleGoal, updateGoalDate, updateGoalDay, rubricRewards, addGoal, removeGoal }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);

  const medicalGoals = goals.filter(g => g.type === 'once' && g.id.startsWith('hlt-'));
  const fastingGoals = goals.filter(g => g.title === 'Journée de jeûne');
  const customHealthGoals = goals.filter(g => !g.id.startsWith('hlt-') && g.title !== 'Journée de jeûne');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleAdd = () => {
    if (!customTitle) return;
    addGoal({
      title: customTitle,
      month: customMonth,
      category: 'Santé',
      type: 'once'
    });
    setCustomTitle('');
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border-2 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><HeartPulse size={120} className="text-rose-500" /></div>
        <h2 className="egyptian-font text-3xl text-rose-500 mb-4 uppercase">Vitalité de l'Akhet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-rose-500 font-bold uppercase text-xs tracking-widest"><Apple size={16}/> Nutrition & Discipline</div>
             <p className="text-gray-400 text-sm leading-relaxed">Le temple de l'âme doit être préservé. Jeûne mensuel et suivi médical rigoureux.</p>
           </div>
           <div className="flex items-center justify-center p-6 bg-black/40 rounded-3xl border border-white/5">
             <div className="text-center">
               <div className="text-4xl font-black text-rose-500">{fastingGoals.filter(g => g.completed).length} / 12</div>
               <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Jeûnes Complétés</div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rubricRewards.map(reward => (
          <div key={reward.id} className={`p-5 rounded-3xl border flex items-center gap-5 transition-all ${reward.unlocked ? 'bg-rose-500/10 border-rose-500/40 shadow-xl' : 'bg-black/20 border-white/5 opacity-40'}`}>
            <span className="text-4xl">{reward.icon}</span>
            <div>
              <div className={`font-black text-xs uppercase tracking-widest ${reward.unlocked ? 'text-rose-500' : 'text-gray-500'}`}>{reward.title}</div>
              <div className="text-[10px] text-gray-400 font-medium">{reward.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
          <h3 className="text-[#d4af37] font-bold text-sm mb-6 uppercase tracking-widest flex items-center gap-2"><Droplet size={16} /> Jeûnes 2026</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fastingGoals.map((g, i) => (
              <div key={g.id} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${g.completed ? 'bg-rose-500/10 border-rose-500/30' : 'bg-black/40 border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase ${g.completed ? 'text-rose-500' : 'text-gray-400'}`}>{MONTHS[i].name}</span>
                  <button onClick={() => toggleGoal(g.id)} className={g.completed ? 'text-rose-500' : 'text-gray-600'}>{g.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
                </div>
                <select value={g.day || 1} onChange={(e) => updateGoalDay(g.id, parseInt(e.target.value))} disabled={g.completed} className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                  {days.map(d => <option key={d} value={d}>Jour {d}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
          <h3 className="text-[#d4af37] font-bold text-sm mb-6 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={16} /> Médical & Perso</h3>
          <div className="space-y-4">
             {[...medicalGoals, ...customHealthGoals].map(g => (
               <div key={g.id} className={`p-4 rounded-2xl border flex flex-col gap-4 transition-all group ${g.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/5'}`}>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <button onClick={() => toggleGoal(g.id)} className={g.completed ? 'text-green-500' : 'text-gray-600'}>{g.completed ? <CheckCircle2 size={24}/> : <Circle size={24}/>}</button>
                     <div>
                       <div className={`font-bold text-sm ${g.completed ? 'line-through text-green-500/60' : 'text-gray-200'}`}>{g.title}</div>
                       <div className="text-[10px] text-gray-500 uppercase font-black">{MONTHS[g.month-1].name}</div>
                     </div>
                   </div>
                   {!g.id.startsWith('hlt-') && <button onClick={() => removeGoal(g.id)} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
                 </div>
                 {g.id.startsWith('hlt-') && (
                   <input type="date" value={g.date || ''} onChange={(e) => updateGoalDate(g.id, e.target.value)} disabled={g.completed} className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50" />
                 )}
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-rose-500/20 shadow-xl mt-12">
        <h3 className="egyptian-font text-xl text-rose-500 mb-6 flex items-center gap-2">Nouvel Objectif de Santé</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex: Analyse de sang, Arrêt sucre, Sommeil 8h..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500" />
          <select value={customMonth} onChange={(e) => setCustomMonth(parseInt(e.target.value))} className="w-full md:w-48 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
          </select>
          <button onClick={handleAdd} className="bg-rose-600 text-white font-black px-8 py-3 rounded-xl hover:bg-rose-500 transition-all uppercase text-xs tracking-widest">Inscrire</button>
        </div>
      </div>
    </div>
  );
};

export default HealthView;
