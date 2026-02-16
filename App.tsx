import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import DevChat from './components/DevChat';
import Bestiary from './components/Bestiary';
import MissionBoard from './components/MissionBoard';
import CharacterSheet from './components/CharacterSheet';
import EngineDashboard from './components/Editor/EngineDashboard';
import ResultScreen from './components/ResultScreen';
import { INITIAL_PLAYER_STATS, ENABLE_DEV_TOOLS } from './constants';
import { PlayerStats, Mission } from './types';

type View = 'MENU' | 'GAME' | 'BESTIARY' | 'MISSIONS' | 'ENGINE' | 'RESULT';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('MENU');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [lastResult, setLastResult] = useState<{ victory: boolean } | null>(null);
  
  // Easter Egg State (Controlled by ENABLE_DEV_TOOLS constant initially)
  const [showEngineTools, setShowEngineTools] = useState(ENABLE_DEV_TOOLS);
  const [cheatBuffer, setCheatBuffer] = useState('');

  // Handle "immortalis" cheat code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Only active in MENU
        if (currentView !== 'MENU') return;

        const char = e.key.toLowerCase();
        // Simple filter for letters
        if (char.length === 1 && /[a-z]/.test(char)) {
            setCheatBuffer(prev => {
                const next = (prev + char).slice(-10); // 'immortalis' is 10 chars
                if (next === 'immortalis') {
                    setShowEngineTools(s => !s);
                    return ''; // Reset buffer
                }
                return next;
            });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setCurrentView('GAME');
  };

  const handleGameOver = () => {
    setLastResult({ victory: false });
    setCurrentView('RESULT');
  };

  const handleMissionComplete = (data: any) => {
      setLastResult({ victory: true });
      setCurrentView('RESULT');
  };

  const handleReturnToMenu = () => {
      setActiveMission(null);
      setLastResult(null);
      setCurrentView('MENU');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'GAME':
        return (
          <div className="flex-1 flex flex-col bg-[#000] p-4">
             <div className="flex-1 flex justify-center items-center relative">
               <div className="retro-border p-1 bg-[#111]">
                   <GameCanvas 
                        key={activeMission?.id || 'game-canvas'} // Forces remount on mission change
                        mission={activeMission}
                        onGameOver={handleGameOver} 
                        onMissionComplete={handleMissionComplete}
                   />
               </div>
               
               {activeMission && (
                 <div className="absolute top-4 left-4 retro-border bg-[#000080] text-white px-4 py-2 pointer-events-none">
                    <h3 className="text-[10px] uppercase text-[#ffff00] font-pixel mb-1">Current Objective</h3>
                    <p className="font-serif text-lg leading-none">{activeMission.title}</p>
                 </div>
               )}
             </div>
          </div>
        );
      case 'RESULT':
          return (
              <ResultScreen 
                victory={lastResult?.victory || false} 
                missionTitle={activeMission?.title}
                onReturn={handleReturnToMenu}
              />
          );
      case 'BESTIARY':
        return <Bestiary />;
      case 'MISSIONS':
        return <MissionBoard onStartMission={handleStartMission} />;
      case 'ENGINE':
        return <EngineDashboard />;
      case 'MENU':
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-stone-950 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
            <h1 className="text-9xl font-pixel text-red-800 mb-8 tracking-widest drop-shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                IMMORTALIS
            </h1>
            
            <div className="flex flex-col gap-6 w-72">
              <button 
                onClick={() => setCurrentView('MISSIONS')}
                className="retro-btn bg-stone-800 text-stone-200 py-4 font-pixel text-2xl hover:bg-red-900 hover:text-white transition-colors"
              >
                START HUNT
              </button>
              <button 
                onClick={() => setCurrentView('BESTIARY')}
                className="retro-btn bg-stone-800 text-stone-200 py-4 font-pixel text-2xl hover:bg-stone-700 transition-colors"
              >
                BESTIARY
              </button>
              
              {showEngineTools && (
                  <button 
                    onClick={() => setCurrentView('ENGINE')}
                    className="retro-btn bg-[#003300] text-[#00ff00] border-[#00ff00] py-4 font-pixel text-2xl hover:bg-[#004400] transition-colors"
                  >
                    DEBUG TOOLS
                  </button>
              )}
              
              <button disabled className="retro-btn bg-black text-stone-600 border-stone-800 py-4 font-pixel text-2xl cursor-not-allowed opacity-50">
                QUIT
              </button>
            </div>
            <div className="mt-16 text-xs text-stone-600 font-pixel">
               BUILD: PROTOTYPE_0.1.8
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-stone-200 font-sans selection:bg-red-900 selection:text-white">
      {/* Sidebar: Navigation (Visible unless in Menu) */}
      {currentView !== 'MENU' && (
         <div className="w-20 bg-[#1c1917] border-r-4 border-[#292524] flex flex-col items-center py-4 gap-4 z-30 shadow-xl">
            <button 
              onClick={() => setCurrentView('MENU')}
              className="w-12 h-12 retro-btn bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-red-900"
              title="Main Menu"
            >
              M
            </button>
            <div className="h-1 w-12 bg-[#292524]"></div>
            <button 
               onClick={() => setCurrentView('MISSIONS')}
               className={`w-12 h-12 retro-btn flex items-center justify-center transition-colors ${currentView === 'MISSIONS' ? 'bg-[#8b0000] text-white border-white' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
               title="Missions"
            >
               Q
            </button>
            <button 
               onClick={() => setCurrentView('BESTIARY')}
               className={`w-12 h-12 retro-btn flex items-center justify-center transition-colors ${currentView === 'BESTIARY' ? 'bg-[#8b0000] text-white border-white' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
               title="Bestiary"
            >
              B
            </button>
            
            <div className="h-1 w-12 bg-[#292524]"></div>
            
            {showEngineTools && (
                 <button 
                   onClick={() => setCurrentView('ENGINE')}
                   className={`w-12 h-12 retro-btn flex items-center justify-center transition-colors ${currentView === 'ENGINE' ? 'bg-[#004400] text-[#00ff00] border-[#00ff00]' : 'bg-black text-[#004400] border-[#004400] hover:text-[#00ff00]'}`}
                   title="Engine Tools"
                >
                  E
                </button>
            )}
         </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Bar: Stats (Only visible in game related views) */}
        {currentView !== 'MENU' && currentView !== 'ENGINE' && currentView !== 'RESULT' && <CharacterSheet stats={playerStats} />}
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
            {renderContent()}
        </div>
      </div>

      {/* Right Sidebar: AI DEV (Only visible if Tools Enabled) */}
      {showEngineTools && (
        <div className="h-full border-l-4 border-[#292524] z-40 shadow-xl transition-all duration-300">
            <DevChat />
        </div>
      )}
    </div>
  );
}

export default App;