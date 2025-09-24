import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  useOfflineDetection,
  OfflineBanner,
  OfflineIndicator,
} from "../OfflineDetector";

// Test component to use the hook
const TestComponent = () => {
  const { isOffline, wasOffline } = useOfflineDetection();
  return (
    <div>
      <span data-testid="is-offline">{isOffline.toString()}</span>
      <span data-testid="was-offline">{wasOffline.toString()}</span>
    </div>
  );
};

// Mock navigator.onLine
const mockNavigatorOnLine = (value: boolean) => {
  Object.defineProperty(navigator, "onLine", {
    writable: true,
    value,
  });
};

// Mock window events
const mockWindowEvents = () => {
  const events: { [key: string]: EventListener[] } = {};

  window.addEventListener = jest.fn(
    (event: string, callback: EventListener) => {
      if (!events[event]) events[event] = [];
      events[event].push(callback);
    }
  );

  window.removeEventListener = jest.fn(
    (event: string, callback: EventListener) => {
      if (events[event]) {
        events[event] = events[event].filter((cb) => cb !== callback);
      }
    }
  );

  const dispatchEvent = (event: string) => {
    if (events[event]) {
      events[event].forEach((callback) => callback(new Event(event)));
    }
  };

  return { dispatchEvent, events };
};

describe("useOfflineDetection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigatorOnLine(true);
  });

  it("initializes with online state", () => {
    mockNavigatorOnLine(true);
    render(<TestComponent />);

    expect(screen.getByTestId("is-offline")).toHaveTextContent("false");
    expect(screen.getByTestId("was-offline")).toHaveTextContent("false");
  });

  it("initializes with offline state", () => {
    mockNavigatorOnLine(false);
    render(<TestComponent />);

    expect(screen.getByTestId("is-offline")).toHaveTextContent("true");
    expect(screen.getByTestId("was-offline")).toHaveTextContent("false");
  });

  it("updates state when going offline", () => {
    const { dispatchEvent } = mockWindowEvents();
    mockNavigatorOnLine(true);

    render(<TestComponent />);

    expect(screen.getByTestId("is-offline")).toHaveTextContent("false");

    act(() => {
      mockNavigatorOnLine(false);
      dispatchEvent("offline");
    });

    expect(screen.getByTestId("is-offline")).toHaveTextContent("true");
  });

  it("updates state when coming back online", () => {
    const { dispatchEvent } = mockWindowEvents();
    mockNavigatorOnLine(false);

    render(<TestComponent />);

    expect(screen.getByTestId("is-offline")).toHaveTextContent("true");

    act(() => {
      mockNavigatorOnLine(true);
      dispatchEvent("online");
    });

    expect(screen.getByTestId("is-offline")).toHaveTextContent("false");
    expect(screen.getByTestId("was-offline")).toHaveTextContent("true");
  });
});

describe("OfflineBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigatorOnLine(true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not render when online", () => {
    mockNavigatorOnLine(true);
    render(<OfflineBanner />);

    expect(
      screen.queryByText(/You are currently offline/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Connection restored/)).not.toBeInTheDocument();
  });

  it("renders offline banner when offline", () => {
    mockNavigatorOnLine(false);
    render(<OfflineBanner />);

    expect(screen.getByText(/You are currently offline/)).toBeInTheDocument();
  });

  it("shows reconnected banner when coming back online", async () => {
    const { dispatchEvent } = mockWindowEvents();
    mockNavigatorOnLine(false);

    const { rerender } = render(<OfflineBanner />);

    // Initially offline
    expect(screen.getByText(/You are currently offline/)).toBeInTheDocument();

    // Go back online
    act(() => {
      mockNavigatorOnLine(true);
      dispatchEvent("online");
    });

    rerender(<OfflineBanner />);

    expect(screen.getByText(/Connection restored/)).toBeInTheDocument();

    // Should disappear after timeout
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    rerender(<OfflineBanner />);

    expect(screen.queryByText(/Connection restored/)).not.toBeInTheDocument();
  });
});

describe("OfflineIndicator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigatorOnLine(true);
  });

  it("does not render when online", () => {
    mockNavigatorOnLine(true);
    render(<OfflineIndicator />);

    expect(screen.queryByText("Offline")).not.toBeInTheDocument();
  });

  it("renders when offline", () => {
    mockNavigatorOnLine(false);
    render(<OfflineIndicator />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    mockNavigatorOnLine(false);
    render(<OfflineIndicator className="custom-class" />);

    const indicator = screen.getByText("Offline").parentElement;
    expect(indicator).toHaveClass("custom-class");
  });
});
