
import React, { useState } from 'react';
import { Goal, Reward, Category } from '../types';
import { MONTHS } from '../constants';
import { CheckCircle2, Circle, PiggyBank, TrendingUp, Wallet, Target, Euro, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Props {
  goals: Goal[];
  toggleGoal: (id: string) => void;
  updateGoalAmount: (id: string, amount: number) => void;
  updateGoalComment: (id: string, comment: string) => void;
  rubricRewards: Reward[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
}

const FinanceView: React.FC<Props> = ({ goals, toggleGoal, updateGoalAmount, updateGoalComment, rubricRewards, addGoal, removeGoal }) => {
  const completedPerGoals = goals.filter(g => g.title === 'Versement PER' && g.completed);
  const completedEtfGoals = goals.filter(g => g.title === 'Achats ETF' && g.completed);
  const currentPerTotal = completedPerGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
  const currentEtfTotal = completedEtfGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalAccumulated = currentPerTotal + currentEtfTotal;
  const targetPer = 945 * 12;
  const targetEtf = goals.filter(g => g.title === 'Achats ETF').reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalTarget = targetPer + (targetEtf || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#d4af37]/20 relative overflow-hidden shadow-xl">
        <h2 className="egyptian-font text-xl text-[#d4af37] uppercase mb-6 flex items-center gap-2"><PiggyBank size={24}/> Trésor d'Akhet</h2>
        <div className="flex flex-col gap-4">
          <StatBox label="Global" value={totalAccumulated} target={totalTarget} color="bg-[#d4af37]" isHighlight />
          <div className="grid grid-cols-2 gap-3">
             <StatBox label="PER" value={currentPerTotal} target={targetPer} color="bg-amber-500" small />
             <StatBox label="ETF" value={currentEtfTotal} target={targetEtf} color="bg-blue-500" small />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {MONTHS.map((m, idx) => {
          const monthGoals = goals.filter(g => g.month === idx + 1 && g.category === 'Finance');
          if (monthGoals.length === 0) return null;
          const allDone = monthGoals.every(g => g.completed);

          return (
            <div key={m.name} className={`bg-[#1a1a1a] rounded-2xl border ${allDone ? 'border-green-500/20' : 'border-white/5'}`}>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="font-black text-xs uppercase tracking-widest text-[#d4af37]">{m.name}</span>
                {allDone && <span className="text-[10px] text-green-500 font-black uppercase">Accompli</span>}
              </div>
              <div className="p-4 space-y-4">
                {monthGoals.map(g => (
                  <div key={g.id} className="space-y-2">
                    <button onClick={() => toggleGoal(g.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${g.completed ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                      {g.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      <span className="text-sm font-bold flex-1 text-left truncate">{g.title}</span>
                      {g.amount !== undefined && <span className="text-xs font-black">{g.amount}€</span>}
                    </button>
                    {g.title === 'Achats ETF' && !g.completed && (
                       <div className="flex gap-2">
                         <input 
                            type="number" 
                            value={g.amount || ''} 
                            onChange={(e) => updateGoalAmount(g.id, parseFloat(e.target.value) || 0)} 
                            placeholder="Montant..." 
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4af37]/40" 
                         />
                         <input 
                            type="text" 
                            value={g.comment || ''} 
                            onChange={(e) => updateGoalComment(g.id, e.target.value)} 
                            placeholder="Note..." 
                            className="flex-[2] bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4af37]/40" 
                         />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, target, color, isHighlight = false, small = false }: any) => (
  <div className={`p-4 rounded-2xl border ${isHighlight ? 'bg-[#d4af37]/5 border-[#d4af37]/40' : 'bg-black/40 border-white/5'}`}>
    <div className="text-[10px] font-black uppercase text-gray-500 mb-1">{label}</div>
    <div className={`font-black ${isHighlight ? 'text-2xl text-[#d4af37]' : small ? 'text-base text-white' : 'text-xl text-white'}`}>
      {value.toLocaleString()}€
    </div>
    {!small && <div className="text-[9px] text-gray-600 mt-1">Cible : {target.toLocaleString()}€</div>}
    <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (value / (target || 1)) * 100)}%` }}></div>
    </div>
  </div>
);

export default FinanceView;
