
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trip, TravelStatus, TravelMotive, Reward, Goal } from '../types';
import { getCountryVisuals } from '../services/gemini';
import { Plus, MapPin, MessageSquare, Edit3, Trash2, X, Map as MapIcon, Trophy, Circle, CheckCircle2, Calendar, Clock, Palmtree, Dumbbell, Compass, Globe, Info } from 'lucide-react';
import { MONTHS } from '../constants';
import L from 'leaflet';

interface Props {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  rubricRewards: Reward[];
  rubricGoals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
}

// Mapping des drapeaux d'identité (URLs SVG robustes)
const IDENTITY_FLAGS: Record<string, string> = {
  // Drapeau UPLG/GONG - Vert, Jaune, Rouge avec étoile jaune
  'GP': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Guadeloupe_%28UPLG%29.svg',
  // Drapeau Rouge-Vert-Noir (Officialisé par la CTM)
  'MQ': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Martinique.svg',
  // Drapeau de la Guyane (Indépendantiste)
  'GF': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Flag_of_French_Guiana.svg',
  // Drapeau Lo Mahavéli
  'RE': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Lo_Mahavéli.svg',
  // Drapeau Local Mayotte
  'YT': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Flag_of_Mayotte_%28local%29.svg',
  // Drapeau FLNKS (Kanaky)
  'NC': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_the_FLNKS.svg',
  // Drapeau de la Polynésie
  'PF': 'https://upload.wikimedia.org/wikipedia/commons/d/db/Flag_of_French_Polynesia.svg'
};

const TravelView: React.FC<Props> = ({ trips, setTrips, rubricRewards, rubricGoals, addGoal, removeGoal, toggleGoal }) => {
  const [newTripCountry, setNewTripCountry] = useState('');
  const [newTripMotive, setNewTripMotive] = useState<TravelMotive>('Vacances');
  const [newTripDate, setNewTripDate] = useState('');
  const [newTripDuration, setNewTripDuration] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const mapTrips = useMemo(() => {
    return trips.filter(t => t.lat !== undefined && t.lng !== undefined);
  }, [trips]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    mapTrips.forEach(trip => {
      const isDone = trip.status === 'Effectué';
      const color = isDone ? '#d4af37' : '#3b82f6';
      
      const marker = L.circleMarker([trip.lat!, trip.lng!], {
        radius: isDone ? 8 : 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      const popupContent = `
        <div style="font-family: 'Quicksand', sans-serif; min-width: 140px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <img src="${trip.flagUrl}" style="width: 24px; height: auto; border-radius: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" />
            <b style="color: #d4af37; text-transform: uppercase; font-size: 12px;">${trip.country}</b>
          </div>
          <div style="font-size: 10px; color: #aaa; margin-bottom: 4px;">
            ${trip.motive} • ${trip.duration} jours
          </div>
          <div style="font-size: 9px; font-weight: 900; color: #fff; background: ${color}; padding: 2px 8px; border-radius: 99px; display: inline-block;">
            ${trip.status}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -5]
      });

      markersRef.current?.addLayer(marker);
    });

    if (mapTrips.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(mapTrips.map(t => [t.lat!, t.lng!]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [mapTrips]);

  const addTrip = async () => {
    if (!newTripCountry) return;
    setLoading(true);
    try {
      const visuals = await getCountryVisuals(newTripCountry);
      let code = (visuals.code || 'FR').toUpperCase();
      
      // Sécurité pour la détection des territoires d'outre-mer
      const countryLower = newTripCountry.toLowerCase().trim();
      if (countryLower.includes('guadeloupe')) code = 'GP';
      else if (countryLower.includes('martinique')) code = 'MQ';
      else if (countryLower.includes('guyane')) code = 'GF';
      else if (countryLower.includes('réunion')) code = 'RE';
      else if (countryLower.includes('mayotte')) code = 'YT';
      else if (countryLower.includes('nouvelle-calédonie') || countryLower.includes('kanaky')) code = 'NC';
      else if (countryLower.includes('polynésie')) code = 'PF';

      const flagUrl = IDENTITY_FLAGS[code] || `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

      const newTrip: Trip = {
        id: Date.now().toString(),
        country: newTripCountry,
        countryCode: code,
        flagUrl: flagUrl,
        bgImageUrl: visuals.imageUrl || `https://picsum.photos/seed/${newTripCountry}/800/400`,
        status: 'À organiser',
        motive: newTripMotive,
        startDate: newTripDate,
        duration: newTripDuration,
        comment: '',
        lat: visuals.lat,
        lng: visuals.lng
      };
      setTrips(prev => [...prev, newTrip]);
      setNewTripCountry('');
      setNewTripDate('');
      setNewTripDuration(7);
      setNewTripMotive('Vacances');
    } catch (e) {
      console.error("Erreur Oracle Voyage", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: TravelStatus) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateTripField = (id: string, field: keyof Trip, value: any) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTrip = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce projet de voyage ?")) {
      setTrips(prev => prev.filter(t => t.id !== id));
    }
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

  const getMotiveIcon = (motive: TravelMotive) => {
    switch (motive) {
      case 'Vacances': return <Palmtree size={14} />;
      case 'Sport': return <Dumbbell size={14} />;
      case 'Autre': return <Compass size={14} />;
    }
  };

  const getMotiveColor = (motive: TravelMotive) => {
    switch (motive) {
      case 'Vacances': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'Sport': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'Autre': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* Mappemonde Interactive */}
      <div className="bg-[#1a1a1a] rounded-[2rem] border-2 border-[#d4af37]/20 shadow-2xl overflow-hidden relative group">
        <div className="p-6 border-b border-[#d4af37]/10 flex justify-between items-center bg-black/20">
          <h2 className="egyptian-font text-xl text-[#d4af37] flex items-center gap-3">
            <Globe className="text-[#d4af37]" /> Mappemonde de l'Horizon
          </h2>
          <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
             <Info size={12}/> Explorez vos expéditions
          </div>
        </div>

        <div className="relative aspect-[2/1] md:aspect-[2.5/1] bg-[#0d0d0d]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-50">
            <div className="text-[8px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Système de Navigation d'Akhet</div>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#d4af37]/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5"><MapIcon size={120} /></div>
        <div className="relative z-10">
          <h2 className="egyptian-font text-2xl text-[#d4af37] mb-6 flex items-center gap-3">
            <Compass size={24}/> Inscrire une Nouvelle Terre
          </h2>
          
          <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Destination (Pays ou Territoire)</label>
                <input 
                  type="text" 
                  value={newTripCountry} 
                  onChange={(e) => setNewTripCountry(e.target.value)} 
                  placeholder="Ex: Guadeloupe, Martinique, Japon..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] text-white" 
                />
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Motif</label>
                <select 
                  value={newTripMotive} 
                  onChange={(e) => setNewTripMotive(e.target.value as TravelMotive)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] text-white cursor-pointer"
                >
                  <option value="Vacances">Vacances</option>
                  <option value="Sport">Sport</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Date de départ</label>
                <input 
                  type="date" 
                  value={newTripDate} 
                  onChange={(e) => setNewTripDate(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] text-white" 
                />
              </div>
              <div className="w-full md:w-32 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Durée (Jours)</label>
                <input 
                  type="number" 
                  value={newTripDuration} 
                  onChange={(e) => setNewTripDuration(parseInt(e.target.value) || 0)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] text-white" 
                />
              </div>
              <button 
                onClick={addTrip} 
                disabled={loading || !newTripCountry} 
                className="bg-[#d4af37] text-black font-black px-10 py-3.5 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 min-w-[160px]"
              >
                {loading ? <Clock size={18} className="animate-spin" /> : <Plus size={20} />} 
                {loading ? 'Consultation...' : 'Planifier'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des voyages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {trips.map(trip => (
          <div key={trip.id} className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#d4af37]/10 flex flex-col shadow-2xl animate-scaleUp group">
            <div className="h-64 relative overflow-hidden">
              <img src={trip.bgImageUrl} className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-all duration-700" alt={trip.country} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-black/40" />
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 backdrop-blur-md ${getMotiveColor(trip.motive)}`}>
                  {getMotiveIcon(trip.motive)}
                  {trip.motive}
                </div>
                {trip.startDate && (
                  <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                    <Calendar size={12} className="text-[#d4af37]" />
                    {new Date(trip.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>

              {/* Drapeau haute définition */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-2xl">
                <div className="w-16 h-10 overflow-hidden rounded shadow-inner flex items-center justify-center bg-black/20">
                  <img 
                    src={trip.flagUrl} 
                    className="w-full h-full object-contain" 
                    alt={`Drapeau de ${trip.country}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('flagcdn')) {
                        target.src = `https://flagcdn.com/w160/${trip.countryCode.toLowerCase()}.png`;
                      }
                    }} 
                  />
                </div>
              </div>

              <div className="absolute bottom-4 left-6">
                <h3 className="text-4xl font-black text-white drop-shadow-md flex items-center gap-2 uppercase tracking-tighter">
                  <MapPin size={28} className="text-[#d4af37]" /> {trip.country}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2">
                {(['À organiser', 'Organisé', 'Effectué', 'Annulé', 'Reporté'] as TravelStatus[]).map(status => (
                  <button 
                    key={status} 
                    onClick={() => updateStatus(trip.id, status)} 
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${trip.status === status ? getStatusColor(status) + ' text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Carnet de Voyage</label>
                <textarea 
                  value={trip.comment} 
                  onChange={(e) => updateTripField(trip.id, 'comment', e.target.value)} 
                  placeholder="Activités, budget, souvenirs..." 
                  className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none resize-none focus:border-[#d4af37]/40 transition-colors" 
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="text-[10px] font-black uppercase text-[#d4af37] flex items-center gap-1">
                  <Clock size={14}/> {trip.duration} jours prévus
                </div>
                <button onClick={() => removeTrip(trip.id)} className="text-red-500/50 hover:text-red-500 flex items-center gap-1 text-[10px] font-black uppercase transition-colors">
                  <Trash2 size={14} /> Retirer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelView;
