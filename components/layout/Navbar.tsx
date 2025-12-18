import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDimension } from '../../App';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { dimension, toggleDimension } = useDimension();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Process', href: '#process' },
    { name: 'Results', href: '#results' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const element = document.querySelector(href);
    if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'py-4 backdrop-blur-lg bg-white/10' : 'py-6 md:py-8 bg-transparent'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center relative z-50">
        
        {/* Logo */}
        <motion.a 
            href="#" 
            onClick={(e) => handleScrollTo(e, '#')}
            className="text-2xl font-bold tracking-tighter flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            data-hover="true"
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${dimension === 'growth' ? 'bg-black text-white' : 'bg-propello-green text-black'}`}>
                <Zap size={16} fill="currentColor" />
            </div>
            <span className={`transition-colors duration-500 ${dimension === 'void' ? 'text-white' : 'text-black'}`}>Propello</span>
        </motion.a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
                <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className={`text-sm font-medium transition-colors hover:text-propello-green ${dimension === 'void' ? 'text-gray-300' : 'text-gray-600'}`}
                    data-hover="true"
                >
                    {link.name}
                </a>
            ))}
            
            {/* Dimension Toggle */}
            <button 
                onClick={toggleDimension}
                className="relative px-4 py-2 rounded-full overflow-hidden border border-current text-xs font-bold uppercase tracking-widest group"
                data-hover="true"
            >
                <span className="relative z-10">{dimension === 'growth' ? 'Enter Void' : 'Exit Void'}</span>
                <motion.div 
                    className={`absolute inset-0 z-0 ${dimension === 'growth' ? 'bg-black' : 'bg-propello-green'}`}
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '0%' }}
                    transition={{ type: 'tween', ease: 'easeInOut' }}
                />
                <span className={`absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${dimension === 'growth' ? 'text-white' : 'text-black'}`}>
                     {dimension === 'growth' ? 'SWITCH' : 'RETURN'}
                </span>
            </button>

            {/* CTA */}
            <button 
                onClick={(e) => handleScrollTo(e, '#contact')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all transform hover:-translate-y-1 ${dimension === 'growth' ? 'bg-black text-white hover:bg-propello-green hover:text-black' : 'bg-propello-green text-black hover:bg-white'}`}
                data-hover="true"
            >
                Start Project
                <ArrowRight size={16} />
            </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleDimension} className={`text-xs font-bold uppercase ${dimension === 'void' ? 'text-white' : 'text-black'}`}>
                {dimension === 'growth' ? 'VOID' : 'GROWTH'}
            </button>
            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className={`p-2 ${dimension === 'void' ? 'text-white' : 'text-black'}`}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '100vh' }}
                exit={{ opacity: 0, height: 0 }}
                className={`md:hidden fixed top-0 left-0 w-full pt-24 px-6 z-40 ${dimension === 'void' ? 'bg-propello-dim' : 'bg-white'}`}
            >
                <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            onClick={(e) => handleScrollTo(e, link.href)}
                            className={`text-2xl font-medium ${dimension === 'void' ? 'text-white' : 'text-black'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <button 
                        onClick={(e) => handleScrollTo(e, '#contact')}
                        className="w-full py-4 mt-4 bg-propello-green text-black font-bold rounded-xl"
                    >
                        Start Project
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};