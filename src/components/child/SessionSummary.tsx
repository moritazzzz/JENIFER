import { motion } from 'motion/react';
import { type Child, type Session } from '../../types';
import { Trophy, Star, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface SessionSummaryProps {
  child: Child;
  session: Session;
  onDone: () => void;
  onBackToMap: () => void;
}

export function SessionSummary({ child, session, onDone, onBackToMap }: SessionSummaryProps) {
  useEffect(() => {
    // Grand finale
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#fbbf24']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-full bg-[#f8fbff] flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto custom-scrollbar">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 flex flex-wrap gap-20 p-20 select-none pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <Star key={i} className="w-12 h-12 text-blue-300" />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-3xl text-center relative z-10 border-4 border-white"
      >
        <motion.div
           animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="text-9xl mb-6 relative inline-block"
        >
          {child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-3 rounded-full border-4 border-white shadow-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-black text-gray-900 mb-2">¡Increíble trabajo, {child.name}!</h1>
        <p className="text-gray-500 font-bold mb-10 text-lg">Has completado tu aventura de hoy con éxito.</p>

        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-100 flex flex-col items-center">
              <Star className="w-10 h-10 text-yellow-500 fill-current mb-2" />
              <span className="text-3xl font-black text-yellow-700">+{session.starsEarned}</span>
              <span className="text-xs font-bold text-yellow-600/60 uppercase tracking-widest mt-1">Estrellas</span>
           </div>
           <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center">
              <Trophy className="w-10 h-10 text-blue-500 mb-2" />
              <span className="text-3xl font-black text-blue-700">+{session.pointsEarned}</span>
              <span className="text-xs font-bold text-blue-600/60 uppercase tracking-widest mt-1">Puntos</span>
           </div>
        </div>

        <div className="space-y-4 mb-10">
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                 <span className="font-bold text-gray-600">Palabras logradas</span>
              </div>
              <span className="text-xl font-black text-emerald-600">{session.correctCount} / {session.totalWords}</span>
           </div>
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                 <Clock className="w-6 h-6 text-indigo-500" />
                 <span className="font-bold text-gray-600">Tiempo de juego</span>
              </div>
              <span className="text-xl font-black text-indigo-600">{Math.floor(session.timeSpent / 60)} min</span>
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onBackToMap}
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] text-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transform hover:scale-105 transition-all"
          >
            Volver al Mapa <ArrowRight className="w-6 h-6" />
          </button>
          
          <button 
            onClick={onDone}
            className="w-full bg-white text-slate-400 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:text-slate-600 transition-all"
          >
            Ir al Inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
