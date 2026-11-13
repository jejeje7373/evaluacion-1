import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente AnimateSuspense inspirado en motion.dev (React Animate Suspense)
 * 
 * Permite orquestar transiciones suaves de entrada y salida entre estados de carga
 * (fallback) y el contenido final, evitando cortes bruscos en la interfaz.
 */
export default function AnimateSuspense({ 
  isLoading = false, 
  fallback, 
  children,
  className = '' 
}) {
  return (
    <div className={`animate-suspense-container ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AnimateSuspense };
