import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDimension } from '../../App';

export const WhyPropello: React.FC = () => {
  const { dimension } = useDimension();
  
  const stats = [
      { val: "+300%", label: "Engagement" },
      { val: "0.2s", label: "Load Time" },
      { val: "100%", label: "Ownership" },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
        {/* Parallax Background Text */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none opacity-[0.03] overflow-hidden select-none">
            <motion.div 
                className="whitespace-nowrap text-[20vw] font-bold leading-none font-sans"
                animate={{ x: ["0%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
                DOMINATE DOMINATE DOMINATE DOMINATE
            </motion.div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-20">
                <h2 className="text-4xl md:text-6xl font-bold mb-8">Designed Once. <br /><span className="font-serif italic font-light text-propello-green">Wins Daily.</span></h2>
                <p className="text-xl opacity-70">Most websites are expenses. Ours are investments that compound.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2, type: "spring" }}
                        className={`p-10 rounded-3xl border ${dimension === 'growth' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}
                    >
                        <div className={`text-6xl md:text-7xl font-bold mb-2 ${dimension === 'growth' ? 'text-black' : 'text-propello-green'}`}>{stat.val}</div>
                        <div className="text-sm font-bold uppercase tracking-widest opacity-60">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
};