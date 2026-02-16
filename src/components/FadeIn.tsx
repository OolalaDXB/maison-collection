import { useRef, type ReactNode } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const FadeIn = ({ children, delay = 0, className }: FadeInProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 30 }
      }
      transition={{
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : delay,
      }}
      style={{ willChange: "opacity, transform" }}
      className={className}
    >
      {children}
    </m.div>
  );
};

export default FadeIn;
