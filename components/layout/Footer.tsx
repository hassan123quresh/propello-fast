import React from 'react';
import { useDimension } from '../../App';
import { Zap, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { dimension } = useDimension();

  return (
    <footer className={`py-20 ${dimension === 'growth' ? 'bg-white text-black' : 'bg-black text-gray-400'}`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dimension === 'growth' ? 'bg-black text-white' : 'bg-propello-green text-black'}`}>
                    <Zap size={16} fill="currentColor" />
                </div>
                <span className="text-xl font-bold tracking-tighter">Propello</span>
            </div>

            <div className="flex gap-8">
                {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                    <a key={social} href="#" className="hover:text-propello-green transition-colors font-medium">{social}</a>
                ))}
            </div>
        </div>
        
        <div className={`w-full h-[1px] ${dimension === 'growth' ? 'bg-gray-100' : 'bg-gray-900'} mb-8`} />
        
        <div className="flex flex-col md:flex-row justify-between text-sm opacity-60">
            <p>&copy; {new Date().getFullYear()} Propello Digital. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
};