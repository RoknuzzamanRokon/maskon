import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SystemStatusCard from "../SystemStatusCard";
import { CheckCircle } from "lucide-react";

describe("SystemStatusCard", () => {
  const defaultProps = {
    title: "Test Metric",
    value: "100",
    icon: <CheckCircle data-testid="test-icon" />,
    color: "text-green-600",
    description: "Test description",
  };

  it("renders basic card information", () => {
    render(<SystemStatusCard {...defaultProps} />);

    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies correct color class", () => {
    render(<SystemStatusCard {...defaultProps} />);

    const iconContainer = screen.getByTestId("test-icon").parentElement;
    expect(iconContainer).toHaveClass("text-green-600");
  });

  it("renders progress bar when progress prop is provided", () => {
    render(<SystemStatusCard {...defaultProps} progress={75} />);

    expect(screen.getByText("Usage")).toBeInTheDocument();
    expect(screen.getByText("75.0%")).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar", { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it("does not render progress bar when progress prop is not provided", () => {
    render(<SystemStatusCard {...defaultProps} />);

    expect(screen.queryByText("Usage")).not.toBeInTheDocument();
  });

  it("shows correct progress bar color for high usage", () => {
    render(<SystemStatusCard {...defaultProps} progress={85} />);

    const progressBar = document.querySelector(".bg-red-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("shows correct progress bar color for medium usage", () => {
    render(<SystemStatusCard {...defaultProps} progress={65} />);

    const progressBar = document.querySelector(".bg-yellow-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("shows correct progress bar color for low usage", () => {
    render(<SystemStatusCard {...defaultProps} progress={45} />);

    const progressBar = document.querySelector(".bg-green-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("handles progress value of 0", () => {
    render(<SystemStatusCard {...defaultProps} progress={0} />);

    expect(screen.getByText("0.0%")).toBeInTheDocument();
    const progressBar = document.querySelector(".bg-green-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("handles progress value of 100", () => {
    render(<SystemStatusCard {...defaultProps} progress={100} />);

    expect(screen.getByText("100.0%")).toBeInTheDocument();
    const progressBar = document.querySelector(".bg-red-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("caps progress bar width at 100%", () => {
    render(<SystemStatusCard {...defaultProps} progress={150} />);

    expect(screen.getByText("150.0%")).toBeInTheDocument();
    // Progress bar should still be capped at 100% width
    const progressBar = document.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("applies hover effect classes", () => {
    render(<SystemStatusCard {...defaultProps} />);

    const card = screen.getByText("Test Metric").closest("div");
    expect(card).toHaveClass("hover:shadow-lg");
    expect(card).toHaveClass("transition-shadow");
  });

  it("renders with dark mode classes", () => {
    render(<SystemStatusCard {...defaultProps} />);

    const card = screen.getByText("Test Metric").closest("div");
    expect(card).toHaveClass("dark:bg-gray-800");
    expect(card).toHaveClass("dark:border-gray-700");
  });
});
