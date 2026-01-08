
import React, { useState } from 'react';
import { Goal, Reward, Certification, CertificationStatus, IoTProject, Training, TrainingStatus, ActiveWatch, WatchType } from '../types';
import { Brain, GraduationCap, Video, Cpu, Plus, CheckCircle, Circle, Trophy, Trash2, CheckCircle2, Edit3, Check, X, Calendar, MessageSquare, AlertCircle, Award, Target, Link as LinkIcon, ExternalLink, Wrench, BookOpen, Mic, Play, Activity as ActivityIcon } from 'lucide-react';
import { MONTHS } from '../constants';

interface Props {
  goals: Goal[];
  certifications: Certification[];
  iotProjects: IoTProject[];
  trainings: Training[];
  activeWatches: ActiveWatch[];
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  updateIoTProject: (id: string, updates: Partial<IoTProject>) => void;
  updateTraining: (id: string, updates: Partial<Training>) => void;
  addActiveWatch: (watch: Omit<ActiveWatch, 'id'>) => void;
  removeActiveWatch: (id: string) => void;
  rubricRewards: Reward[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  updateGoalTitle: (id: string, title: string) => void;
}

const KnowledgeView: React.FC<Props> = ({ 
  goals, 
  certifications, 
  iotProjects,
  trainings,
  activeWatches,
  updateCertification, 
  updateIoTProject,
  updateTraining,
  addActiveWatch,
  removeActiveWatch,
  rubricRewards, 
  addGoal, 
  removeGoal, 
  toggleGoal, 
  updateGoalTitle 
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [tempEditTitle, setTempEditTitle] = useState('');

  // Active Watch Form State
  const [watchTitle, setWatchTitle] = useState('');
  const [watchType, setWatchType] = useState<WatchType>('Vidéo');
  const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddGoal = () => {
    if (!customTitle) return;
    addGoal({
      title: customTitle,
      month: customMonth,
      category: 'Connaissance',
      type: 'once'
    });
    setCustomTitle('');
    setIsAddingGoal(false);
  };

  const handleAddWatch = () => {
    if (!watchTitle) return;
    addActiveWatch({ title: watchTitle, type: watchType, date: watchDate });
    setWatchTitle('');
  };

  const saveEditingGoal = (id: string) => {
    if (tempEditTitle.trim()) {
      updateGoalTitle(id, tempEditTitle.trim());
    }
    setEditingGoalId(null);
  };

  const getCertStatusIcon = (status: CertificationStatus) => {
    switch (status) {
      case 'À réaliser': return <Target size={18} className="text-gray-500" />;
      case 'En cours': return <ActivityIcon size={18} className="text-blue-500 animate-pulse" />;
      case 'Examen planifié': return <Calendar size={18} className="text-amber-500" />;
      case 'Réussie': return <Award size={18} className="text-emerald-500" />;
      case 'Échouée': return <AlertCircle size={18} className="text-rose-500" />;
    }
  };

  const getCertStatusColor = (status: CertificationStatus) => {
    switch (status) {
      case 'À réaliser': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'En cours': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Examen planifié': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Réussie': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Échouée': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
  };

  const getTrainingStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case 'À faire': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'En cours': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Terminé': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const getWatchIcon = (type: WatchType) => {
    switch (type) {
      case 'Vidéo': return <Video size={14} />;
      case 'Podcast': return <Mic size={14} />;
      case 'Newsletter': return <BookOpen size={14} />;
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      {/* Récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rubricRewards.map(reward => (
          <div key={reward.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${reward.unlocked ? 'bg-purple-500/10 border-purple-500/40 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}>
            <span className="text-3xl">{reward.icon}</span>
            <div>
              <div className={`font-black text-[10px] uppercase tracking-widest ${reward.unlocked ? 'text-purple-500' : 'text-gray-500'}`}>{reward.title}</div>
              <div className="text-[9px] text-gray-400 font-medium">{reward.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes Info Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KnowledgeCard title="Formations" icon={<GraduationCap className="text-blue-500" />} count={`${trainings.filter(t => t.status === 'Terminé').length}/4`} desc="Chantiers du savoir complétés." />
        <KnowledgeCard title="Certifications" icon={<Award className="text-purple-500" />} count={`${certifications.filter(c => c.status === 'Réussie').length}/2`} desc="Preuves de sagesse certifiées." />
        <KnowledgeCard title="Veille Active" icon={<ActivityIcon className="text-amber-500" />} count={`${activeWatches.length}`} desc="Explorations consignées." />
        <KnowledgeCard title="Atelier IoT" icon={<Cpu className="text-emerald-500" />} count={`${iotProjects.filter(p => p.title && p.endDate).length}/2`} desc="Ouvrages d'Imhotep réalisés." />
      </div>

      {/* Section Formations - 4 par an */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-blue-500/20 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <GraduationCap size={180} className="text-blue-500" />
        </div>
        <h2 className="egyptian-font text-2xl text-blue-500 mb-8 flex items-center gap-3">
          <BookOpen className="text-blue-500" /> Chantiers du Savoir (Formations)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {trainings.map((training, index) => (
            <div key={training.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Ouvrage #{index + 1}</span>
                <select 
                  value={training.status} 
                  onChange={(e) => updateTraining(training.id, { status: e.target.value as TrainingStatus })}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${getTrainingStatusColor(training.status)}`}
                >
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Nom de la Formation</label>
                   <input 
                     value={training.title} 
                     onChange={(e) => updateTraining(training.id, { title: e.target.value })}
                     placeholder="Ex: Mastère React, Design Patterns..."
                     className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Description</label>
                   <textarea 
                     value={training.description} 
                     onChange={(e) => updateTraining(training.id, { description: e.target.value })}
                     placeholder="Objectifs de la formation..."
                     rows={1}
                     className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-300 resize-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Début</label>
                    <input type="date" value={training.startDate} onChange={(e) => updateTraining(training.id, { startDate: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Fin</label>
                    <input type="date" value={training.endDate} onChange={(e) => updateTraining(training.id, { endDate: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Lien Plateforme (URL)</label>
                   <div className="relative">
                     <input value={training.platformUrl} onChange={(e) => updateTraining(training.id, { platformUrl: e.target.value })} placeholder="https://..." className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs focus:outline-none focus:border-blue-500 text-blue-400" />
                     <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Espace Commentaires</label>
                   <textarea value={training.comment} onChange={(e) => updateTraining(training.id, { comment: e.target.value })} placeholder="Notes, progression..." rows={2} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-gray-400 resize-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Certifications - DETAILED */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/30 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
            <Award size={180} className="text-[#d4af37]" />
        </div>
        <h2 className="egyptian-font text-2xl text-[#d4af37] mb-8 flex items-center gap-3">
          <Award className="text-[#d4af37]" /> Épreuves de Sagesse (Certifications)
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {certifications.map((cert, index) => (
            <div key={cert.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-[#d4af37]/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-[0.2em]">Certification #{index + 1}</span>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 ${getCertStatusColor(cert.status)}`}>
                  {getCertStatusIcon(cert.status)}
                  {cert.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Intitulé de l'Épreuve</label>
                   <input 
                     value={cert.title} 
                     onChange={(e) => updateCertification(cert.id, { title: e.target.value })}
                     placeholder="Ex: AWS Certified Solutions Architect..."
                     className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] text-white"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Date Butoire / Examen</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={cert.deadline} 
                        onChange={(e) => updateCertification(cert.id, { deadline: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#d4af37] text-white appearance-none"
                      />
                      <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Changer le Statut</label>
                    <select 
                      value={cert.status} 
                      onChange={(e) => updateCertification(cert.id, { status: e.target.value as CertificationStatus })}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#d4af37] text-white appearance-none cursor-pointer"
                    >
                      <option value="À réaliser">À réaliser</option>
                      <option value="En cours">En cours</option>
                      <option value="Examen planifié">Examen planifié</option>
                      <option value="Réussie">Réussie</option>
                      <option value="Échouée">Échouée</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Annotations du Scribe (Commentaires)</label>
                  <div className="relative">
                    <textarea 
                      value={cert.comment} 
                      onChange={(e) => updateCertification(cert.id, { comment: e.target.value })}
                      placeholder="Progression, chapitres difficiles, ressources..."
                      rows={2}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs focus:outline-none focus:border-[#d4af37] text-gray-300 resize-none"
                    />
                    <MessageSquare size={14} className="absolute left-4 top-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Veille Active (Journal) - KEEPING NEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#1a1a1a] rounded-3xl border border-amber-500/20 p-8 shadow-xl">
           <h2 className="egyptian-font text-xl text-amber-500 mb-6 flex items-center gap-3">
             <Mic className="text-amber-500" /> Éclaireurs du Nil
           </h2>
           <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Qu'avez-vous découvert ?</label>
                <input value={watchTitle} onChange={(e) => setWatchTitle(e.target.value)} placeholder="Titre du contenu..." className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Type</label>
                  <select value={watchType} onChange={(e) => setWatchType(e.target.value as WatchType)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white appearance-none cursor-pointer">
                    <option value="Vidéo">Vidéo</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Date</label>
                  <input type="date" value={watchDate} onChange={(e) => setWatchDate(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white" />
                </div>
              </div>
              <button onClick={handleAddWatch} className="w-full bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10">
                <Plus size={18}/> Consigner
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 shadow-xl max-h-[450px] overflow-y-auto custom-scrollbar">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-6 flex items-center gap-2">Archives de la Veille</h3>
           <div className="space-y-3">
              {activeWatches.length > 0 ? activeWatches.map(watch => (
                <div key={watch.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-amber-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                      {getWatchIcon(watch.type)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-200">{watch.title}</div>
                      <div className="text-[9px] text-gray-500 font-black uppercase">{watch.type} • {watch.date}</div>
                    </div>
                  </div>
                  <button onClick={() => removeActiveWatch(watch.id)} className="p-2 text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14}/>
                  </button>
                </div>
              )) : (
                <div className="text-center py-20 text-gray-700 italic text-xs">Aucune veille consignée. Commencez votre exploration du savoir.</div>
              )}
           </div>
        </div>
      </div>

      {/* Section Projets IoT - DETAILED RESTORED */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-emerald-500/20 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-45">
            <Cpu size={180} className="text-emerald-500" />
        </div>
        <h2 className="egyptian-font text-2xl text-emerald-500 mb-8 flex items-center gap-3">
          <Wrench className="text-emerald-500" /> Atelier d'Imhotep (Projets IoT)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {iotProjects.map((project, index) => (
            <div key={project.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Ouvrage IoT #{index + 1}</span>
                {project.linkUrl && (
                  <a 
                    href={project.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Nom du Projet</label>
                   <input 
                     value={project.title} 
                     onChange={(e) => updateIoTProject(project.id, { title: e.target.value })}
                     placeholder="Ex: Station Météo Solaire, Domotique ESP32..."
                     className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Description & Ambition</label>
                   <textarea 
                     value={project.description} 
                     onChange={(e) => updateIoTProject(project.id, { description: e.target.value })}
                     placeholder="Objectifs, capteurs utilisés, microcontrôleur..."
                     rows={2}
                     className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-gray-300 resize-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Début du Chantier</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={project.startDate} 
                        onChange={(e) => updateIoTProject(project.id, { startDate: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-white appearance-none"
                      />
                      <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Fin Estimée</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={project.endDate} 
                        onChange={(e) => updateIoTProject(project.id, { endDate: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-white appearance-none"
                      />
                      <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Lien de Référence (URL / Vidéo)</label>
                   <div className="relative">
                     <input 
                       value={project.linkUrl} 
                       onChange={(e) => updateIoTProject(project.id, { linkUrl: e.target.value })}
                       placeholder="https://..."
                       className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs focus:outline-none focus:border-emerald-500 text-blue-400"
                     />
                     <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Objectifs (Existant) */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="egyptian-font text-2xl text-white flex items-center gap-3">
             <Target className="text-blue-500" /> Piliers du Savoir
          </h2>
          <button onClick={() => setIsAddingGoal(!isAddingGoal)} className={`p-2 rounded-xl transition-all ${isAddingGoal ? 'bg-red-500 text-white' : 'bg-[#d4af37] text-black hover:scale-110'}`}>
            <Plus size={24} className={isAddingGoal ? 'rotate-45' : ''} />
          </button>
        </div>

        {isAddingGoal && (
          <div className="mb-10 p-6 bg-black/40 rounded-2xl border border-[#d4af37]/30 animate-scaleUp">
            <h4 className="text-xs font-black uppercase text-[#d4af37] mb-4">Nouvel Enseignement</h4>
            <div className="flex flex-col md:flex-row gap-4">
              <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex: Apprendre Three.js, Lire 10 articles IA..." className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]" />
              <select value={customMonth} onChange={(e) => setCustomMonth(parseInt(e.target.value))} className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]">
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
              </select>
              <button onClick={handleAddGoal} className="bg-[#d4af37] text-black font-black px-8 py-3 rounded-xl uppercase text-xs">Inscrire</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {goals.map(g => (
            <div key={g.id} className={`p-4 rounded-2xl flex items-center justify-between border group transition-all ${g.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-black/40 border-white/5'} ${editingGoalId === g.id ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : ''}`}>
              <div className="flex items-center gap-4 flex-1">
                <button onClick={() => toggleGoal(g.id)} className={g.completed ? 'text-green-500' : 'text-gray-600'}>
                  {g.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  {editingGoalId === g.id ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={tempEditTitle} onChange={(e) => setTempEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditingGoal(g.id)} className="bg-black/60 border border-[#d4af37]/50 rounded-lg px-3 py-1.5 text-sm text-[#d4af37] focus:outline-none w-full max-w-md" />
                      <button onClick={() => saveEditingGoal(g.id)} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500"><Check size={16}/></button>
                      <button onClick={() => setEditingGoalId(null)} className="p-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10"><X size={16}/></button>
                    </div>
                  ) : (
                    <>
                      <div className={`font-bold text-sm flex items-center gap-2 ${g.completed ? 'text-green-500 line-through opacity-70' : 'text-gray-300'}`}>
                        {g.title}
                        {!g.completed && <button onClick={() => { setEditingGoalId(g.id); setTempEditTitle(g.title); }} className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-[#d4af37] transition-all"><Edit3 size={14} /></button>}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">{MONTHS[g.month-1].name}</div>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => removeGoal(g.id)} className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KnowledgeCard = ({ title, icon, count, desc }: any) => (
  <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
      <span className="text-lg font-black text-white">{count}</span>
    </div>
    <div>
      <h4 className="font-bold text-gray-200">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default KnowledgeView;
