'use client';

// This is a client component that wraps framer-motion functionality
// to make it easy to use in Next.js 13+ with App Router

import React from 'react';
import { 
  motion as framerMotion, 
  AnimatePresence as FramerAnimatePresence 
} from 'framer-motion';

// Re-export common motion components
export const motion = framerMotion;
export const AnimatePresence = FramerAnimatePresence;

// Common animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideIn = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const popIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

// Transition presets
export const transitions = {
  default: { duration: 0.3 },
  bounce: { type: 'spring', stiffness: 300, damping: 20 },
  slow: { duration: 0.6, ease: 'easeInOut' },
};

// Motion component with defaults
export const MotionDiv = ({ 
  children, 
  variant = 'fadeIn', 
  transition = 'default',
  ...props 
}) => {
  const variants = {
    fadeIn,
    slideIn,
    popIn
  };

  const transitionPresets = {
    default: transitions.default,
    bounce: transitions.bounce,
    slow: transitions.slow,
  };

  return (
    <motion.div
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={transitionPresets[transition]}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default motion;