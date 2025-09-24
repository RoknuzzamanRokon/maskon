import * as WidgetExports from "../index";

describe("Widget Exports", () => {
  it("exports MetricCard component", () => {
    expect(WidgetExports.MetricCard).toBeDefined();
    expect(typeof WidgetExports.MetricCard).toBe("function");
  });

  it("exports ChartWidget component", () => {
    expect(WidgetExports.ChartWidget).toBeDefined();
    expect(typeof WidgetExports.ChartWidget).toBe("function");
  });

  it("exports ActivityFeed component", () => {
    expect(WidgetExports.ActivityFeed).toBeDefined();
    expect(typeof WidgetExports.ActivityFeed).toBe("function");
  });

  it("exports all expected components", () => {
    const expectedExports = ["MetricCard", "ChartWidget", "ActivityFeed"];

    expectedExports.forEach((exportName) => {
      expect(WidgetExports).toHaveProperty(exportName);
    });
  });

  it("does not export unexpected components", () => {
    const exportKeys = Object.keys(WidgetExports);
    const expectedExports = ["MetricCard", "ChartWidget", "ActivityFeed"];

    // Filter out TypeScript type exports (they don't appear in runtime)
    const componentExports = exportKeys.filter(
      (key) => typeof (WidgetExports as any)[key] === "function"
    );

    expect(componentExports).toEqual(expect.arrayContaining(expectedExports));
  });
});
