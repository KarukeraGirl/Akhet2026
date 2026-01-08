
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Book, BookStatus, Reward, Goal } from '../types';
import { getBookDetails, extractIsbnFromImage } from '../services/gemini';
import { Plus, Search, Trash2, BookOpen, Camera, Check, Filter, X, Trophy, Circle, CheckCircle2, Loader2, Eye, Sparkles, RefreshCcw, AlertTriangle } from 'lucide-react';
import { MONTHS } from '../constants';

interface Props {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  rubricRewards: Reward[];
  rubricGoals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
}

const ReadingView: React.FC<Props> = ({ books, setBooks, rubricRewards, rubricGoals, addGoal, removeGoal, toggleGoal }) => {
  const [isbn, setIsbn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | BookStatus>('Tous');
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMonth, setCustomMonth] = useState(1);
  
  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      })
      .then(s => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        console.error("Erreur caméra:", err);
        alert("Impossible d'accéder à la caméra.");
        setIsScannerOpen(false);
      });
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isScannerOpen]);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const result = await extractIsbnFromImage(base64Image);
        if (result) {
          setDetectedIsbn(result);
        } else {
          alert("L'Oracle n'a pas pu identifier d'ISBN. Essayez d'être plus stable.");
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsCapturing(false);
  };

  const confirmDetectedIsbn = async () => {
    if (!detectedIsbn) return;
    const val = detectedIsbn;
    setDetectedIsbn(null);
    setIsScannerOpen(false);
    setIsbn(val);
    await handleAddBook(null, val);
  };

  const handleAddBook = async (e: React.FormEvent | null, directIsbn?: string) => {
    if (e) e.preventDefault();
    const targetIsbn = directIsbn || isbn;
    if (!targetIsbn) return;
    
    setLoading(true);
    const details = await getBookDetails(targetIsbn);
    if (details) {
      const newBook: Book = {
        id: Date.now().toString(),
        isbn: targetIsbn,
        title: details.title,
        author: details.author,
        coverUrl: details.coverUrl,
        status: 'À lire',
        addedAt: new Date().toISOString()
      };
      setBooks(prev => {
        if (prev.find(b => b.isbn === targetIsbn)) {
          alert("Ce livre est déjà dans votre bibliothèque.");
          return prev;
        }
        return [newBook, ...prev];
      });
      setIsbn('');
    } else {
      alert("Livre introuvable dans les archives sacrées. Vérifiez l'ISBN.");
    }
    setLoading(false);
  };

  const handleAddCustomGoal = () => {
    if (!customTitle) return;
    addGoal({
      title: customTitle,
      month: customMonth,
      category: 'Lecture',
      type: 'once'
    });
    setCustomTitle('');
  };

  const updateStatus = (id: string, status: BookStatus) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const removeBook = (id: string, title: string) => {
    if (window.confirm(`Voulez-vous vraiment retirer "${title}" de votre bibliothèque sacrée ?`)) {
      setBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, bookId: string) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://picsum.photos/seed/${bookId}/400/600?blur=2`;
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Tous' || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, searchQuery, statusFilter]);

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto relative">
      {/* Scanner Modal Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#d4af37]/30 shadow-[0_0_80px_rgba(212,175,55,0.15)] bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
            
            {/* Visual Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-72 h-40 border-2 border-dashed border-white/20 rounded-2xl relative flex items-center justify-center">
                {!detectedIsbn && !isCapturing && <div className="absolute left-0 right-0 h-0.5 bg-red-500/60 shadow-[0_0_10px_red] animate-[scan_2s_infinite]"></div>}
                
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]"></div>
                
                {detectedIsbn && (
                  <div className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-black text-sm animate-bounce shadow-xl">
                    SAGESSE EXTRAITE !
                  </div>
                )}
              </div>
              <p className="mt-8 egyptian-font text-[#d4af37] text-xs tracking-[0.3em] uppercase">
                {isCapturing ? "Consultation du Scribe..." : "Alignez le code-barres"}
              </p>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
            {detectedIsbn ? (
              <div className="w-full space-y-4 animate-scaleUp">
                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#d4af37]/40 text-center">
                  <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest block mb-1">Code Détecté :</span>
                  <span className="text-2xl font-black text-white tracking-widest">{detectedIsbn}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setDetectedIsbn(null)} className="flex-1 px-6 py-4 bg-white/5 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10">
                    <RefreshCcw size={18}/> Reprendre
                  </button>
                  <button onClick={confirmDetectedIsbn} className="flex-[2] px-6 py-4 bg-[#d4af37] text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-black/40">
                    <CheckCircle2 size={18}/> Valider
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 w-full">
                <button 
                  onClick={() => setIsScannerOpen(false)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  Fermer
                </button>
                <button 
                  onClick={handleScan}
                  disabled={isCapturing}
                  className="flex-[2] px-6 py-4 bg-[#d4af37] hover:bg-[#f0e68c] text-black rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50"
                >
                  {isCapturing ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Lire le code</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RUBRIC REWARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rubricRewards.map(reward => (
          <div key={reward.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${reward.unlocked ? 'bg-blue-500/10 border-blue-500/40 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'}`}>
            <span className="text-3xl">{reward.icon}</span>
            <div>
              <div className={`font-black text-[10px] uppercase tracking-widest ${reward.unlocked ? 'text-blue-500' : 'text-gray-500'}`}>{reward.title}</div>
              <div className="text-[9px] text-gray-400 font-medium">{reward.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls: Add Book */}
      <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#d4af37]/10 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-[#d4af37] flex items-center gap-2"><Plus size={16} /> Nouvel Ouvrage (ISBN)</label>
          <div className="relative">
            <input 
              type="text" 
              value={isbn} 
              onChange={(e) => setIsbn(e.target.value)} 
              placeholder="Ex: 978..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-all text-white placeholder:text-gray-700" 
            />
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#d4af37]/20 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/40 transition-all group"
              title="Scanner Thot"
            >
              <Camera size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        <button 
          onClick={handleAddBook} 
          disabled={loading || !isbn} 
          className="bg-[#d4af37] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-all uppercase text-xs tracking-widest shadow-lg shadow-black/40 disabled:opacity-50 h-[46px] min-w-[180px] flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Invoquer le livre'}
        </button>
      </div>

      {/* Filter & Search UI */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Titre, auteur..." className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/50 text-white" />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['Tous', 'À lire', 'En cours', 'Lu'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-[#1a1a1a] border border-white/5 text-gray-500 hover:border-blue-500/30 hover:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shelf */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 min-h-[400px]">
        {filteredBooks.map((book) => (
          <div key={book.id} className="group relative flex flex-col gap-4 animate-scaleUp">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-[#d4af37]/30 shadow-2xl transition-transform group-hover:-translate-y-2">
              <img 
                src={book.coverUrl} 
                className="w-full h-full object-cover bg-[#1a1a1a]" 
                alt={book.title} 
                onError={(e) => handleImageError(e, book.id)}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-2 gap-1 backdrop-blur-sm">
                <button onClick={() => updateStatus(book.id, 'Lu')} className="bg-green-600 text-white text-[10px] py-1.5 rounded font-black uppercase tracking-widest hover:bg-green-500">Marquer Lu</button>
                <button onClick={() => updateStatus(book.id, 'En cours')} className="bg-blue-600 text-white text-[10px] py-1.5 rounded font-black uppercase tracking-widest hover:bg-blue-500">En cours</button>
                <button onClick={() => removeBook(book.id, book.title)} className="bg-red-600 text-white text-[10px] py-1.5 rounded font-black uppercase tracking-widest hover:bg-red-500 flex items-center justify-center gap-1"><Trash2 size={10} /> Retirer</button>
              </div>
              {book.status === 'Lu' && <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border border-white/20"><Check size={14} strokeWidth={4} /></div>}
              {book.status === 'En cours' && <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg border border-white/20 animate-pulse"><BookOpen size={14} strokeWidth={2} /></div>}
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xs text-gray-200 line-clamp-2 min-h-[2rem]">{book.title}</h4>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter mb-2">{book.author}</p>
              <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded inline-block border ${
                book.status === 'Lu' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                book.status === 'En cours' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 
                'bg-gray-500/10 border-white/10 text-gray-500'
              }`}>
                {book.status}
              </div>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-4">
            <BookOpen size={48} className="text-gray-700" />
            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-sm">Le papyrus est vide</p>
          </div>
        )}
      </div>

      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-blue-500/20 shadow-xl">
        <h3 className="egyptian-font text-xl text-blue-500 mb-6 flex items-center gap-2">Défis du Scribe</h3>
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
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-600 ml-1">Objectif Spécifique</label>
            <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ex: Finir la trilogie..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white" />
          </div>
          <div className="w-full md:w-48 space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-600 ml-1">Mois</label>
            <select value={customMonth} onChange={(e) => setCustomMonth(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white">
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.name}</option>)}
            </select>
          </div>
          <button onClick={handleAddCustomGoal} className="bg-blue-600 text-white font-black px-8 py-3 rounded-xl hover:bg-blue-500 transition-all uppercase text-xs tracking-widest">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default ReadingView;
