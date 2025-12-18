import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cursor } from './components/cursor/Cursor';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { ProblemSolution } from './components/sections/ProblemSolution';
import { Services } from './components/sections/Services';
import { WhyPropello } from './components/sections/WhyPropello';
import { Testimonials } from './components/sections/Testimonials';
import { Process } from './components/sections/Process';
import { CTA } from './components/sections/CTA';
import { Footer } from './components/layout/Footer';
import { Loader } from './components/ui/Loader';

// Dimension Context
type Dimension = 'growth' | 'void';

interface DimensionContextType {
  dimension: Dimension;
  toggleDimension: () => void;
}

const DimensionContext = createContext<DimensionContextType>({
  dimension: 'growth',
  toggleDimension: () => {},
});

export const useDimension = () => useContext(DimensionContext);

const App: React.FC = () => {
  const [dimension, setDimension] = useState<Dimension>('growth');
  const [isLoading, setIsLoading] = useState(true);

  const toggleDimension = () => {
    setDimension((prev) => (prev === 'growth' ? 'void' : 'growth'));
  };

  useEffect(() => {
    if (dimension === 'void') {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-propello-light', 'text-slate-900');
      document.body.classList.add('bg-propello-dark', 'text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-propello-dark', 'text-white');
      document.body.classList.add('bg-propello-light', 'text-slate-900');
    }
  }, [dimension]);

  return (
    <DimensionContext.Provider value={{ dimension, toggleDimension }}>
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" onLoadingComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen transition-colors duration-1000 ${dimension === 'void' ? 'selection:bg-purple-500' : 'selection:bg-propello-green'}`}>
        <Cursor />
        
        <Navbar />
        
        <main className="relative z-10 overflow-hidden">
           <Hero />
           <ProblemSolution />
           <Services />
           <WhyPropello />
           <Testimonials />
           <Process />
           <CTA />
        </main>

        <Footer />
        
        {/* Ambient Noise / Texture Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
        />
      </div>
    </DimensionContext.Provider>
  );
};

export default App;