
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Book, BookStatus, Reward, Goal } from '../types';
import { getBookDetails, extractIsbnFromImage, searchBookByText } from '../services/gemini';
import { Plus, Search, Trash2, BookOpen, Camera, Check, Filter, X, Trophy, Circle, CheckCircle2, Loader2, Eye, Sparkles, RefreshCcw, AlertTriangle, AlertCircle, Type as TypeIcon } from 'lucide-react';
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
  const [textQuery, setTextQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | BookStatus>('Tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Confirmation state for text search
  const [pendingBook, setPendingBook] = useState<any>(null);
  
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
        setScanError(null);
      })
      .catch(err => {
        console.error("Erreur caméra:", err);
        setScanError("Accès à la caméra refusé ou non disponible.");
      });
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isScannerOpen]);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    setScanError(null);
    
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
          setScanError("L'ISBN n'a pas pu être identifié. Assure-toi que le code-barres est bien éclairé et net.");
        }
      } catch (err) { 
        setScanError("Une erreur est survenue lors de l'analyse de l'image.");
        console.error(err); 
      }
    }
    setIsCapturing(false);
  };

  const handleAddBookByIsbn = async (e: React.FormEvent | null, directIsbn?: string) => {
    if (e) e.preventDefault();
    const targetIsbn = directIsbn || isbn;
    if (!targetIsbn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const details = await getBookDetails(targetIsbn);
      if (details) {
        confirmAddBook(details);
        setIsbn('');
        if (isScannerOpen) setIsScannerOpen(false);
      } else {
        setError("Livre introuvable pour cet ISBN. Vérifie le numéro saisi.");
      }
    } catch (err) {
      setError("Impossible de récupérer les informations du livre.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setPendingBook(null);
    
    try {
      const details = await searchBookByText(textQuery);
      if (details) {
        setPendingBook(details);
        setTextQuery('');
      } else {
        setError("Aucun livre ne semble correspondre à cette recherche.");
      }
    } catch (err) {
      setError("Erreur lors de la recherche textuelle.");
    } finally {
      setLoading(false);
    }
  };

  const confirmAddBook = (details: any) => {
    const newBook: Book = {
      id: Date.now().toString(), 
      isbn: details.isbn || '0000000000000', 
      title: details.title, 
      author: details.author,
      coverUrl: details.coverUrl, 
      status: 'À lire', 
      addedAt: new Date().toISOString()
    };
    
    setBooks(prev => {
      if (prev.find(b => b.isbn === newBook.isbn && newBook.isbn !== '0000000000000')) return prev;
      return [newBook, ...prev];
    });
    setPendingBook(null);
  };

  const removeBook = (id: string) => {
    if (window.confirm("Voulez-vous retirer ce livre de votre bibliothèque ?")) {
      setBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  const updateStatus = (id: string, status: BookStatus) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Tous' || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Dashboard Search (Filter) */}
      <div className="bg-[#1a1a1a] p-4 rounded-3xl border border-[#d4af37]/20 shadow-xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Rechercher dans ma collection..." 
            className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/40" 
          />
        </div>
      </div>

      {/* Manual Add Section */}
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#d4af37]/20 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Sparkles size={120} className="text-[#d4af37]" />
        </div>

        <div>
          <h3 className="egyptian-font text-[#d4af37] text-lg mb-4 flex items-center gap-2">
            <Plus size={20} className="bg-[#d4af37] text-black rounded-full p-0.5"/> Invoquer un Ouvrage
          </h3>
          
          <div className="space-y-4 relative z-10">
            {/* Text Search Field */}
            <form onSubmit={handleSearchByText} className="flex gap-2">
              <div className="relative flex-1">
                <TypeIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    value={textQuery} 
                    onChange={(e) => setTextQuery(e.target.value)} 
                    placeholder="Titre ou Auteur (ex: Le Petit Prince...)" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !textQuery.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-2xl uppercase text-[10px] tracking-widest disabled:opacity-30 transition-all"
              >
                {loading && textQuery ? <Loader2 size={16} className="animate-spin" /> : "Chercher"}
              </button>
            </form>

            <div className="flex items-center gap-3">
               <div className="h-px flex-1 bg-white/5"></div>
               <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Ou via ISBN</span>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {/* ISBN/Camera Field */}
            <div className="flex gap-2">
              <input 
                  type="text" 
                  value={isbn} 
                  onChange={(e) => setIsbn(e.target.value)} 
                  placeholder="ISBN (ex: 978...)" 
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/40 transition-all" 
              />
              <button 
                onClick={() => setIsScannerOpen(true)} 
                className="p-3 bg-[#d4af37]/20 text-[#d4af37] rounded-2xl hover:bg-[#d4af37]/30 transition-all"
              >
                <Camera size={20}/>
              </button>
              <button 
                onClick={() => handleAddBookByIsbn(null)} 
                disabled={loading || !isbn} 
                className="bg-[#d4af37] text-black font-black px-6 rounded-2xl uppercase text-[10px] tracking-widest disabled:opacity-30 transition-all"
              >
                {loading && isbn ? <Loader2 size={16} className="animate-spin" /> : "Ajouter"}
              </button>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 animate-fadeIn">
                <AlertTriangle size={14} /> {error}
              </div>
            )}
          </div>
        </div>

        {/* Search Result Confirmation UI */}
        {pendingBook && (
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-scaleUp flex flex-col sm:flex-row gap-6 items-center sm:items-start">
             <div className="w-24 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                <img src={pendingBook.coverUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150x225/111/d4af37?text=?')} />
             </div>
             <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="font-bold text-white text-lg">{pendingBook.title}</h4>
                <p className="text-sm text-gray-400 font-medium">de <span className="text-[#d4af37]">{pendingBook.author}</span></p>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">ISBN: {pendingBook.isbn}</p>
                <div className="pt-4 flex gap-3 justify-center sm:justify-start">
                  <button onClick={() => confirmAddBook(pendingBook)} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <Check size={14} strokeWidth={4} /> Ajouter à la bibliothèque
                  </button>
                  <button onClick={() => setPendingBook(null)} className="bg-white/5 text-gray-400 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    Annuler
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(['Tous', 'À lire', 'En cours', 'Lu'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              statusFilter === status 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-[#1a1a1a] border border-white/5 text-gray-500 hover:text-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {filteredBooks.map((book) => (
          <div key={book.id} className="flex flex-col gap-3 group animate-fadeIn">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-[#d4af37]/20 shadow-xl bg-black/40">
              <img 
                src={book.coverUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={book.title} 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450/1a1a1a/d4af37?text=Pas+de+Couverture'; }}
              />
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-3 gap-2">
                <button onClick={() => updateStatus(book.id, 'Lu')} className="bg-green-600 hover:bg-green-500 text-white text-[9px] py-2.5 rounded-xl font-black transition-all">TERMINÉ</button>
                <button onClick={() => updateStatus(book.id, 'En cours')} className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] py-2.5 rounded-xl font-black transition-all">LIRE</button>
                <button onClick={() => removeBook(book.id)} className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[9px] py-2.5 rounded-xl font-black transition-all mt-4 border border-red-600/30">SUPPRIMER</button>
              </div>
              
              {book.status === 'Lu' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
              {book.status === 'En cours' && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                  <RefreshCcw size={12} strokeWidth={4} className="animate-spin" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-xs text-gray-200 truncate" title={book.title}>{book.title}</h4>
              <p className="text-[9px] text-gray-500 font-bold uppercase truncate">{book.author}</p>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <BookOpen size={40} className="mx-auto text-gray-800" />
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Aucun livre dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* ISBN Scanner Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fadeIn">
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            {/* Guide frame */}
            <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none flex items-center justify-center">
              <div className="w-full max-w-[280px] h-[180px] border-2 border-[#d4af37] rounded-3xl relative shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                 <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_red] animate-[scan_2s_infinite]"></div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsScannerOpen(false)} 
              className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 pb-12 w-full flex flex-col gap-6 bg-[#121212] border-t border-[#d4af37]/20">
            {scanError && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-scaleUp">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 font-medium">{scanError}</p>
              </div>
            )}

            {detectedIsbn ? (
              <div className="space-y-4 animate-scaleUp">
                <div className="text-center space-y-1">
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ISBN Détecté</div>
                  <div className="text-2xl font-black text-[#d4af37] tracking-wider">{detectedIsbn}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      handleAddBookByIsbn(null, detectedIsbn);
                    }} 
                    disabled={loading}
                    className="flex-1 bg-[#d4af37] text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />} Confirmer
                  </button>
                  <button 
                    onClick={() => {
                      setDetectedIsbn(null);
                      setScanError(null);
                    }} 
                    className="flex-1 bg-white/5 text-gray-300 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleScan} 
                disabled={isCapturing} 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3"
              >
                {isCapturing ? <Loader2 size={20} className="animate-spin" /> : <Eye size={20}/>}
                {isCapturing ? "Analyse..." : "Scanner"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingView;
