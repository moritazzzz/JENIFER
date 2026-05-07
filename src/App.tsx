/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from './lib/utils';
import { Welcome } from './components/Welcome';
import { TherapistDashboard } from './components/therapist/Dashboard';
import { ChildSetup } from './components/child/ChildSetup';
import { ChildSelection } from './components/child/ChildSelection';
import { WorldMap } from './components/child/WorldMap';
import { Activity } from './components/child/Activity';
import { SessionSummary } from './components/child/SessionSummary';
import { type Child, type Therapist, type Session, type Difficulty } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

type View = 'welcome' | 'therapist-dashboard' | 'child-selection' | 'child-setup' | 'world-map' | 'activity' | 'summary';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [currentUser, setCurrentUser] = useState<Therapist | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [isAnonymousDisabled, setIsAnonymousDisabled] = useState(false);

  useEffect(() => {
    // Safety timeout to ensure loading doesn't hang indefinitely
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        // Use real-time listener for therapist profile
        const docRef = doc(db, 'therapists', user.uid);
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data() as Therapist);
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
          clearTimeout(safetyTimeout);
        }, (error) => {
          console.error("Profile listen error:", error);
          setLoading(false);
          clearTimeout(safetyTimeout);
        });
      } else {
        // Auto-login as guest for immediate access
        signInAnonymously(auth).then(() => {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }).catch(err => {
           console.error("Auto guest login failed:", err);
           if (err.code === 'auth/admin-restricted-operation') {
             setIsAnonymousDisabled(true);
             setAuthError("anonymous-disabled");
           }
           setLoading(false);
           clearTimeout(safetyTimeout);
        });
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    const container = document.querySelector('.app-container') as HTMLElement;
    if (container && activeChild) {
      const color = activeChild.themeColor;
      container.style.setProperty('--primary-color', color);
      
      // We can use a helper or just hex manipulation for light/dark
      // For now, let's just use the selected color and a light version
      container.style.setProperty('--primary-light', `${color}20`); // 20 alpha (~12%)
    } else if (container) {
      // Default to blue
      container.style.setProperty('--primary-color', '#3B82F6');
      container.style.setProperty('--primary-light', '#EFF6FF');
    }
  }, [activeChild]);

  const handleStartChildAdventure = (child: Child) => {
    setActiveChild(child);
    setView('world-map');
  };

  const handleFinishSession = (session: Session) => {
    setLastSession(session);
    setView('summary');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-blue-50 p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl mb-8"
        >
          ✨
        </motion.div>
        <h2 className="text-3xl font-black text-blue-800 italic uppercase tracking-tighter mb-4">Cargando tu aventura...</h2>
        <div className="w-48 h-2 bg-blue-100 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-blue-500"
          />
        </div>
        <p className="text-blue-400 font-bold text-sm uppercase tracking-widest animate-pulse">Iniciando mundos mágicos</p>
      </div>
    );
  }

  if (authError === "anonymous-disabled" || (isAnonymousDisabled && view === 'welcome')) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-white max-w-xl w-full"
        >
          <div className="text-7xl mb-8">🛠️</div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase italic tracking-tighter">Configuración Requerida</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed text-lg">
            Para que el modo <b>"Explorador Invitado"</b> funcione, debes habilitar el acceso anónimo en tu Consola de Firebase.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-3xl text-left mb-8 space-y-4 shadow-inner">
            <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Pasos Rápidos:</h4>
            <ol className="text-sm text-slate-600 space-y-3 list-decimal list-inside font-medium font-sans">
              <li>Entra en <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-600 font-black hover:underline underline-offset-4">Console.Firebase.com</a></li>
              <li>Menú lateral &gt; <b>Compilación</b> &gt; <b>Authentication</b></li>
              <li>Pestaña <b>Sign-in method</b> &gt; <b>Añadir nuevo proveedor</b></li>
              <li>Selecciona <b>Anónimo</b> y actívalo.</li>
            </ol>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setAuthError(null);
                setView('therapist-dashboard');
              }}
              className="w-full bg-[#5D469E] text-white p-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#4a3683] transition-all shadow-xl shadow-purple-200"
            >
              Entrar con Google (Manual)
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
            >
              Ya lo activé, Reintentar ✨
            </button>
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              O usa el botón morado para entrar con tu cuenta
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-slate-200 min-h-screen flex items-center justify-center transition-all duration-500",
      isFullscreen ? "p-0" : "p-0 md:p-4"
    )}>
      <div className={cn(
        "app-container relative overflow-hidden group/app",
        isFullscreen && "is-fullscreen"
      )}>
        {/* Fullscreen Toggle Button */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-[200] p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white shadow-lg transition-all opacity-0 group-hover/app:opacity-100 hover:scale-110 active:scale-95"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <Welcome 
            key="welcome"
            isAnonymousDisabled={isAnonymousDisabled}
            onChildAccess={() => setView('child-selection')} 
            onTherapistAccess={() => setView('therapist-dashboard')} 
          />
        )}
        {view === 'child-selection' && (
          <ChildSelection
            key="selection"
            onSelect={handleStartChildAdventure}
            onCreateNew={() => setView('child-setup')}
            onBack={() => setView('welcome')}
          />
        )}
        {view === 'therapist-dashboard' && (
          <TherapistDashboard 
            key="therapist"
            user={currentUser} 
            isAnonymousDisabled={isAnonymousDisabled}
            onBack={() => setView('welcome')} 
            onStartChild={handleStartChildAdventure}
          />
        )}
        {view === 'child-setup' && (
          <ChildSetup 
            key="setup"
            onComplete={handleStartChildAdventure} 
            onBack={() => setView('child-selection')}
          />
        )}
        {view === 'world-map' && activeChild && (
          <WorldMap 
            key="map"
            child={activeChild}
            onSelectActivity={(diff) => {
              setSelectedDifficulty(diff);
              setView('activity');
            }}
            onBack={() => setView('welcome')}
          />
        )}
        {view === 'activity' && activeChild && (
          <Activity 
            key="activity"
            child={activeChild}
            difficulty={selectedDifficulty || undefined}
            onFinish={handleFinishSession}
            onCancel={() => setView('world-map')}
          />
        )}
        {view === 'summary' && activeChild && lastSession && (
          <SessionSummary 
            key="summary"
            child={activeChild}
            session={lastSession}
            onDone={() => setView('welcome')}
            onBackToMap={() => setView('world-map')}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
