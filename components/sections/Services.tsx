import React from 'react';
import { useDimension } from '../../App';
import MagicBento from '../ui/MagicBento';

export const Services: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <section id="services" className={`py-20 md:py-32 ${dimension === 'growth' ? 'bg-gray-50' : 'bg-black/50'}`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 md:mb-20 max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Our Capabilities</h2>
            <p className={`text-lg md:text-xl ${dimension === 'growth' ? 'text-gray-600' : 'text-gray-400'}`}>Everything you need to scale. Nothing you don't.</p>
        </div>

        <div className="w-full">
            <MagicBento 
                dimension={dimension}
                textAutoHide={false}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
            />
        </div>
      </div>
    </section>
  );
};