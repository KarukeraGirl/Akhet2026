
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

  // Logic to calculate the grid for 2026
  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const date = new Date(year, currentMonthIndex, 1);
    const days = new Date(year, currentMonthIndex + 1, 0).getDate();
    // getDay() returns 0 for Sunday, we want 0 for Monday
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

  const nextMonth = () => setCurrentMonthIndex((prev) => (prev + 1) % 12);
  const prevMonth = () => setCurrentMonthIndex((prev) => (prev - 1 + 12) % 12);

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const selectedDayGoals = selectedDay ? (goalsByDay[selectedDay] || []) : [];
  // Also include recurring goals for the selected day? 
  // For now, only show goals that have a specific day set.
  const recurringGoals = monthGoals.filter(g => g.type === 'recurring' && !g.day);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Calendar Grid */}
        <div className="flex-1 bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative h-40 flex items-center justify-between px-8 overflow-hidden bg-gradient-to-b from-black/40 to-transparent">
             <div className="absolute inset-0 opacity-10 pointer-events-none rotate-12 scale-150">
                <div className="hieroglyph-bg w-full h-full"></div>
             </div>
             
             <div className="z-10">
                <h2 className="egyptian-font text-4xl font-black text-[#d4af37] tracking-widest uppercase">{theme.name}</h2>
                <div className="text-[10px] font-black text-[#d4af37]/60 tracking-[0.4em] mt-1">{theme.motif} • 2026</div>
             </div>

             <div className="flex items-center gap-4 z-10">
                <button onClick={prevMonth} className="p-3 bg-black/60 hover:bg-[#d4af37]/20 rounded-xl text-[#d4af37] transition-all border border-[#d4af37]/10"><ChevronLeft size={24}/></button>
                <button onClick={nextMonth} className="p-3 bg-black/60 hover:bg-[#d4af37]/20 rounded-xl text-[#d4af37] transition-all border border-[#d4af37]/10"><ChevronRight size={24}/></button>
             </div>
          </div>

          {/* Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(name => (
                <div key={name} className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest py-2">{name}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl bg-black/10 border border-transparent opacity-20"></div>
              ))}

              {/* Day slots */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasGoals = goalsByDay[day] && goalsByDay[day].length > 0;
                const allDone = hasGoals && goalsByDay[day].every(g => g.completed);
                const isSelected = selectedDay === day;

                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all group ${
                      isSelected 
                        ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                        : 'bg-black/20 border-white/5 hover:border-[#d4af37]/40'
                    } ${allDone ? 'shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' : ''}`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#d4af37]' : 'text-gray-400'}`}>{day}</span>
                    
                    {/* Goal Indicators */}
                    <div className="flex gap-0.5 mt-1">
                      {goalsByDay[day]?.slice(0, 3).map((g, idx) => (
                        <div 
                          key={g.id} 
                          className={`w-1 h-1 rounded-full ${
                            g.completed ? 'bg-green-500' : 'bg-[#d4af37]'
                          }`}
                        />
                      ))}
                      {goalsByDay[day]?.length > 3 && <div className="w-1 h-1 rounded-full bg-white/40" />}
                    </div>

                    {allDone && (
                      <div className="absolute top-1 right-1">
                        <Sparkles size={10} className="text-green-500/40" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel: Daily Vision */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/20 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sun size={80} className="text-[#d4af37]" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                   <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="egyptian-font text-lg text-white">Vision du Jour</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {selectedDay} {theme.name} 2026
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedDayGoals.length > 0 ? selectedDayGoals.map(goal => (
                  <button 
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                      goal.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/10 hover:border-[#d4af37]/40'
                    }`}
                  >
                    <div className={goal.completed ? 'text-green-500' : 'text-gray-600'}>
                      {goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${goal.completed ? 'line-through text-green-500/60' : 'text-gray-200'}`}>
                        {goal.title}
                      </div>
                      <div className="text-[8px] font-black uppercase text-gray-500 mt-0.5">{goal.category}</div>
                    </div>
                  </button>
                )) : (
                  <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <Clock size={24} className="mx-auto text-gray-700 mb-2" />
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Aucun décret pour ce jour</p>
                  </div>
                )}
              </div>
           </div>

           {/* Monthly Recurring Quick View */}
           <div className="bg-[#1a1a1a] rounded-3xl border border-blue-500/10 p-6 shadow-xl">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={12} className="text-blue-500" /> Rituels du Mois
              </h4>
              <div className="space-y-3">
                {recurringGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400">{goal.title}</span>
                    <button onClick={() => toggleGoal(goal.id)} className={goal.completed ? 'text-green-500' : 'text-gray-700'}>
                       {goal.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>

      {/* Month Quick Selector */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {MONTHS.map((m, i) => (
          <button 
            key={m.name}
            onClick={() => setCurrentMonthIndex(i)}
            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              i === currentMonthIndex 
                ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg shadow-[#d4af37]/20' 
                : 'bg-black/40 text-gray-500 border-white/5 hover:border-[#d4af37]/40'
            }`}
          >
            {m.name.substring(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
