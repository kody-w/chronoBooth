import React, { useState, useCallback } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { HISTORICAL_SCENES } from './constants';
import { AppState, HistoricalScene } from './types';
import { analyzeImage, transformImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleCapture = useCallback((imageSrc: string) => {
    setOriginalImage(imageSrc);
    setAppState(AppState.PREVIEW);
  }, []);

  const handleAnalyze = async () => {
    if (!originalImage) return;
    
    setIsLoading(true);
    setLoadingMessage('Analyzing your features with Gemini 3 Pro...');
    
    try {
      const result = await analyzeImage(originalImage);
      setAnalysisText(result);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze image. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransform = async (scene?: HistoricalScene) => {
    if (!originalImage) return;

    setIsLoading(true);
    setAppState(AppState.PROCESSING);

    try {
      let prompt = '';
      if (scene) {
        setLoadingMessage(`Transporting you to ${scene.name}...`);
        prompt = scene.prompt;
      } else {
        // Custom prompt
        setLoadingMessage('Applying your custom edit...');
        prompt = `Edit this image. ${customPrompt}. Keep the person's identity.`;
      }

      // If we have analysis text, append it to help the model maintain identity
      if (analysisText) {
        prompt += ` The person looks like: ${analysisText}`;
      }

      const resultImage = await transformImage(originalImage, prompt);
      setGeneratedImage(resultImage);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.CAMERA);
    setOriginalImage(null);
    setGeneratedImage(null);
    setAnalysisText('');
    setCustomPrompt('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-indigo-900/50 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                ⏳
            </div>
            <h1 className="text-xl font-bold brand-font tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              CHRONO<span className="text-white">BOOTH</span>
            </h1>
          </div>
          {appState !== AppState.LANDING && (
             <button onClick={resetApp} className="text-sm text-gray-400 hover:text-white font-medium">
               Start Over
             </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 max-w-4xl mx-auto w-full">
        
        {/* LANDING STATE */}
        {appState === AppState.LANDING && (
          <div className="flex flex-col items-center justify-center flex-grow text-center gap-8 py-12">
             <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <span className="relative text-8xl">📸</span>
             </div>
             <div className="space-y-4 max-w-lg">
               <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                 Step Into <br/> <span className="text-indigo-400">History</span>
               </h2>
               <p className="text-gray-400 text-lg">
                 Take a selfie and let Gemini AI transport you through time. Become a knight, a pharaoh, or a cyberpunk rebel in seconds.
               </p>
             </div>
             <button 
               onClick={() => setAppState(AppState.CAMERA)}
               className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-xl hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
             >
               Enter Booth
             </button>

             <div className="flex gap-6 text-gray-500 text-sm mt-8">
                <span className="flex items-center gap-1"><span className="text-indigo-500">✦</span> Gemini 3 Pro Vision</span>
                <span className="flex items-center gap-1"><span className="text-purple-500">✦</span> Gemini 2.5 Flash Editing</span>
             </div>
          </div>
        )}

        {/* CAMERA STATE */}
        {appState === AppState.CAMERA && (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-6 brand-font text-center">Capture Your Image</h2>
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {/* PREVIEW STATE */}
        {appState === AppState.PREVIEW && originalImage && (
          <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
            
            {/* Left: Image & Analysis */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-700 shadow-xl">
                 <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                 {isLoading && !loadingMessage.includes('Transporting') && (
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2 backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                      <p className="text-sm font-mono animate-pulse text-indigo-300">Scanning biometric data...</p>
                   </div>
                 )}
              </div>

              {!analysisText ? (
                 <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-indigo-500/30 text-indigo-300 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                   </svg>
                   Analyze Features (Gemini 3 Pro)
                 </button>
              ) : (
                <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                   <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Subject Analysis</h4>
                   <p className="text-sm text-gray-300 leading-relaxed italic">"{analysisText}"</p>
                </div>
              )}
            </div>

            {/* Right: Transformation Controls */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
               <div>
                 <h3 className="text-xl font-bold mb-2">Choose Your Era</h3>
                 <p className="text-gray-400 text-sm mb-4">Select a destination or type your own time travel parameters.</p>
                 
                 <div className="grid grid-cols-2 gap-3">
                   {HISTORICAL_SCENES.map((scene) => (
                     <button
                       key={scene.id}
                       onClick={() => handleTransform(scene)}
                       disabled={isLoading}
                       className="flex flex-col items-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition-all group text-center"
                     >
                       <span className="text-3xl mb-2 group-hover:scale-110 transition-transform block">{scene.icon}</span>
                       <span className="font-bold text-sm text-gray-200">{scene.name}</span>
                       <span className="text-xs text-gray-500 mt-1">{scene.description}</span>
                     </button>
                   ))}
                 </div>
               </div>

               <div className="border-t border-gray-800 pt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Custom Reality Edit</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. 'Add a retro filter' or 'Make me a zombie'"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => handleTransform()}
                      disabled={!customPrompt || isLoading}
                      className="bg-indigo-600 disabled:bg-gray-700 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      GO
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* PROCESSING STATE */}
        {appState === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center flex-grow gap-8 text-center">
            <div className="relative w-32 h-32">
               <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">⚡</div>
            </div>
            <div>
               <h3 className="text-2xl font-bold animate-pulse">{loadingMessage}</h3>
               <p className="text-gray-400 mt-2">Generating pixels with Gemini 2.5 Flash...</p>
            </div>
          </div>
        )}

        {/* RESULT STATE */}
        {appState === AppState.RESULT && generatedImage && (
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-6">
             <div className="w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/50 relative group">
               <img src={generatedImage} alt="Generated" className="w-full h-auto" />
               <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={generatedImage} 
                    download="chronobooth-result.png"
                    className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-indigo-50"
                  >
                    Download Image
                  </a>
               </div>
             </div>

             <div className="flex gap-4 w-full">
               <button 
                 onClick={() => setAppState(AppState.PREVIEW)}
                 className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
               >
                 Try Another Era
               </button>
               <button 
                 onClick={resetApp}
                 className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-colors"
               >
                 New Photo
               </button>
             </div>
          </div>
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center flex-grow text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-400 mb-2">Time Travel Paradox Detected</h3>
            <p className="text-gray-400 max-w-md mb-8">Something went wrong during the transformation process. The timeline refused to change.</p>
            <button 
              onClick={() => setAppState(AppState.PREVIEW)}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white"
            >
              Return to Safety
            </button>
          </div>
        )}

      </main>
      
      <footer className="p-6 text-center text-gray-600 text-xs border-t border-gray-900 mt-auto">
         <p>Powered by Google Gemini 2.5 Flash & 3 Pro Preview</p>
      </footer>
    </div>
  );
};

export default App;
