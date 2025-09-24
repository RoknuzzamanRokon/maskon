/**
 * Responsive utilities for the admin dashboard
 */

export interface BreakpointConfig {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
}

export const breakpoints: BreakpointConfig = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export type BreakpointKey = keyof BreakpointConfig;

/**
 * Hook to get current screen size
 */
export function useScreenSize() {
    if (typeof window === 'undefined') {
        return { width: 0, height: 0, isMobile: false, isTablet: false, isDesktop: false };
    }

    const [screenSize, setScreenSize] = React.useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    React.useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = screenSize.width < breakpoints.md;
    const isTablet = screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
    const isDesktop = screenSize.width >= breakpoints.lg;

    return {
        ...screenSize,
        isMobile,
        isTablet,
        isDesktop,
    };
}

/**
 * Hook to detect if device supports touch
 */
export function useTouchDevice() {
    const [isTouch, setIsTouch] = React.useState(false);

    React.useEffect(() => {
        const checkTouch = () => {
            setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };

        checkTouch();
        window.addEventListener('resize', checkTouch);
        return () => window.removeEventListener('resize', checkTouch);
    }, []);

    return isTouch;
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(values: Partial<Record<BreakpointKey, T>>, defaultValue: T): T {
    const { width } = useScreenSize();

    const getValueForWidth = (screenWidth: number): T => {
        const sortedBreakpoints = Object.entries(breakpoints)
            .sort(([, a], [, b]) => b - a) // Sort descending
            .map(([key]) => key as BreakpointKey);

        for (const breakpoint of sortedBreakpoints) {
            if (screenWidth >= breakpoints[breakpoint] && values[breakpoint] !== undefined) {
                return values[breakpoint]!;
            }
        }

        return defaultValue;
    };

    return getValueForWidth(width);
}

/**
 * Utility to generate responsive class names
 */
export function responsiveClasses(
    classes: Partial<Record<BreakpointKey | 'base', string>>
): string {
    const classArray: string[] = [];

    if (classes.base) {
        classArray.push(classes.base);
    }

    Object.entries(classes).forEach(([breakpoint, className]) => {
        if (breakpoint !== 'base' && className) {
            // Check if className already has the breakpoint prefix
            if (className.includes(`${breakpoint}:`)) {
                classArray.push(className);
            } else {
                classArray.push(`${breakpoint}:${className}`);
            }
        }
    });

    return classArray.join(' ');
}

/**
 * Touch-friendly button props
 */
export const touchFriendlyProps = {
    className: "min-h-touch min-w-touch touch-manipulation",
    style: { WebkitTapHighlightColor: 'transparent' },
};

/**
 * Gesture detection utilities
 */
export interface SwipeGesture {
    direction: 'left' | 'right' | 'up' | 'down';
    distance: number;
    duration: number;
}

export function useSwipeGesture(
    onSwipe: (gesture: SwipeGesture) => void,
    threshold: number = 50
) {
    const [startTouch, setStartTouch] = React.useState<{ x: number; y: number; time: number } | null>(null);

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        setStartTouch({
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        });
    }, []);

    const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
        if (!startTouch) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startTouch.x;
        const deltaY = touch.clientY - startTouch.y;
        const duration = Date.now() - startTouch.time;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > threshold) {
            let direction: SwipeGesture['direction'];

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            onSwipe({ direction, distance, duration });
        }

        setStartTouch(null);
    }, [startTouch, onSwipe, threshold]);

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
    };
}

// Import React for hooks
import React from 'react';