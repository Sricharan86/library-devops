const { calculateFine } = require('../src/fine');

describe('calculateFine', () => {
  test('no fine when returned on due date', () => {
    expect(calculateFine('2025-01-10', '2025-01-10')).toBe(0);
  });
  test('no fine when returned early', () => {
    expect(calculateFine('2025-01-10', '2025-01-05')).toBe(0);
  });
  test('Rs. 2 per late day', () => {
    expect(calculateFine('2025-01-10', '2025-01-15')).toBe(10);
  });
});
