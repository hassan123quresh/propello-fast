import React from 'react';
import { motion } from 'framer-motion';
import { useDimension } from '../../App';

const steps = [
    { num: '01', title: 'Discover', desc: 'We audit your niche, competitors, and goals.' },
    { num: '02', title: 'Architect', desc: 'We map out the user journey and conversion strategy.' },
    { num: '03', title: 'Build', desc: 'Development using cutting-edge React tech stacks.' },
    { num: '04', title: 'Launch', desc: 'Deployment, SEO setup, and immediate impact.' }
];

export const Process: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <section id="process" className="py-32">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold mb-20 text-center">How We Win</h2>
        
        <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative group"
                >
                    <div className={`text-6xl font-bold mb-4 opacity-10 transition-opacity group-hover:opacity-30 ${dimension === 'growth' ? 'text-black' : 'text-propello-green'}`}>
                        {step.num}
                    </div>
                    <div className={`w-full h-[1px] mb-8 ${dimension === 'growth' ? 'bg-gray-200' : 'bg-gray-800'}`} />
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="opacity-70">{step.desc}</p>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};