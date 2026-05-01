import { motion } from 'motion/react';
import { type Child, type Difficulty } from '../../types';
import { WORLDS } from '../../constants';
import { Sparkles, Trophy, Star, Settings, ArrowLeft, Mic, Image as ImageIcon, Eye, LayoutGrid, ArrowRight, Clock, Award, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Assistant } from '../chatbot/Assistant';

interface WorldMapProps {
  child: Child;
  onSelectActivity: (difficulty: Difficulty) => void;
  onBack: () => void;
  onEditProfile: () => void;
}

export function WorldMap({ child, onSelectActivity, onBack, onEditProfile }: WorldMapProps) {
  // Flatten activities into an ordered path
  const allSteps = [
    ...WORLDS.easy.activities.map(a => ({ ...a, difficulty: 'easy' as Difficulty, worldName: WORLDS.easy.name })),
    ...WORLDS.medium.activities.map(a => ({ ...a, difficulty: 'medium' as Difficulty, worldName: WORLDS.medium.name })),
    ...WORLDS.hard.activities.map(a => ({ ...a, difficulty: 'hard' as Difficulty, worldName: WORLDS.hard.name })),
  ];

  // Logic to determine if a step is locked
  const getStepStatus = (stepDiff: Difficulty, index: number) => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const currentDiffIdx = difficulties.indexOf(child.difficulty);
    const stepDiffIdx = difficulties.indexOf(stepDiff);

    if (stepDiffIdx < currentDiffIdx) return 'completed';
    if (stepDiffIdx > currentDiffIdx) return 'locked';
    
    // In current difficulty, we'll mark the first few as available
    // For demo, just say everything in current is available
    return 'current';
  };

  const getWorldTheme = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-yellow-100/30';
      case 'medium': return 'bg-green-100/30';
      case 'hard': return 'bg-purple-100/30';
      default: return 'bg-blue-100/30';
    }
  };

  return (
    <div className="min-h-full bg-blue-50 flex flex-col relative overflow-y-auto overflow-x-hidden font-sans selection:bg-purple-100 custom-scrollbar scroll-smooth">
      {/* Background Parallax Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-blue-200 via-sky-100 to-indigo-200 opacity-60" />
        {/* Animated clouds */}
        <motion.div 
          animate={{ x: [-100, 1500] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-0 text-9xl opacity-20"
        >☁️</motion.div>
        <motion.div 
          animate={{ x: [1500, -100] }}
          transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] text-9xl opacity-10"
        >☁️</motion.div>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center py-32 px-6">
        {/* Header Overlay */}
        <header className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-xl z-50 p-4 md:px-12 flex items-center justify-between border-b-4 border-slate-100">
           <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 transition-all active:scale-95 border-b-4 border-slate-300"
              >
                <ArrowLeft className="w-6 h-6" strokeWidth={3} />
              </button>
              <div className="flex items-center gap-3 bg-white border-4 border-slate-100 rounded-[2rem] pr-6 pl-2 py-1 shadow-sm group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl ring-4 ring-blue-50">
                  {child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-800 leading-tight">{child.name}</h2>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-tight">{child.points} puntos</p>
                  </div>
                  <button 
                    onClick={onEditProfile}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    title="Editar Perfil"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mis estrellas</span>
                <div className="flex gap-2">
                   {[...Array(3)].map((_, i) => (
                     <Star key={i} className={cn("w-6 h-6", i < (child.stars % 3 || (child.stars > 0 ? 3 : 0)) ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                   ))}
                </div>
              </div>
           </div>
        </header>

        {/* The Winding Path */}
        <div className="relative w-full flex flex-col items-center">
          {allSteps.map((step, idx) => {
            const status = getStepStatus(step.difficulty, idx);
            const isLeft = idx % 2 === 0;
            const isWorldStart = idx === 0 || allSteps[idx].worldName !== allSteps[idx - 1].worldName;

            return (
              <div key={step.id} className={cn(
                "w-full flex flex-col items-center relative py-16",
                getWorldTheme(step.difficulty)
              )}>
                {isWorldStart && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center relative"
                  >
                    <div className="absolute -inset-8 bg-white/40 blur-3xl rounded-full" />
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center text-5xl mx-auto mb-6 border-b-8 border-gray-100">
                        {WORLDS[step.difficulty].icon}
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Mundo: {step.worldName}</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">{WORLDS[step.difficulty].description}</p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  style={{ x: isLeft ? -100 : 100 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative group"
                >
                  {/* Performance Star Box (Red Box as requested) */}
                  {status === 'completed' && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 flex justify-center gap-1 bg-[#FF4B4B] p-2 rounded-xl shadow-[0_8px_0_#D13E3E] border-2 border-white z-20"
                    >
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                    </motion.div>
                  )}

                  {/* Connectors (Bridge/Path) */}
                  {idx < allSteps.length - 1 && (
                    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-4 pointer-events-none z-0">
                      <div 
                        className={cn(
                          "w-4 h-56 rounded-full origin-top",
                          status === 'completed' ? "bg-green-400/40" : "bg-slate-300/30"
                        )}
                        style={{ transform: `rotate(${isLeft ? '35deg' : '-35deg'}) translateX(-4px)` }}
                      />
                      {/* Decorative Planks if current */}
                      {!isLeft && status !== 'locked' && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-12 h-2 bg-amber-800/20 rounded-full" />
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => status !== 'locked' && onSelectActivity(step.difficulty)}
                    className={cn(
                      "w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-4xl transition-all relative z-10",
                      "border-b-[12px] border-r-4 shadow-2xl active:scale-95 active:translate-y-2",
                      status === 'locked' 
                        ? "bg-slate-200 border-slate-300 text-slate-400 grayscale cursor-not-allowed" 
                        : status === 'completed'
                          ? "bg-green-400 border-green-600 text-white"
                          : "bg-blue-500 border-blue-700 text-white animate-bounce-slow"
                    )}
                  >
                    {status === 'locked' ? '🔒' : (step as any).image || WORLDS[step.difficulty].icon}
                    
                    {/* Floating Info */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-slate-100 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30">
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{step.title}</p>
                    </div>
                  </button>

                  {/* Ground effect shadow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 rounded-full blur-sm -z-10" />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Floating Scenery Landmarks */}
        <div className="absolute top-[15%] left-[5%] text-7xl opacity-40 select-none animate-float">🏝️</div>
        <div className="absolute top-[30%] right-[10%] text-6xl opacity-40 select-none animate-float" style={{ animationDelay: '1s' }}>🐚</div>
        <div className="absolute top-[50%] left-[8%] text-8xl opacity-40 select-none animate-float" style={{ animationDelay: '1.5s' }}>🌳</div>
        <div className="absolute top-[65%] right-[5%] text-7xl opacity-40 select-none animate-float" style={{ animationDelay: '2s' }}>🍄</div>
        <div className="absolute top-[85%] left-[10%] text-8xl opacity-40 select-none animate-float" style={{ animationDelay: '3s' }}>🏔️</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(8deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite ease-in-out;
        }
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
      `}} />

      <Assistant 
        childId={child.id} 
        childName={child.name} 
        performance="bueno" 
        isVisible={true} 
      />
    </div>
  );
}
