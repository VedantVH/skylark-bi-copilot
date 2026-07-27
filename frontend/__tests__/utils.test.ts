import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatRupee,
  formatRupeeCompact,
  clampPercent,
  portfolioShare,
  healthLabel,
} from "../lib/utils";

describe("formatRupee", () => {
  it("formats values ≥ 1 Crore correctly", () => {
    assert.strictEqual(formatRupee(10_000_000), "₹1.00Cr");
    assert.strictEqual(formatRupee(25_500_000), "₹2.55Cr");
  });

  it("formats values ≥ 1 Lakh correctly", () => {
    assert.strictEqual(formatRupee(500_000), "₹5.0L");
    assert.strictEqual(formatRupee(100_000), "₹1.0L");
  });

  it("formats small values as raw rupees", () => {
    assert.strictEqual(formatRupee(50_000), "₹50000");
    assert.strictEqual(formatRupee(0), "₹0");
  });

  it("defaults to 0 when called with no argument", () => {
    assert.strictEqual(formatRupee(), "₹0");
  });
});

describe("formatRupeeCompact", () => {
  it("uses whole-number Cr suffix for chart ticks", () => {
    assert.strictEqual(formatRupeeCompact(15_000_000), "₹2Cr");
  });
});

describe("clampPercent", () => {
  it("clamps above 100 to 100", () => {
    assert.strictEqual(clampPercent(150), 100);
  });
  it("clamps below 0 to 0", () => {
    assert.strictEqual(clampPercent(-10), 0);
  });
  it("leaves values in range unchanged", () => {
    assert.strictEqual(clampPercent(55), 55);
  });
});

describe("portfolioShare", () => {
  it("returns correct share percentage", () => {
    assert.strictEqual(Math.round(portfolioShare(500_000, 1_000_000)), 50);
  });

  it("returns 0 when total pipeline is 0 (avoids division by zero)", () => {
    assert.strictEqual(portfolioShare(100_000, 0), 0);
  });

  it("clamps result to 100 when client > total (data anomaly)", () => {
    assert.strictEqual(portfolioShare(2_000_000, 1_000_000), 100);
  });
});

describe("healthLabel", () => {
  it("returns 'Pipeline healthy' for scores ≥ 75", () => {
    assert.strictEqual(healthLabel(75), "Pipeline healthy");
    assert.strictEqual(healthLabel(100), "Pipeline healthy");
  });

  it("returns 'Needs attention' for scores 50–74", () => {
    assert.strictEqual(healthLabel(50), "Needs attention");
    assert.strictEqual(healthLabel(74), "Needs attention");
  });

  it("returns 'Action required' for scores below 50", () => {
    assert.strictEqual(healthLabel(49), "Action required");
    assert.strictEqual(healthLabel(0), "Action required");
  });
});
