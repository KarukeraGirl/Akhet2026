
import React from 'react';
import { Download, Upload, Trash2, ShieldCheck, Database, FileJson, RefreshCw } from 'lucide-react';

interface Props {
  exportData: () => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetData: () => void;
}

const SettingsView: React.FC<Props> = ({ exportData, importData, resetData }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-24">
      <div className="bg-[#1a1a1a] rounded-3xl border border-[#d4af37]/20 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Database size={180} className="text-[#d4af37]" />
        </div>
        
        <div className="relative z-10">
          <h2 className="egyptian-font text-3xl text-[#d4af37] mb-2 uppercase">Archives Sacrées</h2>
          <p className="text-gray-400 text-sm mb-10 max-w-xl">
            Vos données Akhet sont stockées localement dans votre navigateur. 
            Utilisez les outils ci-dessous pour sécuriser vos progrès sur un fichier physique ou restaurer une ancienne session.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Export */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-[#d4af37]/30 transition-all">
              <div className="p-3 bg-[#d4af37]/10 rounded-xl w-fit text-[#d4af37]">
                <Download size={24} />
              </div>
              <h3 className="font-bold text-lg text-white">Exporter les Archives</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Téléchargez un fichier JSON contenant tous vos objectifs, livres, voyages et progrès sportifs de l'année 2026.
              </p>
              <button 
                onClick={exportData}
                className="w-full bg-[#d4af37] text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/40"
              >
                <FileJson size={18} /> Télécharger le fichier
              </button>
            </div>

            {/* Import */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-blue-500/30 transition-all">
              <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-500">
                <Upload size={24} />
              </div>
              <h3 className="font-bold text-lg text-white">Importer des Archives</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Restaurez vos données à partir d'un fichier JSON précédemment téléchargé. 
                Attention, cela remplacera vos données actuelles.
              </p>
              <label className="w-full bg-blue-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer text-center">
                <Upload size={18} /> Choisir un fichier
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-red-500/20 p-8 shadow-xl">
        <h3 className="text-red-500 font-bold text-sm mb-6 uppercase flex items-center gap-2 tracking-widest">
          <Trash2 size={16} /> Zone de Danger
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <div className="space-y-1">
            <h4 className="font-bold text-white">Réinitialiser Akhet</h4>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Efface définitivement le stockage local du navigateur</p>
          </div>
          <button 
            onClick={resetData}
            className="px-8 py-3 bg-transparent border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Réinitialiser tout
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-200">Confidentialité Totale</h4>
          <p className="text-xs text-gray-500 italic">
            Akhet ne transmet aucune de vos données personnelles à des serveurs tiers. 
            Tout reste sur votre terminal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
