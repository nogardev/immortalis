import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import DevChat from './components/DevChat';
import Bestiary from './components/Bestiary';
import MissionBoard from './components/MissionBoard';
import CharacterSheet from './components/CharacterSheet';
import { INITIAL_PLAYER_STATS } from './constants';
import { PlayerStats, Mission } from './types';

type View = 'MENU' | 'GAME' | 'BESTIARY' | 'MISSIONS';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('MENU');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    setCurrentView('GAME');
  };

  const handleGameOver = () => {
    alert("YOU DIED. Mission Failed.");
    setCurrentView('MENU');
    setActiveMission(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'GAME':
        return (
          <div className="flex-1 flex flex-col bg-stone-950 p-4">
             <div className="flex-1 flex justify-center items-center relative">
               <GameCanvas onGameOver={handleGameOver} />
               
               {activeMission && (
                 <div className="absolute top-4 left-4 bg-stone-900/80 border border-stone-700 p-2 rounded text-stone-200 pointer-events-none">
                    <h3 className="text-xs uppercase text-stone-500">Current Objective</h3>
                    <p className="font-serif font-bold">{activeMission.title}</p>
                 </div>
               )}
             </div>
          </div>
        );
      case 'BESTIARY':
        return <Bestiary />;
      case 'MISSIONS':
        return <MissionBoard onStartMission={handleStartMission} />;
      case 'MENU':
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-stone-950 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]">
            <h1 className="text-8xl font-serif text-stone-200 mb-2 tracking-widest" style={{ textShadow: '0 0 10px rgba(200,0,0,0.5)' }}>IMMORTALIS</h1>
            <p className="text-stone-500 italic mb-12 text-xl">"Death is only an inconvenience."</p>
            
            <div className="flex flex-col gap-4 w-64">
              <button 
                onClick={() => setCurrentView('MISSIONS')}
                className="bg-stone-800 hover:bg-red-900 border border-stone-600 text-stone-300 py-3 uppercase tracking-[0.2em] transition-all"
              >
                Start Hunt
              </button>
              <button 
                onClick={() => setCurrentView('BESTIARY')}
                className="bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 py-3 uppercase tracking-[0.2em] transition-all"
              >
                Bestiary
              </button>
              <button disabled className="bg-stone-900 border border-stone-800 text-stone-600 py-3 uppercase tracking-[0.2em] cursor-not-allowed">
                Options
              </button>
              <button disabled className="bg-stone-900 border border-stone-800 text-stone-600 py-3 uppercase tracking-[0.2em] cursor-not-allowed">
                Quit
              </button>
            </div>
            <div className="mt-12 text-xs text-stone-600 font-pixel">
               BUILD: PROTOTYPE_0.1.4
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-950 text-stone-200 font-sans selection:bg-red-900 selection:text-white">
      {/* Sidebar: Navigation (Visible unless in Menu) */}
      {currentView !== 'MENU' && (
         <div className="w-16 bg-stone-900 border-r border-stone-700 flex flex-col items-center py-4 gap-4 z-30">
            <button 
              onClick={() => setCurrentView('MENU')}
              className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-800 rounded"
              title="Main Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <div className="h-px w-8 bg-stone-700 my-2"></div>
            <button 
               onClick={() => setCurrentView('MISSIONS')}
               className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${currentView === 'MISSIONS' ? 'bg-red-900 text-white' : 'text-stone-500 hover:bg-stone-800'}`}
               title="Missions"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
            </button>
            <button 
               onClick={() => setCurrentView('BESTIARY')}
               className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${currentView === 'BESTIARY' ? 'bg-red-900 text-white' : 'text-stone-500 hover:bg-stone-800'}`}
               title="Bestiary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
         </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Bar: Stats (Only visible in game related views) */}
        {currentView !== 'MENU' && <CharacterSheet stats={playerStats} />}
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
            {renderContent()}
        </div>
      </div>

      {/* Right Sidebar: AI DEV (Always visible) */}
      <div className="h-full border-l border-stone-800 z-40 shadow-xl">
        <DevChat />
      </div>
    </div>
  );
}

export default App;