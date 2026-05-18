import type { MarketStatus } from './types.js';

function getTimeParts(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  return {
    weekday: parts.find((part) => part.type === 'weekday')?.value ?? 'Sun',
    hour: Number(parts.find((part) => part.type === 'hour')?.value ?? 0),
    minute: Number(parts.find((part) => part.type === 'minute')?.value ?? 0),
  };
}

function isWeekday(weekday: string) {
  return !['Sat', 'Sun'].includes(weekday);
}

function minutesSinceMidnight(hour: number, minute: number) {
  return hour * 60 + minute;
}

function sessionFor(timeZone: string, open: number, close: number) {
  const parts = getTimeParts(timeZone);
  const minutes = minutesSinceMidnight(parts.hour, parts.minute);

  if (!isWeekday(parts.weekday)) {
    return 'CLOSED' as const;
  }

  if (minutes >= open && minutes <= close) {
    return 'OPEN' as const;
  }

  if (minutes < open && minutes >= open - 150) {
    return 'PREMARKET' as const;
  }

  if (minutes > close && minutes <= close + 240) {
    return 'AFTER_HOURS' as const;
  }

  return 'CLOSED' as const;
}

export function getMarketStatuses(): MarketStatus[] {
  const nyseSession = sessionFor('America/New_York', 9 * 60 + 30, 16 * 60);
  const kospiSession = sessionFor('Asia/Seoul', 9 * 60, 15 * 60 + 30);

  return [
    { code: 'NYSE', session: nyseSession, timezone: 'America/New_York', label: 'NYSE' },
    { code: 'NASDAQ', session: nyseSession, timezone: 'America/New_York', label: 'NASDAQ' },
    { code: 'KOSPI', session: kospiSession, timezone: 'Asia/Seoul', label: 'KOSPI' },
    { code: 'KOSDAQ', session: kospiSession, timezone: 'Asia/Seoul', label: 'KOSDAQ' },
  ];
}
