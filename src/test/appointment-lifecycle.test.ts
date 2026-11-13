import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAppointmentLifecycle } from '@/portal/lib/utils/date-time';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-13T11:29:00Z')); });
afterEach(() => vi.useRealTimers());
describe('Unattended appointment lifecycle', () => {
  it('collects elapsed unconfirmed appointments as cancelled, not completed', () => {
    expect(getAppointmentLifecycle('2026-11-06', '07:30 PM', 'upcoming')).toBe('cancelled');
  });
  it('collects no-shows as cancelled', () => {
    expect(getAppointmentLifecycle('2026-11-06', '07:30 PM', 'no-show')).toBe('cancelled');
  });
  it('keeps explicitly completed visits completed', () => {
    expect(getAppointmentLifecycle('2026-11-06', '07:30 PM', 'completed')).toBe('completed');
  });
  it('keeps future booked visits upcoming', () => {
    expect(getAppointmentLifecycle('2026-11-14', '07:30 PM', 'upcoming')).toBe('upcoming');
  });
});