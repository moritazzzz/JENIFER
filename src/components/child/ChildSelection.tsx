import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Star, Trophy, ChevronRight, Settings, Pencil } from 'lucide-react';
import { db, auth } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { type Child } from '../../types';
import { cn } from '../../lib/utils';

interface ChildSelectionProps {
  onSelect: (child: Child) => void;
  onCreateNew: () => void;
  onEdit: (child: Child) => void;
  onBack: () => void;
}

export function ChildSelection({ onSelect, onCreateNew, onEdit, onBack }: ChildSelectionProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchMyChildren();
  }, []);

  const fetchMyChildren = async () => {
    try {
      // Buscamos niños asociados al ID del terapeuta actual (o cuenta invidado)
      const therapistId = auth.currentUser?.uid || 'guest-therapist';
      const q = query(collection(db, 'children'), where('therapistId', '==', therapistId));
      const snapshot = await getDocs(q);
      setChildren(snapshot.docs.map(doc => doc.data() as Child));
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 relative overflow-y-auto custom-scrollbar" 
         style={{ background: "radial-gradient(circle at 50% 50%, #E0F2FE 0%, #BAE6FD 100%)" }}>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-10 text-6xl opacity-30 animate-pulse hidden md:block">☁️</div>
      <div className="absolute bottom-1/4 right-20 text-7xl opacity-20 hidden md:block">☁️</div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1200px] w-full z-10 py-10"
      >
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-4 border-white shadow-lg text-slate-600 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight text-center">
            ¿Quién va a jugar hoy?
          </h2>
          
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "p-4 rounded-2xl border-4 shadow-lg transition-all",
              isEditMode ? "bg-blue-500 border-blue-200 text-white" : "bg-white/80 backdrop-blur-md border-white text-slate-600 hover:scale-105"
            )}
            title="Administrar Perfiles"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">✨</motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {children.map(child => (
              <motion.button
                key={child.id}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => isEditMode ? onEdit(child) : onSelect(child)}
                className={cn(
                  "bg-white/80 backdrop-blur-md border-8 rounded-[3rem] p-8 shadow-2xl group flex flex-col items-center text-center transition-all relative overflow-hidden",
                  isEditMode ? "border-blue-400 ring-8 ring-blue-100" : "border-white"
                )}
              >
                {isEditMode && (
                  <div className="absolute top-6 right-6 bg-blue-500 text-white p-2 rounded-xl shadow-lg">
                    <Pencil className="w-4 h-4" />
                  </div>
                )}
                <div className="text-8xl mb-6 group-hover:animate-bounce transform transition-transform">
                  {child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tighter">
                  {child.name}
                </h3>

                <div className="flex gap-3 mb-6">
                  <div className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    <Star className="w-4 h-4 fill-current" />
                    {child.stars}
                  </div>
                  <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    <Trophy className="w-4 h-4" />
                    {child.points}
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-green-400" style={{ width: `${Math.min(100, (child.points / 1000) * 100)}%` }} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel: {child.learningLevel}</p>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-black uppercase text-sm">
                   {isEditMode ? 'ADMINISTRAR' : '¡ENTRAR!'} <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}

            <motion.button
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateNew}
              className="bg-white/40 border-8 border-dashed border-white rounded-[3rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-white/60 transition-all"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 group-hover:rotate-90 transition-transform">
                <UserPlus className="w-12 h-12 text-blue-500" />
              </div>
              <span className="text-xl font-black text-blue-600 uppercase tracking-tight">Nuevo Explorador</span>
              <p className="text-xs font-bold text-blue-400 mt-2 italic">"Crea tu propio personaje"</p>
            </motion.button>
          </div>
        )}
      </motion.div>

      {children.length === 0 && !loading && (
        <p className="mt-12 text-slate-500 font-bold italic animate-pulse">Parece que aún no hay exploradores. ¡Crea el primero! ✨</p>
      )}
    </div>
  );
}
