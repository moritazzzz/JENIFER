import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LogOut, 
  ArrowLeft, 
  Users, 
  BarChart2, 
  Plus, 
  ChevronRight, 
  Star, 
  Award, 
  Download, 
  MessageSquare, 
  Sparkles,
  PartyPopper,
  LayoutDashboard,
  Home,
  Video,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  Search,
  MoreVertical,
  Wand2,
  X
} from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { type Child, type Therapist, type Session, type LiveCommand } from '../../types';
import { cn } from '../../lib/utils';

interface TherapistDashboardProps {
  user: Therapist | null;
  onBack: () => void;
  onStartChild: (child: Child) => void;
  onEditChild: (child: Child) => void;
}

export function TherapistDashboard({ user, onBack, onStartChild, onEditChild }: TherapistDashboardProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAnonymously, setIsAnonymously] = useState(false);
  const [liveMsg, setLiveMsg] = useState('');
  const [viewingChat, setViewingChat] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    if (!user && !loading && !hasAttemptedAutoLogin && !loginError) {
      setHasAttemptedAutoLogin(true);
      handleLogin('guest');
    }
    if (user) {
      fetchChildren();
    }
  }, [user, loading, hasAttemptedAutoLogin, loginError]);

  const fetchChildren = async () => {
    if (!auth.currentUser) return;
    const path = 'children';
    try {
      const q = query(collection(db, path), where('therapistId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setChildren(snapshot.docs.map(doc => doc.data() as Child));
    } catch (error) {
      handleFirestoreError(error, 'list', path);
    }
  };

  const fetchSessions = async (childId: string) => {
    const path = `children/${childId}/sessions`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      setSessions(snapshot.docs.map(doc => doc.data() as Session));
    } catch (error) {
      handleFirestoreError(error, 'list', path);
    }
  };

  const handleLogin = async (type: 'google' | 'guest') => {
    setLoading(true);
    try {
      setLoginError(null);
      let result;
      if (type === 'google') {
        // If already signed in but missing firestore doc
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          result = { user: auth.currentUser };
        } else {
          const provider = new GoogleAuthProvider();
          result = await signInWithPopup(auth, provider);
        }
        
        const therapistData: Therapist = {
          id: result.user.uid,
          name: result.user.displayName || 'Terapeuta',
          email: result.user.email || '',
          createdAt: new Date().toISOString(),
        };
        const path = `therapists/${result.user.uid}`;
        try {
          await setDoc(doc(db, 'therapists', result.user.uid), therapistData, { merge: true });
        } catch (error) {
          handleFirestoreError(error, 'write', path);
        }
        // The App.tsx listener should pick this up
      } else {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          result = { user: auth.currentUser };
        } else {
          result = await signInAnonymously(auth);
        }
        const therapistData: Therapist = {
          id: result.user.uid,
          name: 'Terapeuta Invitado',
          email: 'guest@app.com',
          createdAt: new Date().toISOString(),
        };
        const path = `therapists/${result.user.uid}`;
        try {
          await setDoc(doc(db, 'therapists', result.user.uid), therapistData, { merge: true });
        } catch (error) {
          handleFirestoreError(error, 'write', path);
        }
        setIsAnonymously(true);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/admin-restricted-operation') {
        setLoginError("La creación de usuarios está restringida en la consola de Firebase. Por favor, habilita el registro de nuevos usuarios en la configuración de Authentication.");
      } else if (error.code === 'auth/too-many-requests') {
        setLoginError("Demasiadas solicitudes de inicio de sesión. Por favor, espere un momento y actualice la página.");
      } else {
        setLoginError(error.message || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'ninos', label: 'Mis Niños', icon: Users },
    { id: 'vivo', label: 'Sesiones en Vivo', icon: Video },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'progreso', label: 'Progreso General', icon: BarChart3 },
    { id: 'ia', label: 'Actividades IA', icon: Sparkles },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
  ];

  const stats = [
    { label: 'Niños Activos', value: children.length || '12', sub: 'Perfiles creados', icon: Users, color: 'text-pink-400', bg: 'bg-[#FFF0F6]' },
    { label: 'Sesiones Hoy', value: '8', sub: 'En progreso', icon: BarChart2, color: 'text-emerald-400', bg: 'bg-[#E8F9F2]' },
    { label: 'Logros Hoy', value: '35', sub: 'Reconocimientos', icon: Star, color: 'text-blue-400', bg: 'bg-[#E0F2FE]' },
    { label: 'Tiempo Total', value: '6h 25m', sub: 'Esta semana', icon: Clock, color: 'text-orange-400', bg: 'bg-[#FEF3C7]' },
  ];

  const chartData = [
    { name: 'Nico', value: 85, color: 'bg-[#10B981]' },
    { name: 'Sofía', value: 72, color: 'bg-[#F472B6]' },
    { name: 'Mateo', value: 56, color: 'bg-[#60A5FA]' },
    { name: 'Valentina', value: 90, color: 'bg-[#A78BFA]' },
  ];

  const sendLiveCommand = async (type: LiveCommand['type'], content?: string) => {
    if (!selectedChild) return;
    const path = `children/${selectedChild.id}/liveCommands`;
    try {
      await addDoc(collection(db, path), {
        type,
        content,
        timestamp: new Date().toISOString()
      });
      if (type === 'message') setLiveMsg('');
    } catch (error) {
      handleFirestoreError(error, 'write', path);
    }
  };

  function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FF] p-6">
        {loginError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-white rounded-3xl shadow-xl border-4 border-red-50 max-w-md text-center"
          >
            <div className="text-4xl mb-4">🛠️</div>
            <h2 className="text-xl font-black text-slate-800 mb-2 uppercase italic tracking-tighter">Acceso Restringido</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Para habilitar el ingreso instantáneo, por favor activa el proveedor <b>"Anónimo"</b> en la pestaña de <b>Authentication</b> de tu Consola de Firebase.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleLogin('google')}
                className="w-full bg-[#5D469E] text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#4a3683] transition-all"
              >
                Entrar con Google (Manual)
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="text-slate-400 font-bold text-xs uppercase"
              >
                Reintentar
              </button>
            </div>
          </motion.div>
        )}
        
        {!loginError && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl"
          >
            ✨
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFEFE] font-sans text-slate-800 overflow-hidden w-full">
      {/* Sidebar - Fixed Left */}
      <aside className="w-72 bg-[#5D469E] flex flex-col h-full shrink-0 shadow-2xl relative z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-400 p-2 rounded-2xl text-white shadow-lg">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-tight">Mundo</span>
              <span className="text-xl font-black text-white leading-tight -mt-1">Palabras</span>
            </div>
          </div>
          
          <button className="w-fit bg-white/10 backdrop-blur-md rounded-xl px-4 py-1.5 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 mb-8">
            Terapeuta
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id !== 'ninos') setSelectedChild(null);
              }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-sm text-left group",
                activeTab === item.id 
                  ? "bg-white text-[#5D469E] shadow-xl" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? "text-[#5D469E]" : "")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-[1.5rem] font-bold transition-all text-sm text-white group"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative bg-[#F7F9FF] custom-scrollbar">
        <div className="max-w-[1440px] mx-auto p-10 space-y-10">
          {activeTab === 'inicio' && !selectedChild && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <header className="flex justify-between items-start mb-12 relative">
                <div>
                  <h1 className="text-5xl font-black text-slate-800 mb-3 flex items-center gap-3">
                    ¡Hola, Terapeuta! <span className="animate-bounce">👋</span>
                  </h1>
                  <p className="text-slate-400 font-medium text-xl">Aquí puedes ver el progreso de tus exploradores.</p>
                </div>
                
                <div className="absolute right-0 top-0 -translate-y-4">
                   <div className="relative w-48 h-48">
                      {/* Decorative elements - simple representation of image */}
                      <div className="absolute -left-12 top-10 w-24 h-12 bg-purple-50 rounded-full blur-2xl opacity-50" />
                      <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl opacity-30" />
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4&nose=round&mouth=smile&eyes=happy" 
                        alt="Terapeuta" 
                        className="w-32 h-32 object-cover relative z-10 rounded-full border-4 border-white shadow-xl" 
                      />
                      <div className="absolute bottom-4 right-4 text-4xl transform rotate-12">🌈</div>
                   </div>
                </div>
              </header>

              {/* Stats Bar */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn("p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 border border-white", stat.bg)}
                  >
                    <div className={cn("p-4 rounded-3xl bg-white shadow-sm flex items-center justify-center", stat.color)}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-60 mb-1", stat.color)}>{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </section>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                  <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Mis Niños</h3>
                      </div>
                      <button onClick={() => setActiveTab('ninos')} className="text-[#5D469E] font-black text-xs hover:underline uppercase tracking-widest">Ver todos</button>
                    </div>

                    <div className="space-y-8">
                      {(children.length > 0 ? children.slice(0, 4) : [
                        { id: 1, name: 'Nico', age: 6, tags: ['TEL', 'Nivel Silábico'], session: 'Hoy, 10:30 AM', progress: 85, avatar: '👦' },
                        { id: 2, name: 'Sofía', age: 5, tags: ['Dislexia', 'Nivel Alfabético'], session: 'Hoy, 9:15 AM', progress: 72, avatar: '👧' },
                        { id: 3, name: 'Mateo', age: 7, tags: ['Fonológico', 'Nivel Silábico'], session: 'Ayer, 4:20 PM', progress: 65, avatar: '👦' },
                        { id: 4, name: 'Valentina', age: 6, tags: ['TEL', 'Alfabético'], session: 'Ayer, 11:00 AM', progress: 90, avatar: '👧' },
                      ]).map((item, idx) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-6 group cursor-pointer text-left"
                          onClick={() => {
                            if (item.id.toString().length > 1) { // if real child
                              setSelectedChild(item as any);
                              fetchSessions(item.id as any);
                            }
                          }}
                        >
                          <div className="w-16 h-16 bg-blue-50 rounded-full overflow-hidden flex shrink-0 items-center justify-center text-4xl border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                            {item.avatar === '👦' ? '👦' : item.avatar === '👧' ? '👧' : (item.avatar === 'lion' ? '🦁' : '🐰')}
                          </div>
                          
                          <div className="flex-1 flex items-center justify-between">
                            <div className="w-1/3">
                              <h4 className="text-lg font-black text-slate-800 mb-0.5">{item.name}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">{item.age} años</p>
                              <div className="flex flex-wrap gap-1">
                                {(item.tags || ['TEL', 'Nivel Silábico']).map(tag => (
                                  <span key={tag} className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase", tag === 'Dislexia' ? 'bg-pink-50 text-pink-500' : tag === 'Fonológico' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500')}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="w-1/3">
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sesión reciente:</p>
                               <p className="text-[10px] font-black text-slate-600 mb-1">{item.session || 'En progreso'}</p>
                               <p className="text-[10px] font-bold text-slate-300">Progreso:</p>
                            </div>

                            <div className="w-1/3 flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2 w-full max-w-[120px]">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.progress}%` }}
                                    className={cn("h-full rounded-full transition-all", item.progress > 80 ? 'bg-emerald-400' : item.progress > 60 ? 'bg-emerald-300' : 'bg-yellow-400')}
                                  />
                                </div>
                                <span className={cn("text-[10px] font-black italic", item.progress > 80 ? 'text-emerald-500' : 'text-slate-400')}>{item.progress}%</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#5D469E] transition-all group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Sesiones Recientes */}
                  <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50">
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">Sesiones Recientes</h3>
                        </div>
                        <button className="text-[#5D469E] font-black text-xs hover:underline uppercase tracking-widest">Ver todas</button>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { name: 'Nico', avatar: '👦', world: 'Mundo Fácil', duration: '10 min', activities: 5, progress: 85 },
                          { name: 'Sofía', avatar: '👧', world: 'Mundo Medio', duration: '10 min', activities: 5, progress: 72 },
                        ].map((child, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-3xl group hover:shadow-lg transition-all hover:scale-[1.02] border border-transparent hover:border-slate-50">
                             <div className="flex items-center gap-4 text-left">
                               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-4xl shadow-sm">
                                  {child.avatar}
                               </div>
                               <div>
                                  <p className="text-lg font-black text-slate-800">{child.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 text-left">
                                    Sesión: <span className="font-black text-slate-600 uppercase">{child.world}</span>
                                  </p>
                                  <p className="text-[10px] font-medium text-slate-400 text-left">Duración: {child.duration}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-12">
                               <div className="text-center">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">Actividades:</p>
                                  <p className="text-xs font-black text-slate-700"> {child.activities}</p>
                               </div>
                               <div className="w-14 h-14 rounded-full border-[6px] border-slate-50 shadow-inner flex items-center justify-center font-black text-emerald-500 text-xs relative">
                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle 
                                      cx="28" cy="28" r="22" 
                                      stroke="currentColor" strokeWidth="6" 
                                      fill="transparent" 
                                      strokeDasharray={2 * Math.PI * 22}
                                      strokeDashoffset={(2 * Math.PI * 22) * (1 - child.progress / 100)}
                                      className="text-emerald-400"
                                    />
                                  </svg>
                                 <span className="relative z-10">{child.progress}%</span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  </section>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                   {/* Progreso General Card */}
                   <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50">
                      <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">Progreso General</h3>
                        </div>
                        <button className="text-slate-400 font-black text-[9px] bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 uppercase tracking-widest hover:bg-slate-100 transition-colors">Ver informe</button>
                      </div>
                      
                      <div className="h-64 flex items-end justify-around gap-6 px-4 pb-8 relative border-b-2 border-slate-50">
                        {[0, 25, 50, 75, 100].map(val => (
                          <div key={val} className="absolute left-0 right-0 border-t border-slate-50/50 flex items-center" style={{ bottom: `${val}%` }}>
                            <span className="text-[9px] font-black text-slate-200 absolute -left-8">{val}%</span>
                          </div>
                        ))}
                        
                        {chartData.map((bar, i) => (
                          <div key={i} className="flex flex-col items-center gap-4 flex-1 h-full justify-end group cursor-help z-10">
                            <div className="relative w-8 flex flex-col justify-end h-full">
                               <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${bar.value}%` }}
                                transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: "easeOut" }}
                                className={cn("w-full rounded-2xl shadow-xl relative group-hover:scale-110 transition-transform", bar.color)}
                               >
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {bar.value}%
                                  </div>
                               </motion.div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{bar.name}</span>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50">
                      <div className="flex items-center gap-3 mb-8">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Últimos Logros</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { name: 'Nico', avatar: '👦', task: 'Repetición de palabras', time: 'Hoy' },
                          { name: 'Sofía', avatar: '👧', task: 'Identificación de imágenes', time: 'Hoy' },
                          { name: 'Mateo', avatar: '👦', task: 'Formación de palabras', time: 'Ayer' },
                        ].map((logro, i) => (
                          <div key={i} className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                               {logro.avatar}
                            </div>
                            <div className="flex-1">
                               <div className="flex justify-between items-center">
                                  <p className="text-sm font-black text-slate-800">{logro.name}</p>
                                  <span className="text-[10px] font-black text-slate-300 uppercase italic">{logro.time}</span>
                               </div>
                               <p className="text-xs text-slate-400 font-bold">{logro.task}</p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                               <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                                  <Award className="w-3.5 h-3.5 text-white" />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section className="bg-gradient-to-br from-[#7C66BD] via-[#5D469E] to-[#4a3683] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10 text-left">
                        <div className="flex items-center gap-3 mb-6">
                           <h3 className="text-2xl font-black text-white italic tracking-tighter">ChatBot Terapéutico 🤖✨</h3>
                        </div>
                        <p className="text-white/80 text-sm font-bold leading-relaxed mb-8 max-w-[200px]">
                          Tu asistente virtual que acompaña a los niños en cada sesión.
                        </p>
                        <button className="bg-[#483389] backdrop-blur-md shadow-inner text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                           Ver Conversaciones
                        </button>
                      </div>
                      
                      {/* Robot Illustration Area */}
                      <div className="absolute bottom-4 right-4 translate-y-4 translate-x-4 group-hover:rotate-6 transition-transform">
                         <div className="relative">
                            <motion.div 
                              animate={{ y: [0, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                              className="text-9xl filter drop-shadow-2xl"
                            >
                               🤖
                            </motion.div>
                            <div className="absolute top-0 -right-4 bg-white/20 backdrop-blur-md rounded-2xl p-2 flex gap-1 items-center">
                               <div className="w-1 h-1 bg-white rounded-full" />
                               <div className="w-1 h-1 bg-white rounded-full" />
                               <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                         </div>
                      </div>
                   </section>
                </div>
              </div>
            </motion.div>
          )}

          {/* Niños list if Tab is 'ninos' and no child selected */}
          {activeTab === 'ninos' && !selectedChild && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                <div className="flex-1">
                  <h1 className="text-5xl font-black text-slate-800 mb-3 tracking-tight">Mis Exploradores</h1>
                  <p className="text-slate-400 font-medium text-xl">Gestiona el progreso de {children.length} niños registrados.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-4 border-slate-50 rounded-2xl font-bold text-sm focus:border-purple-200 outline-none transition-all shadow-sm"
                    />
                  </div>
                  
                  <select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="bg-white border-4 border-slate-50 rounded-2xl px-4 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 outline-none focus:border-purple-200 shadow-sm transition-all"
                  >
                    <option value="all">Todos los Niveles</option>
                    <option value="TEL">TEL</option>
                    <option value="Dislexia">Dislexia</option>
                    <option value="Fonológico">Fonológico</option>
                  </select>

                  <select 
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="bg-white border-4 border-slate-50 rounded-2xl px-4 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 outline-none focus:border-purple-200 shadow-sm transition-all"
                  >
                    <option value="all">Todas las Dificultades</option>
                    <option value="easy">Fácil</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                  </select>

                  <button className="flex items-center gap-3 bg-[#5D469E] text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-100 hover:bg-[#4a3683] transition-all hover:scale-105">
                    <Plus className="w-5 h-5 stroke-[4px]" /> Registrar
                  </button>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {children
                  .filter(child => {
                    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesLevel = filterLevel === 'all' || child.learningLevel === filterLevel;
                    const matchesDifficulty = filterDifficulty === 'all' || child.difficulty === filterDifficulty;
                    return matchesSearch && matchesLevel && matchesDifficulty;
                  })
                  .map(child => (
                  <motion.div 
                    key={child.id}
                    whileHover={{ y: -10 }}
                    className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100/50 border-4 border-white group cursor-pointer transition-all text-left"
                    onClick={() => {
                      setSelectedChild(child);
                      fetchSessions(child.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="text-8xl p-4 bg-slate-50 rounded-full shadow-inner">{child.avatar === 'lion' ? '🦁' : child.avatar === 'rabbit' ? '🐰' : child.avatar === 'panda' ? '🐼' : child.avatar === 'fox' ? '🦊' : child.avatar === 'owl' ? '🦉' : '🦄'}</div>
                      <div className="flex gap-1 bg-yellow-50 p-2 rounded-xl">
                        {[1,2,3].map(i => <Star key={i} className={cn("w-5 h-5", i <= (child.stars / 10) ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />)}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">{child.name}</h3>
                    <p className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em]">{child.age} años • {child.learningLevel}</p>
                    
                    <div className="flex items-center justify-between pt-8 border-t-4 border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <Award className="w-8 h-8 text-purple-600" />
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-800 leading-none">{child.points}</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PUNTOS</p>
                         </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#5D469E] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-8 h-8" />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {children.length === 0 && (
                  <div className="col-span-full py-32 text-center flex flex-col items-center">
                     <div className="text-9xl opacity-10 mb-6 font-black italic">!</div>
                     <p className="text-slate-200 font-black uppercase text-xl italic tracking-tighter">No hay exploradores registrados aún</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Selected Child Detail View */}
          {selectedChild && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-white flex flex-col md:flex-row items-center gap-10">
                  <button onClick={() => setSelectedChild(null)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="text-8xl">{selectedChild.avatar === 'lion' ? '🦁' : selectedChild.avatar === 'rabbit' ? '🐰' : selectedChild.avatar === 'panda' ? '🐼' : selectedChild.avatar === 'fox' ? '🦊' : selectedChild.avatar === 'owl' ? '🦉' : '🦄'}</div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-3">
                      <h2 className="text-5xl font-black text-slate-800">{selectedChild.name}</h2>
                      <span className="px-6 py-2 bg-purple-100 text-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest">{selectedChild.learningLevel}</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Edad: {selectedChild.age} • Estilo: {selectedChild.learningStyle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onEditChild(selectedChild)}
                      className="p-5 bg-white border-4 border-slate-50 text-slate-400 hover:text-slate-600 rounded-[2rem] transition-all hover:scale-105"
                      title="Administrar Perfil"
                    >
                      <Settings className="w-6 h-6" />
                    </button>
                    <button onClick={() => onStartChild(selectedChild)} className="bg-[#5D469E] text-white px-10 py-5 rounded-[2rem] font-black uppercase shadow-2xl shadow-purple-200 hover:bg-[#4a3683] transition-all hover:scale-105 active:scale-95">
                      Iniciar Aventura
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Live Interaction Panel */}
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-orange-200 border-dashed relative">
                    <div className="absolute top-0 right-0 p-4">
                       <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">En Vivo</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8 text-left">
                       <div className="p-4 bg-orange-100 rounded-[1.5rem]">
                          <MessageSquare className="w-8 h-8 text-orange-600" />
                       </div>
                       <h3 className="text-3xl font-black text-slate-800 italic">Intervención Mágica</h3>
                    </div>
                    
                    <div className="space-y-8 text-left">
                       <div className="space-y-4">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Enviar Mensaje de Aliento</p>
                          <div className="flex gap-3">
                             <input 
                               type="text" 
                               value={liveMsg}
                               onChange={(e) => setLiveMsg(e.target.value)}
                               placeholder="Ej: ¡Vas increíble!"
                               className="flex-1 p-5 bg-slate-50 border-4 border-slate-50 rounded-2xl font-bold focus:border-orange-200 outline-none transition-all placeholder:text-slate-300"
                             />
                             <button 
                               onClick={() => sendLiveCommand('message', liveMsg)}
                               className="bg-orange-500 text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                             >
                               Enviar
                             </button>
                          </div>
                          <div className="flex flex-wrap gap-3">
                             {["¡Excelente!", "¡Casi!", "¡Hazlo!", "¡Tú puedes!"].map(msg => (
                               <button 
                                 key={msg}
                                 onClick={() => sendLiveCommand('message', msg)}
                                 className="text-[10px] font-black bg-orange-50 text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-100 uppercase tracking-tight"
                               >
                                 {msg}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Efectos Mágicos</p>
                          <div className="grid grid-cols-2 gap-4">
                             <button 
                               onClick={() => sendLiveCommand('confetti')}
                               className="flex items-center justify-center gap-3 p-5 bg-pink-50 text-pink-600 rounded-[2rem] border-4 border-pink-50 hover:border-pink-100 font-black uppercase text-[10px] tracking-widest transition-all"
                             >
                               <PartyPopper className="w-5 h-5" /> Confeti
                             </button>
                             <button 
                               onClick={() => sendLiveCommand('sparkle')}
                               className="flex items-center justify-center gap-3 p-5 bg-yellow-50 text-yellow-600 rounded-[2rem] border-4 border-yellow-50 hover:border-yellow-100 font-black uppercase text-[10px] tracking-widest transition-all"
                             >
                               <Sparkles className="w-5 h-5" /> Brillos
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Sessions Detail Historial */}
                  <div className="bg-white rounded-[3rem] border-4 border-white shadow-xl overflow-hidden flex flex-col">
                    <div className="p-10 border-b-4 border-slate-50 bg-slate-50/50 flex justify-between items-center">
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Historial de Sesiones</h3>
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <BarChart2 className="w-5 h-5 text-purple-600" />
                       </div>
                    </div>
                    <div className="overflow-y-auto max-h-[500px]">
                       <table className="w-full">
                         <thead className="bg-white sticky top-0 z-10">
                           <tr className="text-left border-b-4 border-slate-50">
                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chat</th>
                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Detalles</th>
                           </tr>
                         </thead>
                         <tbody>
                           {sessions.length > 0 ? sessions.map(session => (
                             <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                               <td className="px-8 py-6 text-left">
                                 <p className="font-black text-slate-800">{new Date(session.date).toLocaleDateString()}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{session.difficultyWorked}</p>
                               </td>
                               <td className="px-8 py-6 text-center">
                                 <button 
                                   onClick={() => setViewingChat(session)}
                                   className="p-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-all inline-flex items-center"
                                 >
                                   <MessageSquare className="w-5 h-5" />
                                 </button>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="font-black text-emerald-600">{session.correctCount}/{session.totalWords}</span>
                                    <span className="text-[10px] font-bold text-slate-400 italic">+{session.pointsEarned} PTS</span>
                                  </div>
                               </td>
                             </tr>
                           )) : (
                             <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-bold italic">No hay sesiones aún.</td></tr>
                           )}
                         </tbody>
                       </table>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Chat Viewer Modal */}
      {viewingChat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-8 border-white"
          >
            <div className="p-8 border-b-4 border-slate-50 flex justify-between items-center bg-[#5D469E] text-white">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter italic text-left">Historial Mágico</h3>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mt-1 text-left">Sesión: {new Date(viewingChat.date).toLocaleDateString()}</p>
                 </div>
              </div>
              <button onClick={() => setViewingChat(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              {viewingChat.chatHistory && viewingChat.chatHistory.length > 0 ? (
                viewingChat.chatHistory.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.role === 'assistant' ? "items-start" : "items-end")}>
                    <div className={cn(
                      "max-w-[85%] p-6 rounded-[2rem] shadow-sm border-4",
                      msg.role === 'assistant' 
                        ? "bg-white border-white rounded-tl-none text-slate-700 text-left" 
                        : "bg-[#5D469E] border-[#5D469E] text-white rounded-tr-none shadow-purple-100 text-right"
                    )}>
                      <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                      <span className={cn("text-[9px] mt-3 block font-black uppercase opacity-40", msg.role === 'assistant' ? "text-slate-400 text-left" : "text-white/60 text-right")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 flex flex-col items-center gap-4">
                   <div className="text-6xl grayscale opacity-30">📭</div>
                   <p className="text-slate-300 font-black uppercase text-xs">No hay mensajes en esta sesión</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border-t-4 border-slate-50 text-center">
               <button 
                onClick={() => setViewingChat(null)} 
                className="bg-slate-800 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95"
               >
                Cerrar Historial
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
