import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDimension } from '../../App';
import { ArrowDownCircle, Play } from 'lucide-react';
import Ballpit from '../ui/Ballpit';

export const Hero: React.FC = () => {
  const { dimension } = useDimension();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [ballCount, setBallCount] = useState(50); // Default low for SSR safety
  
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Adjust ball count based on screen size for performance
    const handleResize = () => {
        setBallCount(window.innerWidth < 768 ? 30 : 120);
    };
    
    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center justify-center pt-20 px-6 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full z-0">
         {/* Ballpit Background - Full Opacity for clarity */}
         <div className="absolute inset-0">
           <Ballpit 
             key={`${dimension}-${ballCount}`} // Force remount when dimension or count changes
             count={ballCount} 
             gravity={0.25} 
             friction={0.95} 
             wallBounce={1.2} 
             followCursor={true}
             colors={dimension === 'growth' ? [0x00FF41, 0x111111, 0x00FF41] : [0x00FF41, 0xFFFFFF, 0x888888]}
             ambientColor={dimension === 'growth' ? 0xffffff : 0x222222}
             maxSize={0.8}
             minSize={0.4}
           />
         </div>

         {/* Dynamic Grid Overlay */}
         <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] transition-opacity duration-1000 ${dimension === 'void' ? 'opacity-20' : 'opacity-40'} pointer-events-none`}></div>
         
         {/* Void Mode Specifics */}
         {dimension === 'void' && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]"
            />
         )}
         {dimension === 'void' && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-propello-green/10 blur-[100px]"
             />
         )}
      </div>

      <div className="container mx-auto relative z-10 text-center max-w-5xl pointer-events-none">
        <motion.div style={{ y: yText, opacity: opacityText }} className="pointer-events-auto">
            
            {/* Tagline */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 md:mb-8 text-[10px] md:text-xs font-bold tracking-widest uppercase border backdrop-blur-md ${dimension === 'growth' ? 'border-gray-200/50 bg-white/30 text-black' : 'border-white/10 bg-white/5 text-propello-green'}`}
            >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dimension === 'growth' ? 'bg-black' : 'bg-propello-green'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${dimension === 'growth' ? 'bg-black' : 'bg-propello-green'}`}></span>
                </span>
                Propello Engine v2.0
            </motion.div>

            {/* Headline - Reduced Size with Typography Mix */}
            <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 md:mb-8 leading-[0.95] md:leading-[0.9]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                Your Business.<br />
                <span className={`font-serif italic font-light bg-clip-text text-transparent bg-gradient-to-r ${dimension === 'growth' ? 'from-black via-gray-700 to-gray-400' : 'from-white via-gray-200 to-gray-500'}`}>
                    Seen.
                </span>{" "}
                <span className={`font-serif italic font-light bg-clip-text text-transparent bg-gradient-to-r ${dimension === 'growth' ? 'from-propello-green to-emerald-700' : 'from-propello-green to-teal-400'}`}>
                    Chosen.
                </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
                className={`text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4 md:px-0 ${dimension === 'growth' ? 'text-gray-600' : 'text-gray-400'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Propello designs high-performance websites that turn local businesses into category leaders. 
                <span className={`font-serif italic text-lg md:text-xl ${dimension === 'void' ? 'text-propello-green' : 'text-black'}`}> Don't just compete. Dominate.</span>
            </motion.p>

            {/* Buttons - Liquid Glass Style */}
            <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <button 
                    className={`w-full sm:w-auto group relative px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 backdrop-blur-xl border shadow-lg ${
                        dimension === 'growth' 
                        ? 'bg-white/40 border-white/50 text-black hover:bg-white/60' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                    data-hover="true"
                >
                    <span className="relative z-10">Propel My Business</span>
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-propello-green/20" />
                </button>

                <button 
                    className={`w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-lg transition-all backdrop-blur-xl border shadow-lg ${
                        dimension === 'growth' 
                        ? 'bg-white/20 border-white/40 text-black hover:bg-white/40' 
                        : 'bg-black/20 border-white/10 text-white hover:bg-white/10'
                    }`}
                    data-hover="true"
                >
                    <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-current group-hover:text-inherit">
                        <Play size={14} className="ml-1 fill-current group-hover:invert" />
                    </div>
                    <span>See How It Works</span>
                </button>
            </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ArrowDownCircle className={`opacity-50 ${dimension === 'growth' ? 'text-black' : 'text-white'}`} size={24} />
      </motion.div>
    </section>
  );
};