import React from 'react';
import { useDimension } from '../../App';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <section id="results" className={`py-32 ${dimension === 'growth' ? 'bg-gray-100' : 'bg-propello-dim'}`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/3">
                <h2 className="text-4xl font-bold mb-6">Real Results.<br/>Real Revenue.</h2>
                <p className="opacity-70 text-lg mb-8">Don't take our word for it. Here is what happens when you partner with Propello.</p>
                <div className="flex gap-4">
                    <button className={`w-12 h-12 rounded-full flex items-center justify-center border ${dimension === 'growth' ? 'border-gray-300 hover:bg-black hover:text-white' : 'border-gray-700 hover:bg-propello-green hover:text-black'}`}>←</button>
                    <button className={`w-12 h-12 rounded-full flex items-center justify-center border ${dimension === 'growth' ? 'border-gray-300 hover:bg-black hover:text-white' : 'border-gray-700 hover:bg-propello-green hover:text-black'}`}>→</button>
                </div>
            </div>

            <div className="md:w-2/3">
                <div className={`p-12 rounded-3xl relative ${dimension === 'growth' ? 'bg-white shadow-2xl' : 'bg-white/5 border border-white/10'}`}>
                    <Quote className={`absolute top-10 left-10 opacity-10 ${dimension === 'growth' ? 'text-black' : 'text-white'}`} size={120} />
                    
                    <p className="text-2xl md:text-4xl font-serif italic font-light leading-relaxed relative z-10 mb-8">
                        "Propello didn't just design a website — they changed how we're perceived in the market. Our inbound leads have tripled in 3 months. It's the best ROI we've ever seen."
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full" />
                        <div>
                            <div className="font-bold font-sans">Sarah Jenkins</div>
                            <div className="text-sm opacity-60 font-sans">CEO, Horizon Realty</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};