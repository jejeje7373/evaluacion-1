import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';

const SCROLL_TIMEOUT_OFFSET = 100;
const MIN_SCROLL_INTERVAL = 300;
const SCROLL_THRESHOLD = 20;
const TOUCH_SCROLL_THRESHOLD = 100;
const SCALE_FACTOR = 0.08;
const MIN_SCALE = 0.08;
const MAX_SCALE = 2;
const HOVER_SCALE_MULTIPLIER = 1.02;
const CARD_PADDING = 70;

export default function ScrollableCardStack({
  items,
  cardHeight = 340,
  perspective = 1000,
  transitionDuration = 180,
  className = '',
  onItemClick
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollY = useMotionValue(0);
  const lastScrollTime = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const totalItems = items.length;
  const maxIndex = totalItems - 1;

  const FRAME_OFFSET = -28;
  const FRAMES_VISIBLE_LENGTH = 3;
  const SNAP_DISTANCE = 50;

  const clamp = useCallback(
    (val, [min, max]) => Math.min(Math.max(val, min), max),
    []
  );

  const scrollToCard = useCallback(
    (direction) => {
      if (isScrolling) return;

      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      if (timeSinceLastScroll < MIN_SCROLL_INTERVAL) return;

      const newIndex = clamp(currentIndex + direction, [0, maxIndex]);

      if (newIndex !== currentIndex) {
        lastScrollTime.current = now;
        setIsScrolling(true);
        setCurrentIndex(newIndex);
        scrollY.set(newIndex * SNAP_DISTANCE);

        setTimeout(() => {
          setIsScrolling(false);
        }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
      }
    },
    [currentIndex, maxIndex, scrollY, isScrolling, transitionDuration, clamp]
  );

  const handleScroll = useCallback(
    (deltaY) => {
      if (isDragging || isScrolling) return;
      if (Math.abs(deltaY) < SCROLL_THRESHOLD) return;

      const scrollDirection = deltaY > 0 ? 1 : -1;
      scrollToCard(scrollDirection);
    },
    [isDragging, isScrolling, scrollToCard]
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      handleScroll(e.deltaY);
    },
    [handleScroll]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (isScrolling) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          scrollToCard(-1);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          scrollToCard(1);
          break;
        case 'Home':
          e.preventDefault();
          if (currentIndex !== 0) {
            setIsScrolling(true);
            setCurrentIndex(0);
            scrollY.set(0);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        case 'End':
          e.preventDefault();
          if (currentIndex !== maxIndex) {
            setIsScrolling(true);
            setCurrentIndex(maxIndex);
            scrollY.set(maxIndex * SNAP_DISTANCE);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        default:
          break;
      }
    },
    [currentIndex, maxIndex, scrollY, isScrolling, scrollToCard, transitionDuration]
  );

  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  const handleTouchStart = useCallback(
    (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchMoved.current = false;
      setIsDragging(true);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || isScrolling) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;

      if (Math.abs(deltaY) > TOUCH_SCROLL_THRESHOLD && !touchMoved.current) {
        const scrollDirection = deltaY > 0 ? 1 : -1;
        scrollToCard(scrollDirection);
        touchMoved.current = true;
      }
    },
    [isDragging, isScrolling, scrollToCard]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchMoved.current = false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    if (!isDragging) {
      scrollY.set(currentIndex * SNAP_DISTANCE);
    }
  }, [currentIndex, isDragging, scrollY]);

  const getCardTransform = useCallback(
    (index) => {
      const offsetIndex = index - currentIndex;
      const isBehindCurrent = currentIndex > index;
      const blur = !shouldReduceMotion && isBehindCurrent ? 2 : 0;
      const opacity = currentIndex > index ? 0 : 1;

      const scale = shouldReduceMotion
        ? 1
        : clamp(1 - offsetIndex * SCALE_FACTOR, [MIN_SCALE, MAX_SCALE]);

      const y = shouldReduceMotion
        ? 0
        : clamp(offsetIndex * FRAME_OFFSET, [
            FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
            Number.POSITIVE_INFINITY,
          ]);

      const zIndex = items.length - index;

      return { blur, opacity, scale, y, zIndex };
    },
    [currentIndex, items.length, clamp, shouldReduceMotion]
  );

  return (
    <div 
      className={`position-relative mx-auto text-start ${className}`} 
      style={{ maxWidth: '460px', width: '100%' }}
    >
      <div
        ref={containerRef}
        role="region"
        aria-label="Pila interactiva de Canastas Campesinas"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          minHeight: `${cardHeight + CARD_PADDING}px`,
          perspective: `${perspective}px`,
          perspectiveOrigin: 'center 60%',
          outline: 'none',
          touchAction: 'none',
          userSelect: 'none',
          cursor: 'grab'
        }}
      >
        {items.map((item, i) => {
          const transform = getCardTransform(i);
          const isActive = i === currentIndex;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              key={item.id || i}
              initial={false}
              animate={
                shouldReduceMotion
                  ? { x: '-50%', y: '-50%' }
                  : {
                      scale: transform.scale,
                      x: '-50%',
                      y: `calc(-50% + ${transform.y}px)`,
                    }
              }
              whileHover={
                shouldReduceMotion || !isActive
                  ? {}
                  : {
                      scale: transform.scale * HOVER_SCALE_MULTIPLIER,
                      transition: { duration: 0.2, type: 'spring', damping: 20 }
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { damping: 22, duration: 0.28, mass: 0.5, stiffness: 240, type: 'spring' }
              }
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                maxWidth: '420px',
                height: `${cardHeight}px`,
                zIndex: transform.zIndex,
                opacity: transform.opacity,
                filter: `blur(${transform.blur}px)`,
                pointerEvents: isActive ? 'auto' : 'none',
                transformOrigin: 'center center',
                willChange: 'transform, opacity, filter',
              }}
              onMouseEnter={() => isActive && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className={`card h-100 border-0 shadow-lg text-white rounded-4 overflow-hidden ${isHovered ? 'shadow-xl' : ''}`}
                onClick={() => {
                  if (isActive && onItemClick) {
                    onItemClick(item);
                  }
                }}
                style={{
                  background: item.bgGradient || 'linear-gradient(135deg, #198754 0%, #0f5132 100%)',
                  boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.18)' : '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: isActive && onItemClick ? 'pointer' : 'default'
                }}
              >
                <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="badge bg-light text-success fw-bold px-3 py-2 rounded-pill shadow-sm">
                      <i className={`bi ${item.icon || 'bi-bag-heart-fill'} me-1`}></i> {item.badge || 'Más Vendido'}
                    </span>
                    <span className="text-white-50 small fw-semibold">
                      {i + 1} / {items.length}
                    </span>
                  </div>

                  {item.imagen ? (
                    <div className="d-flex align-items-center gap-3 my-2 p-2 rounded-3 bg-white bg-opacity-10 backdrop-blur">
                      <div 
                        className="bg-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '130px', height: '130px', minWidth: '130px' }}
                      >
                        <img 
                          src={item.imagen} 
                          alt={item.title} 
                          style={{ maxHeight: '115px', maxWidth: '115px', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-grow-1 text-start overflow-hidden">
                        <h3 className="h6 fw-bold mb-1 text-white text-truncate">{item.title}</h3>
                        {item.precio && (
                          <span className="badge bg-warning text-dark fw-bold px-2 py-1 mb-1 d-inline-block">
                            {item.precio}
                          </span>
                        )}
                        <p className="small mb-0 text-white-50 text-truncate" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="my-3">
                      <h3 className="h4 fw-bold mb-2 text-white">{item.title}</h3>
                      <p className="small mb-0 text-white-50" style={{ lineHeight: '1.45' }}>
                        {item.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-top border-white-50">
                    <div className="row text-center g-2 mb-2">
                      {item.stats?.map((stat, sIdx) => (
                        <div key={sIdx} className="col-4">
                          <span className="fw-bold d-block fs-6">{stat.value}</span>
                          <span className="small text-white-50" style={{ fontSize: '0.75rem' }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    {onItemClick && (
                      <button 
                        type="button" 
                        className="btn btn-light btn-sm w-100 fw-bold text-success rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick(item);
                        }}
                      >
                        <span>Ver producto en catálogo</span>
                        <i className="bi bi-arrow-right-circle-fill"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Indicadores de navegación (dots) */}
        <div 
          className="position-absolute d-flex gap-2 justify-content-center w-100"
          style={{ bottom: '10px', zIndex: items.length + 5 }}
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIndex(i);
                scrollY.set(i * SNAP_DISTANCE);
              }}
              aria-label={`Ir a la tarjeta ${i + 1}`}
              className="border-0 p-0 rounded-circle transition-all"
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: i === currentIndex ? '4px' : '50%',
                backgroundColor: i === currentIndex ? '#198754' : '#ced4da',
                transition: 'all 0.25s ease'
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-muted small mt-1 mb-0">
        <i className="bi bi-arrows-expand me-1"></i> Desliza con la rueda o arrastra para ver más
      </p>
    </div>
  );
}
