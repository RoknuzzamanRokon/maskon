import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  useScreenSize,
  useTouchDevice,
  useResponsiveValue,
  useSwipeGesture,
  responsiveClasses,
  breakpoints,
} from "../../../../app/admin/dashboard/utils/responsive";

// Mock window object for testing
const mockWindow = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock touch support
const mockTouchSupport = (hasTouch: boolean) => {
  if (hasTouch) {
    Object.defineProperty(window, "ontouchstart", {
      writable: true,
      configurable: true,
      value: () => {},
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      writable: true,
      configurable: true,
      value: 1,
    });
  } else {
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, "maxTouchPoints", {
      writable: true,
      configurable: true,
      value: 0,
    });
  }
};

describe("Responsive Utilities", () => {
  beforeEach(() => {
    // Reset window size to desktop default
    mockWindow(1024, 768);
    mockTouchSupport(false);
  });

  describe("useScreenSize", () => {
    it("should return correct screen size and device type for desktop", () => {
      mockWindow(1200, 800);

      const { result } = renderHook(() => useScreenSize());

      expect(result.current.width).toBe(1200);
      expect(result.current.height).toBe(800);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it("should return correct device type for mobile", () => {
      mockWindow(375, 667);

      const { result } = renderHook(() => useScreenSize());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should return correct device type for tablet", () => {
      mockWindow(768, 1024);

      const { result } = renderHook(() => useScreenSize());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should update on window resize", () => {
      const { result } = renderHook(() => useScreenSize());

      expect(result.current.width).toBe(1024);

      act(() => {
        mockWindow(375, 667);
        fireEvent(window, new Event("resize"));
      });

      expect(result.current.width).toBe(375);
      expect(result.current.isMobile).toBe(true);
    });
  });

  describe("useTouchDevice", () => {
    it("should detect touch device correctly", () => {
      mockTouchSupport(true);

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toBe(true);
    });

    it("should detect non-touch device correctly", () => {
      mockTouchSupport(false);

      const { result } = renderHook(() => useTouchDevice());

      expect(result.current).toBe(false);
    });
  });

  describe("useResponsiveValue", () => {
    it("should return correct value for current screen size", () => {
      mockWindow(1200, 800); // Desktop

      const values = {
        sm: "small",
        md: "medium",
        lg: "large",
      };

      const { result } = renderHook(() =>
        useResponsiveValue(values, "default")
      );

      expect(result.current).toBe("large");
    });

    it("should return default value when no breakpoint matches", () => {
      mockWindow(400, 600); // Small mobile

      const values = {
        lg: "large",
        xl: "extra-large",
      };

      const { result } = renderHook(() =>
        useResponsiveValue(values, "default")
      );

      expect(result.current).toBe("default");
    });

    it("should return closest smaller breakpoint value", () => {
      mockWindow(800, 600); // Between md and lg

      const values = {
        sm: "small",
        md: "medium",
        xl: "extra-large",
      };

      const { result } = renderHook(() =>
        useResponsiveValue(values, "default")
      );

      expect(result.current).toBe("medium");
    });
  });

  describe("responsiveClasses", () => {
    it("should generate correct responsive class names", () => {
      const classes = {
        base: "text-base",
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
      };

      const result = responsiveClasses(classes);

      expect(result).toBe("text-base sm:text-sm md:text-md lg:text-lg");
    });

    it("should handle missing base class", () => {
      const classes = {
        sm: "text-sm",
        lg: "text-lg",
      };

      const result = responsiveClasses(classes);

      expect(result).toBe("sm:text-sm lg:text-lg");
    });

    it("should handle empty classes object", () => {
      const result = responsiveClasses({});

      expect(result).toBe("");
    });
  });

  describe("useSwipeGesture", () => {
    it("should detect left swipe gesture", () => {
      const onSwipe = jest.fn();
      const { result } = renderHook(() => useSwipeGesture(onSwipe, 50));

      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
      } as React.TouchEvent;

      const touchEnd = {
        changedTouches: [{ clientX: 20, clientY: 100 }],
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipe).toHaveBeenCalledWith({
        direction: "left",
        distance: 80,
        duration: expect.any(Number),
      });
    });

    it("should detect right swipe gesture", () => {
      const onSwipe = jest.fn();
      const { result } = renderHook(() => useSwipeGesture(onSwipe, 50));

      const touchStart = {
        touches: [{ clientX: 20, clientY: 100 }],
      } as React.TouchEvent;

      const touchEnd = {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipe).toHaveBeenCalledWith({
        direction: "right",
        distance: 80,
        duration: expect.any(Number),
      });
    });

    it("should not trigger swipe for small movements", () => {
      const onSwipe = jest.fn();
      const { result } = renderHook(() => useSwipeGesture(onSwipe, 50));

      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
      } as React.TouchEvent;

      const touchEnd = {
        changedTouches: [{ clientX: 120, clientY: 100 }],
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("should detect vertical swipe gestures", () => {
      const onSwipe = jest.fn();
      const { result } = renderHook(() => useSwipeGesture(onSwipe, 50));

      const touchStart = {
        touches: [{ clientX: 100, clientY: 100 }],
      } as React.TouchEvent;

      const touchEnd = {
        changedTouches: [{ clientX: 100, clientY: 20 }],
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipe).toHaveBeenCalledWith({
        direction: "up",
        distance: 80,
        duration: expect.any(Number),
      });
    });
  });

  describe("breakpoints", () => {
    it("should have correct breakpoint values", () => {
      expect(breakpoints.xs).toBe(475);
      expect(breakpoints.sm).toBe(640);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(1024);
      expect(breakpoints.xl).toBe(1280);
      expect(breakpoints["2xl"]).toBe(1536);
    });
  });
});
