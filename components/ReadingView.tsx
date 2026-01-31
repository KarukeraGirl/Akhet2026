
import React, { useState, useMemo } from 'react';
import { Book, BookStatus, Reward, Goal } from '../types';
import { getBookDetails, searchBookByText } from '../services/gemini';
import { Plus, Search, BookOpen, Check, Circle, CheckCircle2, Loader2, AlertTriangle, AlertCircle, Type as TypeIcon, Info, RefreshCcw, Trash2 } from 'lucide-react';

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
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
  const [pendingBook, setPendingBook] = useState<any>(null);

  const isValidIsbn13 = (str: string): boolean => {
    const clean = str.replace(/[^0-9]/g, '');
    if (clean.length !== 13) return false;
    if (!clean.startsWith('978') && !clean.startsWith('979')) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(clean[12]);
  };

  const handleAddBookByIsbn = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    const targetIsbn = isbn.replace(/[^0-9X]/g, '');
    if (!targetIsbn) {
      setError({ message: "Saisissez un ISBN pour l'archivage.", type: 'warning' });
      return;
    }
    if (targetIsbn.length === 13 && !isValidIsbn13(targetIsbn)) {
      setError({ message: "L'ISBN-13 semble invalide (clé de contrôle).", type: 'error' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const details = await getBookDetails(targetIsbn);
      if (details) {
        setPendingBook(details);
        setIsbn('');
      } else {
        setError({ message: "L'Oracle n'a pas trouvé cet ouvrage par ISBN.", type: 'warning' });
      }
    } catch (err) {
      setError({ message: "Erreur lors de la connexion aux archives.", type: 'error' });
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
        setError({ message: "Aucun livre trouvé avec ce titre.", type: 'warning' });
      }
    } catch (err) {
      setError({ message: "L'Oracle est silencieux, réessayez.", type: 'error' });
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
      coverUrl: details.coverUrl || '', 
      status: 'À lire', 
      addedAt: new Date().toISOString()
    };
    setBooks(prev => [newBook, ...prev]);
    setPendingBook(null);
    setError({ message: `"${details.title}" ajouté à vos lectures.`, type: 'info' });
    setTimeout(() => setError(null), 3000);
  };

  const removeBook = (id: string) => {
    if (window.confirm("Voulez-vous retirer cet ouvrage ?")) {
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
      {/* Recherche simple dans la collection existante */}
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

      {/* Ajout d'un nouveau livre */}
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#d4af37]/20 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BookOpen size={120} className="text-[#d4af37]" />
        </div>

        <div>
          <h3 className="egyptian-font text-[#d4af37] text-lg mb-4 flex items-center gap-2">
            <Plus size={20} className="bg-[#d4af37] text-black rounded-full p-0.5"/> Invoquer un Ouvrage
          </h3>
          
          <div className="space-y-4 relative z-10">
            {/* Recherche textuelle */}
            <form onSubmit={handleSearchByText} className="flex gap-2">
              <div className="relative flex-1">
                <TypeIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    value={textQuery} 
                    onChange={(e) => setTextQuery(e.target.value)} 
                    placeholder="Titre ou Auteur (ex: L'Alchimiste...)" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !textQuery.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-2xl uppercase text-[10px] tracking-widest disabled:opacity-30"
              >
                {loading && textQuery ? <Loader2 size={16} className="animate-spin" /> : "Chercher"}
              </button>
            </form>

            <div className="flex items-center gap-3">
               <div className="h-px flex-1 bg-white/5"></div>
               <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Ou par ISBN manuel</span>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {/* Saisie ISBN */}
            <form onSubmit={handleAddBookByIsbn} className="flex gap-2">
              <input 
                  type="text" 
                  value={isbn} 
                  onChange={(e) => setIsbn(e.target.value)} 
                  placeholder="ISBN-13 (ex: 978...)" 
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/40" 
              />
              <button 
                type="submit"
                disabled={loading || !isbn} 
                className="bg-[#d4af37] text-black font-black px-8 py-3 rounded-2xl uppercase text-[10px] tracking-widest disabled:opacity-30"
              >
                {loading && isbn ? <Loader2 size={16} className="animate-spin" /> : "Indexer"}
              </button>
            </form>
            
            {error && (
              <div className={`flex items-start gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl animate-fadeIn ${
                error.type === 'error' ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 
                error.type === 'warning' ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' : 
                'text-blue-400 bg-blue-500/10 border border-blue-500/20'
              }`}>
                {error.type === 'error' ? <AlertTriangle size={14} /> : <AlertCircle size={14} />} 
                {error.message}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation du résultat de recherche */}
        {pendingBook && (
          <div className="mt-6 p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl animate-scaleUp flex flex-col sm:flex-row gap-6 items-center sm:items-start">
             <div className="w-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl bg-black">
                <BookCover book={pendingBook} size="preview" />
             </div>
             <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="font-black text-white text-xl uppercase tracking-tighter">{pendingBook.title}</h4>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">de <span className="text-[#d4af37]">{pendingBook.author}</span></p>
                <div className="pt-6 flex gap-3 justify-center sm:justify-start">
                  <button onClick={() => confirmAddBook(pendingBook)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                    <Check size={14} strokeWidth={4} /> Confirmer l'indexation
                  </button>
                  <button onClick={() => setPendingBook(null)} className="bg-white/5 text-gray-500 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    Annuler
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Filtres de statut */}
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

      {/* Bibliothèque sacrée */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {filteredBooks.map((book) => (
          <div key={book.id} className="flex flex-col gap-3 group animate-fadeIn">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-[#d4af37]/20 shadow-xl bg-black">
              <BookCover book={book} />
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-3 gap-2 backdrop-blur-sm">
                <button onClick={() => updateStatus(book.id, 'Lu')} className="bg-green-600 hover:bg-green-500 text-white text-[9px] py-2.5 rounded-xl font-black transition-all">TERMINÉ</button>
                <button onClick={() => updateStatus(book.id, 'En cours')} className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] py-2.5 rounded-xl font-black transition-all">EN COURS</button>
                <button onClick={() => removeBook(book.id)} className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[9px] py-2.5 rounded-xl font-black transition-all mt-4 border border-red-600/30">SUPPRIMER</button>
              </div>
              
              {book.status === 'Lu' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border border-white/20">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
              {book.status === 'En cours' && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg border border-white/20">
                  <RefreshCcw size={12} strokeWidth={4} className="animate-spin" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-xs text-gray-200 truncate" title={book.title}>{book.title}</h4>
              <p className="text-[9px] text-gray-500 font-bold uppercase truncate tracking-wider">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant de couverture robuste
const BookCover: React.FC<{ book: any; size?: 'preview' | 'normal' }> = ({ book, size = 'normal' }) => {
  const [errorCount, setErrorCount] = useState(0);
  const [showTypography, setShowTypography] = useState(false);

  // Fallback direct si l'URL est manifestement vide
  React.useEffect(() => {
    if (!book.coverUrl || book.coverUrl.trim() === '') {
      if (book.isbn && book.isbn !== '0000000000000') {
         setErrorCount(1); // Tente OpenLibrary si on a un ISBN
      } else {
         setShowTypography(true); // Sinon direct texte
      }
    }
  }, [book.coverUrl, book.isbn]);

  const handleError = () => {
    if (errorCount === 0) {
      setErrorCount(1); // Tenter le fallback ISBN
    } else {
      setShowTypography(true); // Abandonner et montrer le texte
    }
  };

  const getUrl = () => {
    if (errorCount === 1 && book.isbn && book.isbn !== '0000000000000') {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    }
    return book.coverUrl;
  };

  if (showTypography) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#222] flex flex-col items-center justify-center p-4 text-center border-l-4 border-[#d4af37]/30 shadow-inner relative group/cover">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-egyptian-pattern"></div>
        <BookOpen size={size === 'preview' ? 32 : 48} className="text-[#d4af37]/20 mb-3" />
        
        <div className="relative z-10 flex flex-col gap-3">
          <div className="egyptian-font text-[#d4af37] text-[10px] md:text-[12px] uppercase leading-tight font-black tracking-tighter px-1 line-clamp-5 drop-shadow-lg">
            {book.title}
          </div>
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mx-auto"></div>
          <div className="text-[7px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1 italic">
            {book.author}
          </div>
        </div>

        {/* Bordure stylisée type livre de luxe */}
        <div className="absolute inset-2 border border-[#d4af37]/10 pointer-events-none rounded-lg"></div>
        <div className="absolute left-1 top-4 bottom-4 w-px bg-white/5"></div>
      </div>
    );
  }

  return (
    <img 
      src={getUrl()} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      alt={book.title} 
      loading="lazy"
      onError={handleError}
    />
  );
};

export default ReadingView;
