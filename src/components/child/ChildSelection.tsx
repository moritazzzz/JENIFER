import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Star, Trophy, ChevronRight } from 'lucide-react';
import { db, auth } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../services/firebase';
import { type Child } from '../../types';
import { cn } from '../../lib/utils';

interface ChildSelectionProps {
  onSelect: (child: Child) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export function ChildSelection({ onSelect, onCreateNew, onBack }: ChildSelectionProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyChildren();
  }, []);

  const fetchMyChildren = async () => {
    const path = 'children';
    try {
      // Buscamos niños asociados al ID del terapeuta actual (o cuenta invidado)
      const therapistId = auth.currentUser?.uid || 'guest-therapist';
      const q = query(collection(db, path), where('therapistId', '==', therapistId));
      const snapshot = await getDocs(q);
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
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
          
          <div className="w-14" /> {/* Spacer for centering */}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">✨</motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {children.map(child => (
              <motion.button
                key={child.id}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(child)}
                className="bg-white/80 backdrop-blur-md border-8 border-white rounded-[3rem] p-8 shadow-2xl group flex flex-col items-center text-center transition-all relative overflow-hidden"
              >
                {/* Theme strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-3" 
                  style={{ backgroundColor: child.themeColor || '#3B82F6' }}
                />

                <div className="text-8xl mb-6 group-hover:animate-bounce transform transition-transform mt-4">
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
                  <div 
                    className="flex items-center gap-1 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md"
                    style={{ backgroundColor: child.themeColor || '#3B82F6' }}
                  >
                    <Trophy className="w-4 h-4" />
                    {child.points}
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${Math.min(100, (child.points / 1000) * 100)}%`,
                      backgroundColor: child.themeColor || '#10B981'
                    }} 
                  />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel: {child.learningLevel}</p>
                
                <div 
                  className="mt-6 flex items-center justify-center gap-2 font-black uppercase text-sm"
                  style={{ color: child.themeColor || '#3B82F6' }}
                >
                   ¡ENTRAR! <ChevronRight className="w-4 h-4" />
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
