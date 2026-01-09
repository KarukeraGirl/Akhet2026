
import React, { useState, useMemo } from 'react';
import { MONTHS, CATEGORIES } from '../constants';
import { Goal } from '../types';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, 
  Calendar as CalendarIcon, Sparkles, Sun, Info,
  MapPin, Clock
} from 'lucide-react';

interface Props {
  goals: Goal[];
  toggleGoal: (id: string) => void;
}

const CalendarView: React.FC<Props> = ({ goals, toggleGoal }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const theme = MONTHS[currentMonthIndex];
  const year = 2026;

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const date = new Date(year, currentMonthIndex, 1);
    const days = new Date(year, currentMonthIndex + 1, 0).getDate();
    let startDay = date.getDay() - 1;
    if (startDay === -1) startDay = 6;
    return { daysInMonth: days, firstDayOfMonth: startDay };
  }, [currentMonthIndex]);

  const monthGoals = useMemo(() => 
    goals.filter(g => g.month === currentMonthIndex + 1),
    [goals, currentMonthIndex]
  );

  const goalsByDay = useMemo(() => {
    const map: Record<number, Goal[]> = {};
    monthGoals.forEach(g => {
      if (g.day) {
        if (!map[g.day]) map[g.day] = [];
        map[g.day].push(g);
      }
    });
    return map;
  }, [monthGoals]);

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const selectedDayGoals = selectedDay ? (goalsByDay[selectedDay] || []) : [];
  const recurringGoals = monthGoals.filter(g => g.type === 'recurring' && !g.day);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      
      {/* Horizontal Month Scroll - Mobile Optimized */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x no-scrollbar">
        {MONTHS.map((m, i) => (
          <button 
            key={m.name}
            onClick={() => {
              setCurrentMonthIndex(i);
              setSelectedDay(null);
            }}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border snap-center ${
              i === currentMonthIndex 
                ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg shadow-[#d4af37]/20' 
                : 'bg-black/40 text-gray-500 border-white/5 hover:border-[#d4af37]/40'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Calendar Grid */}
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-b from-black/40 to-transparent p-6 text-center border-b border-white/5">
             <h2 className="egyptian-font text-2xl font-black text-[#d4af37] uppercase tracking-widest">{theme.name}</h2>
             <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1">{theme.motif}</p>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(name => (
                <div key={name} className="text-center text-[10px] font-black text-gray-700 py-2">{name}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                const hasGoals = goalsByDay[day] && goalsByDay[day].length > 0;
                const allDone = hasGoals && goalsByDay[day].every(g => g.completed);

                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      isSelected ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg' : 
                      allDone ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                      'bg-black/20 border-white/5 text-gray-400'
                    }`}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {goalsByDay[day]?.slice(0, 3).map((g) => (
                        <div key={g.id} className={`w-0.5 h-0.5 rounded-full ${g.completed ? 'bg-green-500' : isSelected ? 'bg-black/50' : 'bg-[#d4af37]'}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day View - Integrated below on mobile */}
        <div className="space-y-4">
           {selectedDay && (
             <div className="bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/20 p-6 shadow-xl animate-scaleUp">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]"><Sun size={20} /></div>
                  <h3 className="egyptian-font text-lg text-white">{selectedDay} {theme.name}</h3>
                </div>
                <div className="space-y-3">
                  {selectedDayGoals.length > 0 ? selectedDayGoals.map(goal => (
                    <button 
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                        goal.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/10'
                      }`}
                    >
                      <div className={goal.completed ? 'text-green-500' : 'text-gray-600'}>
                        {goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <span className={`text-sm font-bold ${goal.completed ? 'line-through text-green-500/60' : 'text-gray-200'}`}>{goal.title}</span>
                    </button>
                  )) : (
                    <div className="text-center py-8 text-gray-700 text-[10px] font-black uppercase tracking-widest">Repos du Scribe</div>
                  )}
                </div>
             </div>
           )}

           {recurringGoals.length > 0 && (
             <div className="bg-black/40 rounded-3xl border border-white/5 p-6">
                <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14}/> Rituels du mois</h4>
                <div className="space-y-2">
                  {recurringGoals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-xs font-bold text-gray-400">{goal.title}</span>
                      <button onClick={() => toggleGoal(goal.id)} className={goal.completed ? 'text-green-500' : 'text-gray-700'}>
                         {goal.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
