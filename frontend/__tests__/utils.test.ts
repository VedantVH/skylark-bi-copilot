import { describe, it, expect } from "vitest";
import {
  formatRupee,
  formatRupeeCompact,
  clampPercent,
  portfolioShare,
  healthLabel,
} from "../lib/utils";

describe("formatRupee", () => {
  it("formats values ≥ 1 Crore correctly", () => {
    expect(formatRupee(10_000_000)).toBe("₹1.00Cr");
    expect(formatRupee(25_500_000)).toBe("₹2.55Cr");
  });

  it("formats values ≥ 1 Lakh correctly", () => {
    expect(formatRupee(500_000)).toBe("₹5.0L");
    expect(formatRupee(100_000)).toBe("₹1.0L");
  });

  it("formats small values as raw rupees", () => {
    expect(formatRupee(50_000)).toBe("₹50000");
    expect(formatRupee(0)).toBe("₹0");
  });

  it("defaults to 0 when called with no argument", () => {
    expect(formatRupee()).toBe("₹0");
  });
});

describe("formatRupeeCompact", () => {
  it("uses whole-number Cr suffix for chart ticks", () => {
    expect(formatRupeeCompact(15_000_000)).toBe("₹2Cr"); // 1.5 → rounds to 2
  });
});

describe("clampPercent", () => {
  it("clamps above 100 to 100", () => {
    expect(clampPercent(150)).toBe(100);
  });
  it("clamps below 0 to 0", () => {
    expect(clampPercent(-10)).toBe(0);
  });
  it("leaves values in range unchanged", () => {
    expect(clampPercent(55)).toBe(55);
  });
});

describe("portfolioShare", () => {
  it("returns correct share percentage", () => {
    expect(portfolioShare(500_000, 1_000_000)).toBeCloseTo(50);
  });

  it("returns 0 when total pipeline is 0 (avoids division by zero)", () => {
    expect(portfolioShare(100_000, 0)).toBe(0);
  });

  it("clamps result to 100 when client > total (data anomaly)", () => {
    expect(portfolioShare(2_000_000, 1_000_000)).toBe(100);
  });
});

describe("healthLabel", () => {
  it("returns 'Pipeline healthy' for scores ≥ 75", () => {
    expect(healthLabel(75)).toBe("Pipeline healthy");
    expect(healthLabel(100)).toBe("Pipeline healthy");
  });

  it("returns 'Needs attention' for scores 50–74", () => {
    expect(healthLabel(50)).toBe("Needs attention");
    expect(healthLabel(74)).toBe("Needs attention");
  });

  it("returns 'Action required' for scores below 50", () => {
    expect(healthLabel(49)).toBe("Action required");
    expect(healthLabel(0)).toBe("Action required");
  });
});
