import { calculateStraightLineDepreciation, calculateCurrentValue } from '@/utils/depreciation';

describe('Straight-Line Depreciation', () => {
  it('calculates depreciation for exactly 1 year', () => {
    const value = calculateStraightLineDepreciation(
      10000,
      1000,
      5,
      new Date('2023-01-01'),
      new Date('2024-01-01')
    );
    expect(value).toBe(8200);
  });

  it('never goes below salvage value', () => {
    const value = calculateStraightLineDepreciation(
      10000,
      1000,
      5,
      new Date('2020-01-01'),
      new Date('2030-01-01')
    );
    expect(value).toBe(1000);
  });

  it('returns purchase price for future dates', () => {
    const value = calculateStraightLineDepreciation(
      10000,
      1000,
      5,
      new Date('2025-01-01'),
      new Date('2024-01-01')
    );
    expect(value).toBe(10000);
  });

  it('calculates currentValue using straight-line method', () => {
    const value = calculateCurrentValue({
      purchasePrice: 50000,
      purchaseDate: new Date('2023-01-01'),
      usefulLife: 5,
      salvageValue: 5000,
      depreciationMethod: 'straight-line'
    });
    expect(value).toBeGreaterThan(5000);
    expect(value).toBeLessThan(50000);
  });
});
