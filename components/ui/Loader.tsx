import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  onLoadingComplete: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading sequence - Much faster now
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 20; // Larger increments
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 40); // Reduced tick rate from 150ms to 40ms

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Reduced delay at 100% from 500ms to 100ms
      const timeout = setTimeout(() => {
        onLoadingComplete();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [progress, onLoadingComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] bg-[#050505] flex items-center justify-center"
      exit={{ y: '-100%' }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }} // Faster exit animation
    >
      <div className="relative w-full max-w-md px-10">
        <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">System</span>
                <span className="text-white font-serif italic text-3xl">Propello</span>
            </div>
            <span className="text-propello-green font-mono text-5xl font-light">
                {Math.min(100, Math.floor(progress))}%
            </span>
        </div>
        
        <div className="w-full h-[1px] bg-gray-800 relative overflow-hidden">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-propello-green shadow-[0_0_10px_#00FF41]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
            />
        </div>
        
        <div className="mt-4 flex justify-between text-xs font-mono text-gray-500">
             <span>v2.0.4 [STABLE]</span>
             <span className="uppercase tracking-widest">
                {progress < 100 ? 'Loading Assets...' : 'Ready'}
             </span>
        </div>
      </div>
    </motion.div>
  );
};