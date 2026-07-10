import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Pipeline } from './components/Pipeline';
import { WhatIsICG } from './components/WhatIsICG';
import { QuadruplesExplorer } from './components/QuadruplesExplorer';
import { StepThrough } from './components/StepThrough';
import { MemorySim } from './components/MemorySim';
import { WhyICG } from './components/WhyICG';
import { Footer } from './components/Footer';
import { useLenis } from './hooks/useLenis';
import { useElmoStore } from './store/elmoStore';
import { Playground } from './pages/Playground';
import { Notes } from './pages/Notes';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

const App: React.FC = () => {
  useLenis();
  const { theme } = useElmoStore();

  useEffect(() => {
    // Initial theme setup
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Blobs */}
      <div className="bg-blob w-[500px] h-[500px] bg-indigo-500/20 top-[-100px] right-[-100px] rounded-full" />
      <div className="bg-blob w-[400px] h-[400px] bg-emerald-500/10 bottom-[10%] left-[-100px] rounded-full" />
      <div className="bg-blob w-[300px] h-[300px] bg-rose-500/10 top-[40%] right-[10%] rounded-full" />

      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <Hero />
              <div id="pipeline" className="scroll-mt-20">
                <Pipeline />
              </div>
              <div id="what-is-icg" className="scroll-mt-20">
                <WhatIsICG />
              </div>
              <div id="quads" className="scroll-mt-20">
                <QuadruplesExplorer />
              </div>
              <div id="step-through" className="scroll-mt-20">
                <StepThrough />
              </div>
              <div id="sim" className="scroll-mt-20">
                <MemorySim />
              </div>
              <WhyICG />
            </main>
          }
        />
        <Route path="/playground" element={<Playground />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
