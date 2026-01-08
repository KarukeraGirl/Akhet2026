
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
  const [customTitle, setCustomTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);
  const [customAmount, setCustomAmount] = useState(0);

  const completedPerGoals = goals.filter(g => g.title === 'Versement PER' && g.completed);
  const completedEtfGoals = goals.filter(g => g.title === 'Achats ETF' && g.completed);
  
  const currentPerTotal = completedPerGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
  const currentEtfTotal = completedEtfGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalAccumulated = currentPerTotal + currentEtfTotal;
  
  const targetPer = 945 * 12;
  const targetEtf = goals.filter(g => g.title === 'Achats ETF').reduce((sum, g) => sum + (g.amount || 0), 0);
  const totalTarget = targetPer + (targetEtf || 0);

  const handleAmountChange = (id: string, value: string) => {
    const amount = parseFloat(value) || 0;
    updateGoalAmount(id, amount);
  };

  const handleCommentChange = (id: string, value: string) => {
    updateGoalComment(id, value);
  };

  const handleAddCustom = () => {
    if (!customTitle) return;
    addGoal({
      title: customTitle,
      month: customMonth,
      category: 'Finance',
      type: 'once',
      amount: customAmount
    });
    setCustomTitle('');
    setCustomAmount(0);
  };

  const customGoals = goals.filter(g => !g.id.startsWith('fin-'));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#d4af37]/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <PiggyBank size={180} className="text-[#d4af37]" />
        </div>
        <div className="relative z-10">
          <h2 className="egyptian-font text-3xl text-[#d4af37] uppercase mb-2">Trésor de l'Horizon</h2>
          <p className="text-gray-400 mb-8 max-w-md">Suivi précis des actifs 2026. PER mensuel fixe de 945€ et ETF modulables.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox label="Cumul PER" value={currentPerTotal} target={targetPer} color="bg-amber-500" />
            <StatBox label="Cumul ETF" value={currentEtfTotal} target={targetEtf} color="bg-blue-500" />
            <StatBox label="Total Épargné" value={totalAccumulated} target={totalTarget} color="bg-[#d4af37]" isHighlight />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rubricRewards.map(reward => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>

      <div className="space-y-4">
        {MONTHS.map((m, idx) => {
          const monthGoals = goals.filter(g => g.month === idx + 1 && g.id.startsWith('fin-'));
          const monthCustomGoals = goals.filter(g => g.month === idx + 1 && !g.id.startsWith('fin-'));
          const allDone = [...monthGoals, ...monthCustomGoals].every(g => g.completed);
          
          if (monthGoals.length === 0 && monthCustomGoals.length === 0) return null;

          return (
            <div key={m.name} className={`bg-[#1a1a1a] rounded-2xl border transition-all duration-300 ${allDone ? 'border-green-500/30 bg-green-500/[0.02]' : 'border-white/5'}`}>
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <span className={`egyptian-font text-lg ${allDone ? 'text-green-500' : 'text-[#d4af37]'}`}>{m.name}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Actifs du mois</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthGoals.map(g => (
                  <GoalItem key={g.id} goal={g} toggleGoal={toggleGoal} handleAmountChange={handleAmountChange} handleCommentChange={handleCommentChange} />
                ))}
                {monthCustomGoals.map(g => (
                  <div key={g.id} className="relative group">
                    <GoalItem goal={g} toggleGoal={toggleGoal} />
                    <button onClick={() => removeGoal(g.id)} className="absolute -top-2 -right-2 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1a1a1a] p-6 rounded-2xl border-2 border-dashed border-[#d4af37]/20">
        <h3 className="text-[#d4af37] font-bold text-sm mb-4 uppercase flex items-center gap-2"><Plus size={16}/> Ajouter un objectif financier</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Intitulé (ex: Vente voiture, Prime...)" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]" />
          <input type="number" value={customAmount || ''} onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)} placeholder="Montant €" className="w-32 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]" />
          <select value={customMonth} onChange={(e) => setCustomMonth(parseInt(e.target.value))} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
          </select>
          <button onClick={handleAddCustom} className="bg-[#d4af37] text-black font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all">Ajouter</button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, target, color, isHighlight = false }: any) => (
  <div className={`p-5 rounded-2xl border ${isHighlight ? 'bg-[#d4af37]/5 border-[#d4af37]/30' : 'bg-black/40 border-[#d4af37]/10'} flex flex-col gap-1`}>
    <div className={`text-[10px] font-black uppercase tracking-widest ${isHighlight ? 'text-[#d4af37]' : 'text-[#d4af37]/60'}`}>{label}</div>
    <div className={`font-bold ${isHighlight ? 'text-3xl text-[#d4af37]' : 'text-2xl text-white'}`}>{value.toLocaleString()} €</div>
    <div className="text-[10px] text-gray-500 font-bold">Cible: {target.toLocaleString()} €</div>
    <div className="w-full h-1 bg-white/5 mt-2 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: target > 0 ? `${Math.min(100, (value / target) * 100)}%` : '0%' }}></div>
    </div>
  </div>
);

const RewardCard = ({ reward }: any) => (
  <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${reward.unlocked ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}>
    <span className="text-3xl">{reward.icon}</span>
    <div>
      <div className={`font-black text-[10px] uppercase tracking-tighter ${reward.unlocked ? 'text-[#d4af37]' : 'text-gray-500'}`}>{reward.title}</div>
      <div className="text-[9px] text-gray-400 font-medium">{reward.description}</div>
    </div>
  </div>
);

const GoalItem = ({ goal, toggleGoal, handleAmountChange, handleCommentChange }: any) => {
  const isEtf = goal.title === 'Achats ETF';
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => toggleGoal(goal.id)} className={`flex items-center gap-3 p-4 rounded-xl transition-all border group w-full ${goal.completed ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-black/20 border-white/5 text-gray-400 hover:border-[#d4af37]/30'}`}>
        <div className="shrink-0">{goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}</div>
        <span className={`text-sm font-bold truncate ${goal.completed ? 'line-through opacity-70' : ''}`}>{goal.title}</span>
        {goal.amount > 0 && <span className="ml-auto text-xs font-black text-[#d4af37]">{goal.amount}€</span>}
      </button>
      {isEtf && handleAmountChange && (
        <div className="space-y-2 mt-1">
          <div className="relative">
            <input type="number" value={goal.amount || ''} onChange={(e) => handleAmountChange(goal.id, e.target.value)} placeholder="Montant..." className="w-full bg-black/60 border border-[#d4af37]/10 rounded-lg py-2 pl-8 pr-4 text-xs focus:outline-none focus:border-[#d4af37]/50 text-white" />
            <Euro size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/40" />
          </div>
          <div className="relative">
            <textarea value={goal.comment || ''} onChange={(e) => handleCommentChange(goal.id, e.target.value)} placeholder="Détails..." rows={1} className="w-full bg-black/40 border border-[#d4af37]/5 rounded-lg py-2 px-3 text-[10px] focus:outline-none focus:border-[#d4af37]/30 text-gray-400 resize-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
