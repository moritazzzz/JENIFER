import { motion } from 'motion/react';
import { Sparkles, HeartHandshake, UserCircle } from 'lucide-react';

interface WelcomeProps {
  onChildAccess: () => void;
  onTherapistAccess: () => void;
  isAnonymousDisabled?: boolean;
}

export function Welcome({ onChildAccess, onTherapistAccess, isAnonymousDisabled }: WelcomeProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto relative custom-scrollbar" style={{ background: "radial-gradient(circle at 50% 50%, #E0F2FE 0%, #BAE6FD 100%)" }}>
      {/* Configuration Alert for Admins / Developers */}
      {isAnonymousDisabled && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border-4 border-yellow-400 p-4 rounded-3xl shadow-2xl max-w-md w-full flex items-center gap-4"
        >
          <div className="text-3xl">🛠️</div>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Configuración Pendiente</h4>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">
              Activa "Anonymous Auth" en Firebase Console para acceso instantáneo de invitados.
            </p>
          </div>
          <button 
            onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            className="shrink-0 bg-yellow-400 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-yellow-500 transition-colors"
          >
            Abrir Consola
          </button>
        </motion.div>
      )}
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 text-6xl opacity-30 animate-pulse hidden md:block">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl opacity-40 animate-bounce hidden md:block">☁️</div>
      <div className="absolute bottom-1/4 right-20 text-7xl opacity-20 hidden md:block">☁️</div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center z-10 max-w-3xl w-full px-4 py-12"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-10"
        >
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-white relative">
            <span className="text-[120px] drop-shadow-2xl">🦁</span>
            <div className="absolute -top-4 -right-4 bg-orange-400 p-4 rounded-full shadow-xl border-4 border-white">
              <Sparkles className="text-white w-8 h-8" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-black text-slate-800 mb-6 tracking-tight drop-shadow-sm uppercase">
          Aventura del Lenguaje
        </h1>
        <p className="text-2xl text-slate-600 mb-16 font-bold italic opacity-90">
          ¡Aprende jugando en mundos mágicos! ✨
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onChildAccess}
            className="flex flex-col items-center justify-center p-10 bg-amber-400 text-white rounded-[3rem] border-8 border-white shadow-[0_20px_50px_rgba(251,191,36,0.4)] group"
          >
            <div className="text-7xl mb-4 group-hover:animate-bounce">🎮</div>
            <span className="text-3xl font-black tracking-tight uppercase">SOY NIÑO</span>
            <span className="text-sm font-bold opacity-80 mt-2 uppercase tracking-widest">¡A JUGAR!</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTherapistAccess}
            className="flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-md text-slate-700 rounded-[3rem] border-8 border-white shadow-2xl group"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">👩‍⚕️</div>
            <span className="text-3xl font-black tracking-tight uppercase">TERAPEUTA</span>
            <span className="text-sm text-slate-400 mt-2 uppercase tracking-widest">GestiÓN</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
