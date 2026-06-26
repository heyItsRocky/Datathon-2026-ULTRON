import type { MotionProps } from 'motion/react';

const ENTER_DURATION = 0.4;
const STAGGER_DURATION = 0.08;
const SLOW_DURATION = 0.3;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function usePageEnter(index = 0): MotionProps {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: ENTER_DURATION,
      delay: index * STAGGER_DURATION,
      ease: EASE_OUT,
    },
  };
}

export function useRadialTransition(target: string): MotionProps {
  const hoverScale = target === 'dashboard' ? 1.06 : 1.04;

  return {
    whileHover: { scale: hoverScale, filter: 'brightness(1.08)' },
    whileTap: { scale: 0.97, filter: 'brightness(0.92)' },
    transition: {
      duration: SLOW_DURATION,
      ease: EASE_OUT,
    },
  };
}
