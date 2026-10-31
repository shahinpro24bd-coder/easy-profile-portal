// @ts-nocheck -- legacy portal code ported from the original Next.js app

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from '@/portal/shims/next-link';
import { Bell, CalendarDays, Clock3, Phone, X, AlertCircle, Clock } from 'lucide-react';
import { Appointment } from '@/portal/shared';
import { apiFetch } from '@/portal/lib/api/client';
import { formatDhakaDisplayDate, getDhakaDateString, parseAppointmentDateTime } from '@/portal/lib/utils/date-time';

const REFRESH_MS = 60_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatElapsed(ms: number): string {
  const totalMinutes = Math.floor(ms / (60 * 1000));
  if (totalMinutes < 60) return `${Math.max(1, totalMinutes)}m ago`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
}

interface AppointmentExpiryInfo {
  timestamp: number;
  diff: number;
  isExpired: boolean;
  isExpiredOver24h: boolean;
  isRecentExpired: boolean;
  isTodayOrSoon: boolean;
  elapsedLabel: string | null;
}

function getExpiryInfo(appointment: Appointment, todayStr: string): AppointmentExpiryInfo {
  const timestamp = parseAppointmentDateTime(appointment.appointmentDate, appointment.appointmentTime);
  const now = Date.now();
  const diff = timestamp - now;

  const isExpired = diff < 0;
  const isExpiredOver24h = isExpired && diff < -ONE_DAY_MS;
  const isRecentExpired = isExpired && !isExpiredOver24h;
  const isTodayOrSoon = !isExpired && (diff <= ONE_DAY_MS || appointment.appointmentDate === todayStr);

  return {
    timestamp,
    diff,
    isExpired,
    isExpiredOver24h,
    isRecentExpired,
    isTodayOrSoon,
    elapsedLabel: isRecentExpired ? formatElapsed(Math.abs(diff)) : null
  };
}

function sortAppointments(a: Appointment, b: Appointment, todayStr: string): number {
  const infoA = getExpiryInfo(a, todayStr);
  const infoB = getExpiryInfo(b, todayStr);

  if (infoA.isRecentExpired && !infoB.isRecentExpired) return -1;
  if (!infoA.isRecentExpired && infoB.isRecentExpired) return 1;

  if (infoA.isRecentExpired && infoB.isRecentExpired) {
    return infoB.timestamp - infoA.timestamp;
  }

  return infoA.timestamp - infoB.timestamp;
}

export function UpcomingAppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const today = getDhakaDateString();

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch<Appointment[]>('/appointments?status=upcoming&includeRecentExpired=true');
      if (response.success && response.data) {
        const valid = response.data.filter((appointment) => {
          if (appointment.status === 'cancelled') return false;
          const info = getExpiryInfo(appointment, today);

          return !info.isExpiredOver24h;
        });

        valid.sort((a, b) => sortAppointments(a, b, today));
        setAppointments(valid);
      } else {
        setAppointments([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadAppointments();
    const interval = window.setInterval(loadAppointments, REFRESH_MS);
    const handleFocus = () => loadAppointments();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAppointments]);

  const expiredCount = useMemo(
    () => appointments.filter((appointment) => getExpiryInfo(appointment, today).isRecentExpired).length,
    [appointments, today]
  );

  const soonCount = useMemo(
    () => appointments.filter((appointment) => getExpiryInfo(appointment, today).isTodayOrSoon).length,
    [appointments, today]
  );

  const totalAlertCount = expiredCount + soonCount;

  return (
    <div className="fixed right-0 top-[38%] z-30 flex items-start gap-2" aria-live="polite">
      {isOpen && (
        <section className="mr-2 w-[min(23rem,calc(100vw-4.5rem))] max-h-[min(75vh,36rem)] overflow-hidden rounded-2xl border border-white/15 bg-[#0e0e0e]/95 shadow-2xl backdrop-blur-xl flex flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Upcoming & Recent Schedule</h2>
                {expiredCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">
                    {expiredCount} Expired
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400">Expired visits stay 24h • Auto refreshes</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Close upcoming appointments"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="overflow-y-auto p-2.5 space-y-2.5 flex-1">
            {isLoading && appointments.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-gray-400">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <div className="px-3 py-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400">No upcoming or recent appointments.</p>
              </div>
            ) : (
              appointments.map((appointment) => {
                const info = getExpiryInfo(appointment, today);

                if (info.isRecentExpired) {

                  return (
                    <article
                      key={appointment.id || appointment._id}
                      className="rounded-xl border border-red-500/70 bg-gradient-to-br from-red-950/60 via-black/70 to-red-950/40 p-3 shadow-glow-red-sm space-y-2 ring-1 ring-red-500/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/patients/${appointment.patientNumber}`}
                            className="group block"
                            onClick={() => setIsOpen(false)}
                          >
                            <h3 className="min-w-0 truncate text-xs font-black text-red-200 group-hover:text-white transition-colors">
                              {appointment.patientName}
                            </h3>
                            <span className="font-mono text-[10px] text-red-400 font-bold">
                              #{appointment.patientNumber}
                            </span>
                          </Link>
                        </div>
                        <span className="shrink-0 rounded-full bg-red-600/30 border border-red-500/60 px-2 py-0.5 text-[9px] font-black text-red-300 uppercase tracking-wider flex items-center gap-1 shadow-glow-red-sm animate-pulse">
                          <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                          Expired ({info.elapsedLabel})
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-red-200/90 bg-red-950/30 rounded-lg p-2 border border-red-900/40">
                        <p className="flex items-center gap-2 font-medium">
                          <CalendarDays className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>{formatDhakaDisplayDate(appointment.appointmentDate)}</span>
                        </p>
                        <p className="flex items-center gap-2 font-mono font-bold text-red-300">
                          <Clock3 className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>{appointment.appointmentTime}</span>
                        </p>
                        {appointment.category && (
                          <p className="truncate text-red-200/80 text-[10px]">{appointment.category}</p>
                        )}
                        {appointment.notes && (
                          <p className="line-clamp-2 text-red-300/70 text-[10px] italic">&ldquo;{appointment.notes}&rdquo;</p>
                        )}
                        {appointment.patientPhone && (
                          <p className="flex items-center gap-2 text-red-300/80 font-mono text-[10px]">
                            <Phone className="h-3 w-3" />
                            {appointment.patientPhone}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                }

                if (info.isTodayOrSoon) {

                  return (
                    <article
                      key={appointment.id || appointment._id}
                      className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-black/60 to-amber-950/20 p-3 space-y-2 ring-1 ring-amber-500/25"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/patients/${appointment.patientNumber}`}
                            className="group block"
                            onClick={() => setIsOpen(false)}
                          >
                            <h3 className="min-w-0 truncate text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                              {appointment.patientName}
                            </h3>
                            <span className="font-mono text-[10px] text-amber-400 font-bold">
                              #{appointment.patientNumber}
                            </span>
                          </Link>
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                          {appointment.appointmentDate === today ? 'Today' : 'Soon'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-300 bg-black/40 rounded-lg p-2 border border-white/5">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{formatDhakaDisplayDate(appointment.appointmentDate)}</span>
                        </p>
                        <p className="flex items-center gap-2 font-mono text-amber-300 font-semibold">
                          <Clock3 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{appointment.appointmentTime}</span>
                        </p>
                        {appointment.category && (
                          <p className="truncate text-gray-400 text-[10px]">{appointment.category}</p>
                        )}
                        {appointment.notes && (
                          <p className="line-clamp-2 text-gray-400 text-[10px] italic">&ldquo;{appointment.notes}&rdquo;</p>
                        )}
                        {appointment.patientPhone && (
                          <p className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
                            <Phone className="h-3 w-3" />
                            {appointment.patientPhone}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={appointment.id || appointment._id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/patients/${appointment.patientNumber}`}
                          className="group block"
                          onClick={() => setIsOpen(false)}
                        >
                          <h3 className="min-w-0 truncate text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                            {appointment.patientName}
                          </h3>
                          <span className="font-mono text-[10px] text-gray-400">
                            #{appointment.patientNumber}
                          </span>
                        </Link>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-medium text-gray-400 uppercase">
                        Upcoming
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-300 bg-white/[0.02] rounded-lg p-2 border border-white/5">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        <span>{formatDhakaDisplayDate(appointment.appointmentDate)}</span>
                      </p>
                      <p className="flex items-center gap-2 font-mono">
                        <Clock3 className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        <span>{appointment.appointmentTime}</span>
                      </p>
                      {appointment.category && (
                        <p className="truncate text-gray-400 text-[10px]">{appointment.category}</p>
                      )}
                      {appointment.notes && (
                        <p className="line-clamp-2 text-gray-400 text-[10px] italic">&ldquo;{appointment.notes}&rdquo;</p>
                      )}
                      {appointment.patientPhone && (
                        <p className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
                          <Phone className="h-3 w-3" />
                          {appointment.patientPhone}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex min-h-12 min-w-12 items-center justify-center rounded-l-xl border border-r-0 px-3 shadow-2xl transition-all duration-300 ${
          expiredCount > 0
            ? 'border-red-500/80 bg-red-600 text-white shadow-glow-red animate-pulse'
            : soonCount > 0
            ? 'border-amber-400/70 bg-amber-500 text-black shadow-lg shadow-amber-500/20'
            : 'border-red-500/60 bg-red-700 text-white'
        }`}
        aria-label="Open upcoming appointments"
        aria-expanded={isOpen}
        title={
          expiredCount > 0
            ? `${expiredCount} expired appointment(s) needing attention`
            : `${appointments.length} upcoming appointments`
        }
      >
        <span className="relative">
          <Bell className="h-5 w-5" />
          {totalAlertCount > 0 && (
            <span
              className={`absolute -right-2.5 -top-2.5 min-w-4 px-1 py-0.2 rounded-full text-center text-[9px] font-black ${
                expiredCount > 0
                  ? 'bg-white text-red-700 ring-2 ring-red-600'
                  : 'bg-black text-amber-300'
              }`}
            >
              {totalAlertCount > 9 ? '9+' : totalAlertCount}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
