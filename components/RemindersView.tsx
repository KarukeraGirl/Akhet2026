
import React, { useState } from 'react';
import { Goal, Category } from '../types';
import { MONTHS, CATEGORIES } from '../constants';
import { Plus, Bell, Trash2, CheckCircle, Circle, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  goals: Goal[];
  toggleGoal: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
}

const RemindersView: React.FC<Props> = ({ goals, toggleGoal, addGoal, removeGoal }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newMonth, setNewMonth] = useState(1);
  const [newCategory, setNewCategory] = useState<Category>('Rappels');

  const handleAdd = () => {
    if (!newTitle) return;
    addGoal({
      title: newTitle,
      month: newMonth,
      category: newCategory,
      type: 'once'
    });
    setNewTitle('');
  };

  // Group goals by month
  const groupedGoals = MONTHS.map((month, index) => {
    const monthIndex = index + 1;
    return {
      monthName: month.name,
      monthIndex,
      items: goals.filter(g => g.month === monthIndex)
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Create Reminder Form */}
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#d4af37]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Bell size={120} className="text-[#d4af37]" />
        </div>
        <div className="relative z-10">
          <h2 className="egyptian-font text-2xl text-[#d4af37] mb-6 flex items-center gap-3">
            <Plus size={24} className="bg-[#d4af37] text-black rounded-full p-0.5" /> Décréter un Rappel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Intitulé du Rappel</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Impôts, Entretien Chaudière..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-[#d4af37] transition-all text-sm placeholder:text-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Mois</label>
                <div className="relative">
                  <select 
                    value={newMonth}
                    onChange={(e) => setNewMonth(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-[#d4af37] transition-all appearance-none text-sm cursor-pointer"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m.name} value={i + 1}>{m.name}</option>
                    ))}
                  </select>
                  <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Catégorie</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-[#d4af37] transition-all appearance-none text-sm cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            disabled={!newTitle}
            className="mt-8 w-full bg-gradient-to-r from-[#d4af37] to-[#f0e68c] text-black font-black py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-30 disabled:hover:shadow-none uppercase tracking-widest text-sm"
          >
            Inscrire dans le Grand Livre
          </button>
        </div>
      </div>

      {/* Reminders Grouped List */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
          <h3 className="egyptian-font text-2xl text-[#d4af37]">Les Décrets de 2026</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{goals.length} Échéances</span>
        </div>
        
        {groupedGoals.length > 0 ? (
          <div className="space-y-10">
            {groupedGoals.map((group) => (
              <section key={group.monthIndex} className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                  <h4 className="egyptian-font text-xl text-[#d4af37]/80 px-4 py-1 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-full shadow-lg">
                    {group.monthName}
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {group.items.map(goal => (
                    <div 
                      key={goal.id} 
                      className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        goal.completed 
                          ? 'bg-green-500/[0.03] border-green-500/30 shadow-inner shadow-green-500/5' 
                          : 'bg-[#1a1a1a] border-white/5 hover:border-[#d4af37]/40 hover:bg-black/40'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <button 
                          onClick={() => toggleGoal(goal.id)} 
                          className={`transition-transform active:scale-90 ${goal.completed ? 'text-green-500' : 'text-gray-600 hover:text-[#d4af37]'}`}
                        >
                          {goal.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
                        </button>
                        
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl transition-colors ${goal.completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-[#d4af37]/60 group-hover:bg-[#d4af37]/10 group-hover:text-[#d4af37]'}`}>
                            <Bell size={20} />
                          </div>
                          <div>
                            <div className={`font-bold text-base transition-all ${goal.completed ? 'text-green-500/60 line-through' : 'text-white'}`}>
                              {goal.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded transition-colors ${
                                goal.completed ? 'bg-green-500/10 text-green-500/70' : 'bg-white/5 text-gray-500'
                              }`}>
                                {goal.category}
                              </span>
                              {goal.completed && (
                                <span className="text-[9px] font-black uppercase text-green-500 animate-pulse">Accompli</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeGoal(goal.id)}
                        className="p-3 text-gray-800 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-[#1a1a1a]/40 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
              <AlertCircle size={40} />
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-[0.3em] text-sm">Aucun décret inscrit pour 2026</div>
            <p className="text-gray-700 text-xs max-w-xs">Définissez vos rappels ponctuels pour ne rien laisser au hasard cette année.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersView;
