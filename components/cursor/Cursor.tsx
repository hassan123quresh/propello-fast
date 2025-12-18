import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useDimension } from '../../App';

export const Cursor: React.FC = () => {
  const { dimension } = useDimension();
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.dataset.hover === 'true') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <div className="hidden md:block">
      {/* Main Dot */}
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div 
            animate={{ 
                scale: isHovering ? 2.5 : 1,
                backgroundColor: dimension === 'growth' ? '#ffffff' : '#00FF41' 
            }}
            className="w-3 h-3 rounded-full"
        />
      </motion.div>
      
      {/* Trailing Ring */}
      <motion.div
         className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] border transition-colors duration-500`}
         style={{
           x: cursorXSpring,
           y: cursorYSpring,
           borderColor: dimension === 'growth' ? '#000' : '#00FF41',
           opacity: isHovering ? 0 : 0.5
         }}
         animate={{
            scale: isHovering ? 1.5 : 1,
         }}
         transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>
  );
};