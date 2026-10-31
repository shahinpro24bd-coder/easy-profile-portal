'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  Wrench,
  Briefcase,
  MessageSquare,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '@/portal/components/ui/glass-card';
import { Button } from '@/portal/components/ui/button';
import { Modal } from '@/portal/components/ui/modal';
import { useToast } from '@/portal/components/ui/toast';
import { apiFetch } from '@/portal/lib/api/client';
import { DashboardStats, Patient, Appointment } from '@patient-portal/shared';
import { getAppointmentLifecycle, parseAppointmentDateTime, getDhakaDateString } from '@/portal/lib/utils/date-time';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiFetch<DashboardStats>('/dashboard/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch {

      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleUnlockRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');

    const configuredMasterPassword =
      process.env.NEXT_PUBLIC_MASTER_PASSWORD ||
      process.env.MASTER_PASSWORD ||
      'master@admin';

    const entered = passwordInput.trim();

    if (entered === configuredMasterPassword) {
      setIsRevenueUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      showToast('Revenue metrics unlocked for this session', 'success');
    } else {
      setPasswordError('Incorrect master password. Access denied.');
    }
    setIsVerifying(false);
  };

  const totalPatients = stats?.totalPatients || 0;
  const todayAppointments = stats?.todayAppointments || 0;
  const upcomingAppointments = stats?.upcomingAppointments || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const thisMonthRevenue = stats?.thisMonthRevenue || 0;
  const thisYearRevenue = stats?.thisYearRevenue ?? stats?.totalRevenue ?? 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingDue = stats?.pendingDue || 0;
  const activeStaff = stats?.activeStaff || 0;
  const thisMonthPayroll = stats?.thisMonthPayroll || 0;
  const accessorySpendingMonth = stats?.accessorySpendingMonth || 0;
  const smsBalance = stats?.smsBalance;
  const recentPatients: Patient[] = stats?.recentPatients || [];
  const recentAppointments: Appointment[] = stats?.recentAppointments || [];

  const todayStr = useMemo(() => getDhakaDateString(), []);

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Luckydental Dashboard</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-700/50 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              Live
            </span>
          </div>
          <p className="text-xs text-gray-400">Clinic performance, dental visits, and financial summary</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Search className="w-3.5 h-3.5" />
              Patient Lookup
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button variant="primary" size="sm" className="gap-2 text-xs shadow-glow-red">
              <Plus className="w-3.5 h-3.5" />
              New Patient
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Link href="/patients">
          <GlassCard glow hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Patients</p>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{totalPatients.toLocaleString()}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-900/60 to-red-950/80 border border-red-700/30 text-red-400 shadow-glow-red-sm shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-red-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span className="truncate">Active clinic records</span>
            </div>
          </GlassCard>
        </Link>

        <Link href="/appointments">
          <GlassCard hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Today&apos;s Visits</p>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{todayAppointments.toString()}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-900/60 to-red-950/80 border border-red-700/30 text-red-400 shadow-glow-red-sm shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-red-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span className="truncate">{upcomingAppointments} total upcoming</span>
            </div>
          </GlassCard>
        </Link>

        <Link href="/receipts">
          <GlassCard glow={pendingDue > 0} hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Due Amount</p>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">৳{pendingDue.toLocaleString('en-BD')}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-900/60 to-red-950/80 border border-red-700/30 text-red-400 shadow-glow-red-sm shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-red-400 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span className="truncate">{pendingDue > 0 ? 'Collect upon next visit' : 'All accounts settled'}</span>
            </div>
          </GlassCard>
        </Link>

        {!isRevenueUnlocked ? (
          <div
            onClick={() => setShowPasswordModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPasswordModal(true); }}
            className="group relative overflow-hidden rounded-2xl p-4 h-full cursor-pointer transition-all duration-300 bg-gradient-to-br from-cyan-950/50 via-[#061e30]/60 to-black/85 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md"
          >

            <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-400/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 pointer-events-none animate-pulse" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90">This Month Revenue</p>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                    Freezed
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-black font-mono tracking-widest text-cyan-200/50 blur-[3px] select-none">
                    ৳••••••••
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                <Lock className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-300 font-semibold pt-1 border-t border-cyan-500/20 relative z-10">
              <span className="flex items-center gap-1.5 group-hover:text-cyan-200 transition-colors">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Tap to enter password
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                LOCKED
              </span>
            </div>
          </div>
        ) : (
          <Link href="/receipts">
            <GlassCard glow hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5 border-emerald-500/40 shadow-glow-emerald">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">This Month Revenue</p>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Unlocked
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                    ৳{thisMonthRevenue.toLocaleString('en-BD')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Lock revenue again"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRevenueUnlocked(false);
                      showToast('Revenue metrics locked', 'info');
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border border-emerald-700/30 text-emerald-400 shadow-glow-emerald shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span className="truncate">৳{todayRevenue.toLocaleString('en-BD')} collected today</span>
              </div>
            </GlassCard>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Link href="/stuffs">
          <GlassCard hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5 bg-white/[0.02] border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Staff & Team</p>
                <h3 className="text-xl font-extrabold text-gray-100 mt-1 font-mono">{activeStaff.toString()}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Activity className="w-3 h-3 text-red-500" />
              <span className="truncate">৳{thisMonthPayroll.toLocaleString('en-BD')} monthly payroll</span>
            </div>
          </GlassCard>
        </Link>

        <Link href="/accessories">
          <GlassCard hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5 bg-white/[0.02] border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Equipment & Supplies</p>
                <h3 className="text-xl font-extrabold text-gray-100 mt-1 font-mono">৳{accessorySpendingMonth.toLocaleString('en-BD')}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Activity className="w-3 h-3 text-red-500" />
              <span className="truncate">Spent this month</span>
            </div>
          </GlassCard>
        </Link>

        <Link href="/smsinfo">
          <GlassCard hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5 bg-white/[0.02] border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SMS Gateway Balance</p>
                <h3 className="text-xl font-extrabold text-gray-100 mt-1 font-mono">
                  {smsBalance !== undefined && smsBalance !== null ? `৳${smsBalance}` : '—'}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Activity className="w-3 h-3 text-red-500" />
              <span className="truncate">Gateway Portal</span>
            </div>
          </GlassCard>
        </Link>

        {!isRevenueUnlocked ? (
          <div
            onClick={() => setShowPasswordModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPasswordModal(true); }}
            className="group relative overflow-hidden rounded-2xl p-4 h-full cursor-pointer transition-all duration-300 bg-gradient-to-br from-cyan-950/50 via-[#061e30]/60 to-black/85 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-md"
          >

            <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-400/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 pointer-events-none animate-pulse" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90">Yearly Revenue</p>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                    Freezed
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl font-black font-mono tracking-widest text-cyan-200/50 blur-[3px] select-none">
                    ৳••••••••
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
                <Lock className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-300 font-semibold pt-1 border-t border-cyan-500/20 relative z-10">
              <span className="flex items-center gap-1.5 group-hover:text-cyan-200 transition-colors">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Tap to enter password
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                LOCKED
              </span>
            </div>
          </div>
        ) : (
          <Link href="/receipts">
            <GlassCard hoverEffect className="p-4 h-full cursor-pointer transition-transform hover:-translate-y-0.5 bg-white/[0.02] border-emerald-500/40 shadow-glow-emerald">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Yearly Revenue</p>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Unlocked
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-100 mt-1 font-mono">
                    ৳{thisYearRevenue.toLocaleString('en-BD')}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Lock revenue again"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRevenueUnlocked(false);
                      showToast('Revenue metrics locked', 'info');
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border border-emerald-700/30 text-emerald-400 shadow-glow-emerald shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="truncate">৳{totalRevenue.toLocaleString('en-BD')} cumulative all-time</span>
              </div>
            </GlassCard>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" />
              Recent Patients
            </h3>
            <Link href="/patients" className="text-xs text-red-400 hover:underline">
              View All Patients
            </Link>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading patient records...</div>
            ) : recentPatients.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Users className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">No patients registered in database yet.</p>
                <Link href="/patients/new">
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    Register First Patient
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-gray-400 font-semibold uppercase">
                    <tr>
                      <th className="py-3.5 px-5">ID</th>
                      <th className="py-3.5 px-5">Patient Name</th>
                      <th className="py-3.5 px-5">Age</th>
                      <th className="py-3.5 px-5">Phone</th>
                      <th className="py-3.5 px-5">Dental Concern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentPatients.map((patient) => (
                      <tr
                        key={patient.id || (patient as any)._id}
                        onClick={() => router.push(`/patients/${patient.patientNumber}`)}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-red-400">
                          #{patient.patientNumber}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-gray-200">{patient.fullName}</td>
                        <td className="py-3.5 px-5 text-gray-400">{patient.age} yrs</td>
                        <td className="py-3.5 px-5 text-gray-400 font-mono">{patient.phone}</td>
                        <td className="py-3.5 px-5 text-gray-300 max-w-xs truncate">{patient.patientProblem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400" />
              Upcoming Schedule
            </h3>
            <Link href="/appointments" className="text-xs text-red-400 hover:underline">
              Open Schedule
            </Link>
          </div>

          <GlassCard className="p-4 space-y-3">
            {recentAppointments.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 space-y-2">
                <Calendar className="w-8 h-8 text-gray-500 mx-auto" />
                <p>No appointments scheduled</p>
                <Link href="/appointments">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Schedule Visit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentAppointments.slice(0, 5).map((apt) => {
                  const ts = parseAppointmentDateTime(apt.appointmentDate, apt.appointmentTime);
                  const now = Date.now();
                  const diff = ts - now;
                  const isExpired = diff < 0 && diff >= -ONE_DAY_MS;
                  const isToday = !isExpired && apt.appointmentDate === todayStr;

                  if (isExpired) {

                    return (
                      <div
                        key={apt.id || apt._id}
                        className="p-3 rounded-xl border border-red-500/70 bg-gradient-to-br from-red-950/60 via-black/70 to-red-950/30 space-y-1.5 ring-1 ring-red-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-red-300">
                            {apt.appointmentDate} • {apt.appointmentTime}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600/30 text-red-300 border border-red-500/60 animate-pulse">
                            Expired (&lt;24h)
                          </span>
                        </div>
                        <p className="text-xs font-bold text-red-100">
                          #{apt.patientNumber} {apt.patientName}
                        </p>
                        <p className="text-[11px] text-red-300/80">{apt.category}</p>
                      </div>
                    );
                  }

                  if (isToday) {

                    return (
                      <div
                        key={apt.id || apt._id}
                        className="p-3 rounded-xl border border-amber-500/50 bg-amber-950/25 space-y-1.5 ring-1 ring-amber-500/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-amber-300">
                            {apt.appointmentDate} • {apt.appointmentTime}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/40">
                            Today
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">
                          #{apt.patientNumber} {apt.patientName}
                        </p>
                        <p className="text-[11px] text-gray-300">{apt.category}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={apt.id || apt._id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-red-400">
                          {apt.appointmentDate} • {apt.appointmentTime}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-gray-400 border border-white/10">
                          Upcoming
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-200">
                        #{apt.patientNumber} {apt.patientName}
                      </p>
                      <p className="text-[11px] text-gray-400">{apt.category}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordInput('');
          setPasswordError('');
        }}
        title="Protected Revenue Statistics"
        description="Enter master administration password to unlock financial analytics"
      >
        <form onSubmit={handleUnlockRevenue} className="space-y-4">
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-cyan-100 flex items-center gap-1.5">
                <span>Confidential Clinic Financials</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-cyan-200/80 leading-relaxed">
                Monthly revenue and yearly revenue metrics are confidential. Unlocking will reveal the statistics for this session only, and will automatically freeze when the page is refreshed or tab is closed.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wide">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter master password..."
                autoFocus
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder:text-gray-500 pr-10 border border-white/10 focus:border-cyan-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordInput('');
                setPasswordError('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isVerifying}
              className="bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Unlock Revenue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
