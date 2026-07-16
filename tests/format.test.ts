import { expect, test } from 'vitest';
import {
  formatBytes,
  formatNumber,
  formatPercent,
  formatDateTime,
  formatOrdinal,
  formatSI,
} from '~/format';

test('formatBytes', () => {
  // check the base cases
  expect(formatBytes('en-GB', 0)).toBe('0 B');
  expect(formatBytes('en-GB', -1)).toBe('-1 B');
  expect(formatBytes('en-GB', 1)).toBe('1 B');
  expect(formatBytes('en-GB', NaN)).toBe('NaN');

  // check the si versions, kilo, mega, giga, powers of 10
  expect(
    formatBytes('en-GB', 1000 ** 1, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    }),
  ).toBe('1.00 KB');
  expect(
    formatBytes('en-GB', 1000 ** 2, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    }),
  ).toBe('1.00 MB');
  expect(
    formatBytes('en-GB', 1000 ** 3, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    }),
  ).toBe('1.00 GB');

  // check the non-si versions, kibi, mibi, gigi, powers of 2
  expect(
    formatBytes('en-GB', 1024 ** 1, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      si: false,
    }),
  ).toBe('1.00 KiB');
  expect(
    formatBytes('en-GB', 1024 ** 2, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      si: false,
    }),
  ).toBe('1.00 MiB');
  expect(
    formatBytes('en-GB', 1024 ** 3, {
      number: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      si: false,
    }),
  ).toBe('1.00 GiB');

  expect(formatBytes('en-GB', 950 * 1024 * 1024 * 1024, { si: false })).toBe(
    '950 GiB',
  );

  // make sure we're not messing up our conversion as well
  expect(
    formatBytes('en-GB', 1073741824, {
      number: { minimumFractionDigits: 9, maximumFractionDigits: 9 },
    }),
  ).toBe('1.073741824 GB');
  expect(
    formatBytes('en-GB', 1073741824, {
      number: { minimumFractionDigits: 9, maximumFractionDigits: 9 },
      si: false,
    }),
  ).toBe('1.000000000 GiB');
  expect(
    formatBytes('en-GB', 1125899906842624, {
      number: { minimumFractionDigits: 15, maximumFractionDigits: 15 },
    }),
  ).toBe('1.125899906842624 PB');
  expect(
    formatBytes('en-GB', 1125899906842624, {
      number: { minimumFractionDigits: 15, maximumFractionDigits: 15 },
      si: false,
    }),
  ).toBe('1.000000000000000 PiB');
});

test('formatDateTime', () => {
  const dt = new Date(Date.UTC(2023, 6, 11, 13, 34, 10));
  const options = { timeZone: 'UTC' };
  expect(formatDateTime('en-GB', dt, options)).toBe('11/07/2023, 13:34:10');
  expect(formatDateTime('de-DE', dt, options)).toBe('11.07.2023, 13:34:10');
  expect(
    formatDateTime('en-US', new Date(Date.UTC(1970, 0, 1, 0, 0, 0)), {
      format: 'iso8601',
      timeZone: 'UTC',
    }),
  ).toBe('1970-01-01 00:00:00');
});

test('formatNumber', () => {
  expect(formatNumber('en-GB', 1)).toBe('1');
  expect(formatNumber('en-GB', 1000)).toBe('1,000');
  expect(formatNumber('de-DE', 1000)).toBe('1.000');
  expect(formatNumber('en-GB', 1.23)).toBe('1.23');
});

test('formatOrdinal', () => {
  // base cases
  expect(formatOrdinal('en-GB', 0)).toBe('0th');
  expect(formatOrdinal('en-GB', 1)).toBe('1st');
  expect(formatOrdinal('en-GB', 2)).toBe('2nd');
  expect(formatOrdinal('en-GB', 3)).toBe('3rd');

  // eleventh, twelfth, and thirteenth are ths
  expect(formatOrdinal('en-GB', 11)).toBe('11th');
  expect(formatOrdinal('en-GB', 111)).toBe('111th');
  expect(formatOrdinal('en-GB', 12)).toBe('12th');
  expect(formatOrdinal('en-GB', 112)).toBe('112th');
  expect(formatOrdinal('en-GB', 13)).toBe('13th');
  expect(formatOrdinal('en-GB', 113)).toBe('113th');

  // other numbers ending in 1/2/3 are st/nd/rd
  expect(formatOrdinal('en-GB', 22)).toBe('22nd');
  expect(formatOrdinal('en-GB', 122)).toBe('122nd');
  expect(formatOrdinal('en-GB', 33)).toBe('33rd');
  expect(formatOrdinal('en-GB', 133)).toBe('133rd');
});

test('formatPercent', () => {
  expect(formatPercent('en-GB', 0.25)).toBe('25%');

  // default for dp is 0, so rounding
  expect(formatPercent('en-GB', 0.254)).toBe('25%');
  expect(formatPercent('en-GB', 0.255)).toBe('26%');

  expect(formatPercent('en-GB', 0.45, 1)).toBe('45.0%');
  expect(formatPercent('en-GB', 0.455, 1)).toBe('45.5%');

  expect(formatPercent('en-GB', 10.01)).toBe('1,001%');
});

test('formatSI', () => {
  expect(formatSI('en-GB', 500)).toBe('500');
  expect(formatSI('en-GB', 5 * Math.pow(10, -9), 'V')).toBe('5 nV');
  expect(formatSI('en-GB', 5 * Math.pow(10, -6), 'V')).toBe('5 uV');
  expect(formatSI('en-GB', 5 * Math.pow(10, -3), 'V')).toBe('5 mV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 0), 'V')).toBe('5 V');
  expect(formatSI('en-GB', 5 * Math.pow(10, 3), 'V')).toBe('5 kV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 6), 'V')).toBe('5 MV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 9), 'V')).toBe('5 GV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 12), 'V')).toBe('5 TV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 15), 'V')).toBe('5 PV');
  expect(formatSI('en-GB', 5 * Math.pow(10, 18), 'V')).toBe('5,000 PV');

  expect(formatSI('en-GB', 0.005, 'amps', { prefix: 'name' })).toBe(
    '5 milliamps',
  );

  expect(formatSI('en-GB', 0.5, 'g', { minimumExponent: 0 })).toBe('0.5 g');
  expect(formatSI('en-GB', -0.1, 'g', { minimumExponent: 0 })).toBe('-0.1 g');
  expect(formatSI('en-GB', 0.12, 'g', { minimumExponent: 0 })).toBe('0.12 g');
  expect(formatSI('en-GB', 0.123, 'g', { minimumExponent: 0 })).toBe('0.123 g');
  expect(formatSI('en-GB', 0.05, 'g', { minimumExponent: -1 })).toBe('50 mg');

  // special cases
  expect(formatSI('en-GB', 0, 'g')).toBe('0 g');
  expect(
    formatSI('en-GB', 0, 'g', { number: { minimumFractionDigits: 2 } }),
  ).toBe('0.00 g');
  expect(formatSI('en-GB', NaN)).toBe('NaN');
  expect(formatSI('en-GB', Infinity)).toBe('∞');
  expect(formatSI('en-GB', -Infinity)).toBe('-∞');
  expect(formatSI('en-GB', Infinity, 'V')).toBe('∞ V');
});
