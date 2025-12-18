import React from 'react';
import { motion } from 'framer-motion';
import { useDimension } from '../../App';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProblemSolution: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Problem (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`p-8 md:p-10 rounded-3xl border ${dimension === 'growth' ? 'bg-red-50/50 border-red-100' : 'bg-red-950/10 border-red-900/30'}`}
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <AlertCircle className="text-red-500" size={28} />
                <h3 className={`text-xl md:text-2xl font-bold font-serif italic ${dimension === 'growth' ? 'text-red-900' : 'text-red-400'}`}>The Reality</h3>
            </div>
            
            <ul className="space-y-4 md:space-y-6">
                {[
                    "Your business looks just like the competition.",
                    "Visitors leave within 5 seconds.",
                    "Your brand feels outdated and slow.",
                    "You're losing leads to 'modern' competitors."
                ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 opacity-70">
                        <span className="block mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-lg md:text-xl leading-relaxed">{item}</span>
                    </li>
                ))}
            </ul>
          </motion.div>

          {/* Solution (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative Glow */}
            <div className={`absolute inset-0 bg-propello-green blur-[80px] opacity-20 -z-10 rounded-full`} />

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-10 leading-tight">
                We don't just build websites. <br />
                <span className="font-serif italic font-light text-propello-green">We build engines.</span>
            </h2>

            <div className="space-y-6 md:space-y-8">
                {[
                    { title: "Designed to Sell", desc: "Every pixel is placed to convert visitors into paying clients." },
                    { title: "Unforgettable Brand", desc: "Visuals that stick in your customer's mind for years." },
                    { title: "Category Dominance", desc: "Position yourself as the only logical choice in your city." }
                ].map((item, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        className="flex gap-4 group"
                    >
                        <CheckCircle2 className={`flex-shrink-0 transition-colors ${dimension === 'growth' ? 'text-black group-hover:text-propello-green' : 'text-white group-hover:text-propello-green'}`} size={28} />
                        <div>
                            <h4 className="text-lg md:text-xl font-bold mb-2">{item.title}</h4>
                            <p className={`text-base md:text-lg ${dimension === 'growth' ? 'text-gray-600' : 'text-gray-400'}`}>{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};