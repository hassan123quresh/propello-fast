import React from 'react';
import { motion } from 'framer-motion';
import { useDimension } from '../../App';

export const CTA: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <section id="contact" className={`py-40 relative overflow-hidden flex items-center justify-center ${dimension === 'growth' ? 'bg-black text-white' : 'bg-propello-green text-black'}`}>
      
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter"
        >
            Your competitors are online.<br/>
            <span className="font-serif italic font-light">The leaders stand apart.</span>
        </motion.h2>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            <button 
                className={`px-12 py-6 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 ${dimension === 'growth' ? 'bg-white text-black hover:bg-propello-green' : 'bg-black text-white hover:bg-white hover:text-black'}`}
                data-hover="true"
            >
                Start My Transformation
            </button>
        </motion.div>
      </div>
    </section>
  );
};