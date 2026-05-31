/**
 * 规则 verdict 单元测试（node scripts/test-compute-verdict.mjs）
 */
import assert from 'node:assert/strict';

function computeVerdict(price, record) {
  const fairMid = (record.fairLow + record.fairHigh) / 2;
  let verdict = 'unknown';
  let deviationPct = null;
  if (price > 0 && fairMid > 0) {
    deviationPct = ((price - fairMid) / fairMid) * 100;
    if (record.expensiveAbove != null && price > record.expensiveAbove) {
      verdict = 'extreme';
    } else if (price < record.fairLow) {
      verdict = 'cheap';
    } else if (price > record.fairHigh) {
      verdict = 'rich';
    } else {
      verdict = 'fair';
    }
  }
  return { verdict, deviationPct };
}

const base = {
  fairLow: 65,
  fairHigh: 85,
  expensiveAbove: 100,
};

assert.equal(computeVerdict(60, base).verdict, 'cheap');
assert.equal(computeVerdict(75, base).verdict, 'fair');
assert.equal(computeVerdict(90, base).verdict, 'rich');
assert.equal(computeVerdict(110, base).verdict, 'extreme');
assert.equal(computeVerdict(0, base).verdict, 'unknown');

console.log('[test-compute-verdict] all passed');
