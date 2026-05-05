import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Child, type Difficulty } from '../../types';
import { WORLDS } from '../../constants';
import { Sparkles, Trophy, Star, Settings, ArrowLeft, Mic, Image as ImageIcon, Eye, LayoutGrid, ArrowRight, Clock, Award, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Assistant } from '../chatbot/Assistant';

interface WorldMapProps {
  child: Child;
  onSelectActivity: (difficulty: Difficulty) => void;
  onBack: () => void;
}

export function WorldMap({ child, onSelectActivity, onBack }: WorldMapProps) {
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<{title: string, desc: string, icon: string, color: string} | null>(null);
  const dailyWord = "Estrella";

  const achievements = [
    { title: "Explorador", desc: "¡Has explorado todos los mundos mágicos!", icon: "🚀", color: "from-purple-400 to-purple-600" },
    { title: "Buen oyente", desc: "¡Escuchas con mucha atención cada palabra!", icon: "💬", color: "from-blue-400 to-blue-600" },
    { title: "Super estrella", desc: "¡Eres un experto pronunciando palabras difíciles!", icon: "⭐", color: "from-green-400 to-emerald-600" }
  ];

  return (
    <div className="min-h-full bg-[#F7FBFE] flex flex-col relative overflow-y-auto overflow-x-hidden font-sans selection:bg-purple-100 custom-scrollbar">
      <AnimatePresence>
        {isDailyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-left">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white"
            >
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-10 text-white text-center relative">
                <div className="absolute top-4 left-4">
                  <Star className="w-8 h-8 opacity-40" />
                </div>
                <div className="absolute bottom-4 right-4 text-white/20">
                  <Trophy className="w-12 h-12 rotate-12" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block bg-white/20 p-4 rounded-full mb-4"
                >
                  <Trophy className="w-16 h-16" />
                </motion.div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">Desafío del Día</h3>
                <p className="text-amber-100 font-bold mt-2">¡Gana el DOBLE de puntos hoy!</p>
              </div>
              
              <div className="p-10 text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Palabra Mágica:</p>
                  <p className="text-5xl font-black text-slate-800 tracking-tighter">"{dailyWord}"</p>
                </div>
                
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Hoy practicaremos palabras que brillan. ¿Estás listo para convertirte en un experto?
                </p>
                
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setIsDailyModalOpen(false);
                      onSelectActivity('medium');
                    }}
                    className="bg-amber-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                  >
                    ¡Empezar Desafío!
                  </button>
                  <button 
                    onClick={() => setIsDailyModalOpen(false)}
                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-2"
                  >
                    Quizás más tarde
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedAchievement && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-left">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white"
            >
              <div className={cn("bg-gradient-to-br p-12 text-white text-center relative", selectedAchievement.color)}>
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="text-8xl mb-6 inline-block filter drop-shadow-lg"
                >
                  {selectedAchievement.icon}
                </motion.div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{selectedAchievement.title}</h3>
              </div>
              
              <div className="p-10 text-center space-y-8">
                <p className="text-xl font-bold text-slate-600 leading-relaxed">
                  {selectedAchievement.desc}
                </p>
                
                <button 
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full bg-slate-100 text-slate-500 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  ¡Genial!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Background Scenic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-20 left-[10%] w-32 h-16 bg-white rounded-full blur-2xl" />
        <div className="absolute top-10 right-[20%] w-48 h-24 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-green-50 to-transparent" />
        {/* Rainbow Mockup */}
        <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] border-[60px] border-transparent border-t-pink-100/30 border-r-pink-100/30 rounded-full rotate-[-45deg]" />
      </div>

      <div className="max-w-[1440px] mx-auto w-full flex flex-col flex-1 relative z-10 p-8 md:p-12 gap-8 md:gap-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 bg-white border-2 border-slate-100 hover:border-primary-light rounded-full flex items-center justify-center text-primary shadow-sm transition-all hover:scale-110 active:scale-90 shrink-0"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={3} />
          </button>

          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">
              ¡Hola, {child.name}! 👋
            </h1>
            <p className="text-slate-500 font-bold text-lg">
              Elige una actividad para seguir aprendiendo
            </p>
          </div>

          <button className="flex items-center gap-2 bg-primary-light text-primary px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider hover:opacity-80 transition-opacity border-b-4 border-primary/20 shrink-0">
            <Settings className="w-5 h-5" />
            Ajustes
          </button>
        </header>

        {/* Top Info Row */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* Child Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] border-4 border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 md:p-8 flex items-center gap-6 md:gap-10 w-full lg:w-auto min-w-[320px] md:min-w-[500px]"
          >
            <div className="w-28 h-28 bg-[#E6F4FF] rounded-full ring-8 ring-[#F7FBFE] flex items-center justify-center text-6xl shadow-inner relative overflow-hidden text-center">
               <span className="relative z-10 block">
                {child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}
               </span>
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent opacity-50" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-800 mb-1">{child.name}</h2>
              <p className="text-slate-400 font-bold mb-4">{child.age} años</p>
              
              <div className="flex gap-2">
                <span className="bg-[#E1F6FF] text-[#00A3FF] px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-tight">{child.learningLevel || 'TEL'}</span>
                <span className="bg-primary-light text-primary px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-tight text-center">Nivel Silábico</span>
              </div>
            </div>

            <div className="h-20 w-[2px] bg-slate-100 mx-4" />

            <div className="text-center pr-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary mb-2 mx-auto ring-4 ring-[#F7FBFE] shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesión:</p>
              <p className="text-lg font-black text-slate-700">10 min</p>
            </div>
          </motion.div>

          {/* Assistant Robot Info */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6"
          >
            <div className="relative">
              <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-50 shadow-xl max-w-[240px] relative z-10">
                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                  ¡Estoy aquí para ayudarte a aprender y divertirte! <span className="text-primary">💜</span>
                </p>
                {/* Speech bubble arrow */}
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-r-4 border-t-4 border-slate-50 rotate-45 z-0" />
              </div>
            </div>
            
            {/* Robot Illustation Mockup */}
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-purple-50 relative group">
              <div className="w-36 h-36 bg-[#E1EEFF] rounded-full flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                <div className="w-24 h-16 bg-[#2B3674] rounded-[2rem] flex items-center justify-center gap-4 border-4 border-white">
                  <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" />
                </div>
                <div className="w-12 h-2 bg-[#2B3674] rounded-full" />
                <div className="absolute inset-0 bg-blue-400/10 animate-pulse pointer-events-none" />
              </div>
              {/* Antenna */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-slate-300">
                <div className="w-3 h-3 bg-primary rounded-full -mt-1 mx-auto shadow-lg" />
              </div>
              {/* Arms */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-12 h-6 bg-slate-200 rounded-full -rotate-12" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-6 bg-slate-200 rounded-full rotate-12" />
            </div>
          </motion.div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              id: 'easy', 
              title: 'Repite conmigo', 
              desc: 'Escucha y repite la palabra', 
              icon: <Mic className="w-12 h-12 text-emerald-500" />,
              color: 'bg-[#EBFAEE]',
              borderColor: 'border-[#DCFADC]',
              textColor: 'text-emerald-700',
              illustration: (
                <div className="mt-8 relative h-32 flex items-center justify-center">
                  <div className="w-20 h-28 bg-white rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-lg overflow-hidden">
                    <Mic className="w-10 h-10 text-emerald-500" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-emerald-500/10" />
                  </div>
                  <div className="absolute left-0 bottom-4 w-10 h-1 bg-emerald-200 rounded-full" />
                  <div className="absolute right-0 bottom-8 w-8 h-1 bg-emerald-200 rounded-full" />
                  <div className="absolute left-4 top-4 text-emerald-300 animate-pulse">✨</div>
                </div>
              )
            },
            { 
              id: 'medium', 
              title: 'Mira y dime', 
              desc: 'Observa la imagen y di qué ves', 
              icon: <ImageIcon className="w-12 h-12 text-blue-500" />,
              color: 'bg-[#EBF6FF]',
              borderColor: 'border-[#D9F0FF]',
              textColor: 'text-blue-700',
              illustration: (
                <div className="mt-8 relative h-32 flex items-center justify-center">
                  <div className="w-32 h-24 bg-white rounded-2xl border-4 border-blue-50 shadow-lg p-2 rotate-[-5deg] overflow-hidden">
                    <div className="w-full h-full bg-[#EBF6FF] rounded-xl flex items-center justify-center text-blue-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="absolute bottom-[-5px] right-[10%] w-16 h-16 bg-white rounded-full border-4 border-blue-100 shadow-xl flex items-center justify-center">
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              )
            },
            { 
              id: 'hard', 
              title: 'Forma la palabra', 
              desc: 'Di la palabra correcta', 
              icon: <LayoutGrid className="w-12 h-12 text-purple-500" />,
              color: 'bg-[#F2EEFF]',
              borderColor: 'border-[#E8E1FF]',
              textColor: 'text-purple-700',
              illustration: (
                <div className="mt-8 grid grid-cols-2 gap-2 max-w-[140px] mx-auto">
                  {['C', 'A', 'S', 'A'].map((l, i) => (
                    <div key={i} className={cn(
                      "w-14 h-14 rounded-2xl border-b-4 flex items-center justify-center text-2xl font-black shadow-lg transition-transform hover:scale-110",
                      i % 2 === 0 ? "bg-blue-400 border-blue-500 text-white" : "bg-pink-400 border-pink-500 text-white"
                    )}>
                      {l}
                    </div>
                  ))}
                </div>
              )
            },
            { 
              id: 'daily', 
              title: 'Desafío del día', 
              desc: 'Gana estrellas y sube de nivel', 
              icon: <Trophy className="w-12 h-12 text-amber-500" />,
              color: 'bg-[#FFF8E6]',
              borderColor: 'border-[#FFF0CC]',
              textColor: 'text-amber-700',
              illustration: (
                <div className="mt-8 relative h-32 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse" />
                    <Trophy className="w-24 h-24 text-amber-400 relative z-10" strokeWidth={1.5} />
                    <Star className="absolute top-4 right-4 w-8 h-8 text-amber-200 fill-amber-200 animate-bounce" />
                  </div>
                  <div className="w-20 h-4 bg-amber-100 rounded-full mt-2" />
                </div>
              )
            }
          ].map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                if (item.id === 'daily') {
                  setIsDailyModalOpen(true);
                } else {
                  onSelectActivity(item.id as Difficulty);
                }
              }}
              className={cn(
                "group relative overflow-hidden rounded-[3rem] border-4 p-8 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2",
                item.color, item.borderColor
              )}
            >
              <h3 className={cn("text-2xl font-black mb-1", item.textColor)}>{item.title}</h3>
              <p className="text-slate-500 text-sm font-bold mb-4">{item.desc}</p>
              {item.illustration}
              
              {/* Decorative Flowers (Mockup) */}
              <div className="absolute bottom-4 left-4 flex gap-1 opacity-40">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px]">🌼</div>
                <div className="w-3 h-3 bg-white rounded-full mt-2" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[112px]">
           {/* Progress Card */}
           <div className="bg-white rounded-[2.5rem] border-4 border-slate-50 shadow-sm p-6 flex-1 flex items-center gap-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">⭐</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-black text-sm uppercase tracking-wider">Progreso de hoy</span>
                  <span className="text-green-500 font-black text-sm">75%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-green-500 rounded-full shadow-sm"
                  />
                </div>
              </div>
              <div className="text-3xl animate-bounce">🌟</div>
           </div>

           {/* Achievements Card */}
           <div className="bg-white rounded-[2.5rem] border-4 border-slate-50 shadow-sm p-6 lg:flex-[1.2] flex flex-col justify-center">
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Mis logros</p>
              <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div 
                    onClick={() => setSelectedAchievement(achievements[0])}
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer border-2 border-white ring-2 ring-purple-50"
                  >
                    🚀
                  </div>
                  <span className="text-[8px] font-black text-purple-400 uppercase">Explorador</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div 
                    onClick={() => setSelectedAchievement(achievements[1])}
                    className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer border-2 border-white ring-2 ring-blue-50"
                  >
                    💬
                  </div>
                  <span className="text-[8px] font-black text-blue-400 uppercase">Buen oyente</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div 
                    onClick={() => setSelectedAchievement(achievements[2])}
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-pointer border-2 border-white ring-2 ring-green-50"
                  >
                    ⭐
                  </div>
                  <span className="text-[8px] font-black text-green-400 uppercase">Super estrella</span>
                </div>
              </div>
           </div>

           {/* Start Button */}
           <button 
             onClick={() => onSelectActivity('easy')}
             className="bg-primary text-white px-10 py-6 lg:py-0 rounded-[2.5rem] flex items-center justify-center lg:justify-start gap-6 shadow-xl shadow-primary/20 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 group border-b-8 border-primary-dark/80"
           >
              <span className="text-2xl font-black tracking-tight leading-none uppercase">Empezar actividad</span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform shadow-lg shrink-0">
                <ArrowRight className="w-6 h-6 outline-none" strokeWidth={4} />
              </div>
           </button>
        </div>

        {/* Decorative Bird */}
        <div className="absolute bottom-4 left-4 text-5xl pointer-events-none opacity-80 animate-bounce">🐦</div>

      </div>

      <Assistant 
        childId={child.id} 
        childName={child.name} 
        performance="bueno" 
        isVisible={true} 
      />
    </div>
  );
}
