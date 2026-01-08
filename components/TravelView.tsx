
import React, { useState } from 'react';
import { Trip, TravelStatus, Reward, Goal } from '../types';
import { getCountryVisuals } from '../services/gemini';
import { Plus, MapPin, MessageSquare, Edit3, Trash2, X, Map, Trophy, Circle, CheckCircle2 } from 'lucide-react';
import { MONTHS } from '../constants';

interface Props {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  rubricRewards: Reward[];
  rubricGoals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
}

const TravelView: React.FC<Props> = ({ trips, setTrips, rubricRewards, rubricGoals, addGoal, removeGoal, toggleGoal }) => {
  const [newTripCountry, setNewTripCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);

  const addTrip = async () => {
    if (!newTripCountry) return;
    setLoading(true);
    const visuals = await getCountryVisuals(newTripCountry);
    const newTrip: Trip = {
      id: Date.now().toString(),
      country: newTripCountry,
      countryCode: visuals.code || 'FR',
      flagUrl: `https://flagcdn.com/w160/${(visuals.code || 'fr').toLowerCase()}.png`,
      bgImageUrl: visuals.imageUrl || `https://picsum.photos/seed/${newTripCountry}/800/400`,
      status: 'À organiser',
      comment: '',
    };
    setTrips(prev => [...prev, newTrip]);
    setNewTripCountry('');
    setLoading(false);
  };

  const handleAddCustomGoal = () => {
    if (!customTitle) return;
    addGoal({
      title: customTitle,
      month: customMonth,
      category: 'Voyage',
      type: 'once'
    });
    setCustomTitle('');
  };

  const updateStatus = (id: string, status: TravelStatus) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateComment = (id: string, comment: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, comment } : t));
  };

  const removeTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const getStatusColor = (status: TravelStatus) => {
    switch (status) {
      case 'À organiser': return 'bg-gray-500';
      case 'Organisé': return 'bg-blue-500';
      case 'Effectué': return 'bg-green-500';
      case 'Annulé': return 'bg-red-500';
      case 'Reporté': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rubricRewards.map(reward => (
          <div key={reward.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${reward.unlocked ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}>
            <span className="text-3xl">{reward.icon}</span>
            <div>
              <div className={`font-black text-[10px] uppercase tracking-widest ${reward.unlocked ? 'text-emerald-500' : 'text-gray-500'}`}>{reward.title}</div>
              <div className="text-[9px] text-gray-400 font-medium">{reward.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#d4af37]/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Map size={120} /></div>
        <div className="relative z-10">
          <h2 className="egyptian-font text-2xl text-[#d4af37] mb-6">Explorer l'Horizon</h2>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <input type="text" value={newTripCountry} onChange={(e) => setNewTripCountry(e.target.value)} placeholder="Pays pour 2026..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-[#d4af37]" />
            <button onClick={addTrip} disabled={loading || !newTripCountry} className="bg-[#d4af37] text-black font-black px-10 py-4 rounded-xl hover:scale-105 transition-all">
              {loading ? '...' : 'Planifier'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {trips.map(trip => (
          <div key={trip.id} className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#d4af37]/10 flex flex-col shadow-2xl animate-scaleUp">
            <div className="h-56 relative group">
              <img src={trip.bgImageUrl} className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                <img src={trip.flagUrl} className="w-12 rounded shadow-sm" />
              </div>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-3xl font-black text-white drop-shadow-md flex items-center gap-2 uppercase tracking-tighter">
                  <MapPin size={24} className="text-[#d4af37]" /> {trip.country}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2">
                {(['À organiser', 'Organisé', 'Effectué', 'Annulé', 'Reporté'] as TravelStatus[]).map(status => (
                  <button key={status} onClick={() => updateStatus(trip.id, status)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${trip.status === status ? getStatusColor(status) + ' text-white' : 'bg-white/5 text-gray-500'}`}>{status}</button>
                ))}
              </div>
              <textarea value={trip.comment} onChange={(e) => updateComment(trip.id, e.target.value)} placeholder="Notes..." className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none resize-none" />
              <div className="flex justify-end"><button onClick={() => removeTrip(trip.id)} className="text-red-500/50 hover:text-red-500 flex items-center gap-1 text-xs font-bold uppercase"><Trash2 size={14} /> Supprimer</button></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-emerald-500/20 shadow-xl mt-12">
        <h3 className="egyptian-font text-xl text-emerald-500 mb-6 flex items-center gap-2">Objectifs de Voyage Additionnels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rubricGoals.map(g => (
            <div key={g.id} className={`p-4 rounded-xl border flex items-center justify-between group ${g.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/5'}`}>
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
        <div className="flex flex-col md:flex-row gap-4 items-end pt-6 border-t border-white/5">
          <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex: Acheter matériel camping, Passeport..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" />
          <select value={customMonth} onChange={(e) => setCustomMonth(parseInt(e.target.value))} className="w-full md:w-48 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
          </select>
          <button onClick={handleAddCustomGoal} className="bg-emerald-600 text-white font-black px-8 py-3 rounded-xl hover:bg-emerald-500 transition-all uppercase text-xs tracking-widest">Ajouter</button>
        </div>
      </div>
    </div>
  );
};

export default TravelView;
