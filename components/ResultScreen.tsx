import React from 'react';

interface ResultScreenProps {
    victory: boolean;
    missionTitle?: string;
    onReturn: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ victory, missionTitle, onReturn }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-stone-950 p-8 relative overflow-hidden">
            {/* Background Texture */}
            <div className={`absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/${victory ? 'cubes' : 'cracked-ground'}.png')]`}></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center">
                <h1 className={`text-8xl font-serif font-bold mb-4 tracking-wider ${victory ? 'text-yellow-600' : 'text-red-800'}`} style={{ textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                    {victory ? 'VICTORY' : 'DECEASED'}
                </h1>

                <div className="w-full h-px bg-stone-700 my-6"></div>

                <p className="text-stone-400 font-serif text-xl mb-2">
                    {victory ? 'Target eliminated. Area secured.' : 'The investigator has fallen.'}
                </p>
                {missionTitle && (
                    <p className="text-stone-500 uppercase tracking-widest text-xs mb-8">
                        Mission: {missionTitle}
                    </p>
                )}

                {victory && (
                    <div className="bg-stone-900 border border-stone-700 p-4 w-full mb-8 rounded">
                        <h3 className="text-emerald-500 font-bold mb-2">REWARDS</h3>
                        <div className="flex justify-between text-stone-300 font-mono text-sm">
                            <span>XP Earned</span>
                            <span>+400 XP</span>
                        </div>
                        <div className="flex justify-between text-stone-300 font-mono text-sm">
                            <span>Bestiary Knowledge</span>
                            <span>Updated</span>
                        </div>
                    </div>
                )}

                <button 
                    onClick={onReturn}
                    className={`w-full py-4 text-lg font-bold uppercase tracking-widest transition-all ${
                        victory 
                            ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-700 hover:bg-yellow-900/40' 
                            : 'bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40'
                    }`}
                >
                    Return to Headquarters
                </button>
            </div>
        </div>
    );
};

export default ResultScreen;