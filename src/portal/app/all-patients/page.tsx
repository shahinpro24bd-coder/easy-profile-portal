// @ts-nocheck -- legacy portal code ported from the original Next.js app

import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  DollarSign,
  Edit3,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
  User,
  Sparkles,
  FileText,
  Receipt,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/portal/app/dashboard/layout';
import { GlassCard } from '@/portal/components/ui/glass-card';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { Modal } from '@/portal/components/ui/modal';
import { apiFetch } from '@/portal/lib/api/client';
import { DailyPatient } from '@/portal/shared';
import { useToast } from '@/portal/components/ui/toast';

type DailyPatientForm = {
  patientName: string;
  phone: string;
  age: string;
  location: string;
  notes: string;
  treatment: string;
  amount: string;
  paymentStatus: string;
  visitTime: string;
  date: string;
};

const getLocalDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const emptyForm = (date: string): DailyPatientForm => ({
  patientName: '',
  phone: '',
  age: '',
  location: '',
  notes: '',
  treatment: '',
  amount: '',
  paymentStatus: 'pending',
  visitTime: '',
  date
});

export default function DailyPatientsPage() {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [entries, setEntries] = useState<DailyPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyPatient | null>(null);
  const [form, setForm] = useState<DailyPatientForm>(() => emptyForm(getLocalDate()));
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await apiFetch<DailyPatient[]>(`/daily-patients?date=${selectedDate}`);
      if (!response.success) {
        setLoadError(response.error || 'Unable to load daily patients.');
        return;
      }
      setEntries(response.data || []);
    } catch {
      setLoadError('Unable to load daily patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const dailyTotal = entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);

  const openAdd = () => {
    setEditingEntry(null);
    setForm(emptyForm(selectedDate));
    setIsModalOpen(true);
  };

  const openEdit = (entry: DailyPatient) => {
    setEditingEntry(entry);
    setForm({
      patientName: entry.patientName || '',
      phone: entry.phone || '',
      age: entry.age === undefined ? '' : String(entry.age),
      location: entry.location || '',
      notes: entry.notes || '',
      treatment: entry.treatment || '',
      amount: entry.amount === undefined ? '' : String(entry.amount),
      paymentStatus: entry.paymentStatus || 'pending',
      visitTime: entry.visitTime || '',
      date: entry.date
    });
    setIsModalOpen(true);
  };

  const updateField = (field: keyof DailyPatientForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    const payload = {
      ...form,
      age: form.age || undefined,
      amount: form.amount || undefined
    };
    try {
      const response = await apiFetch<DailyPatient>(
        editingEntry ? `/daily-patients/${editingEntry.id}` : '/daily-patients',
        { method: editingEntry ? 'PATCH' : 'POST', body: JSON.stringify(payload) }
      );
      if (!response.success) {
        showToast(response.error || 'Unable to save daily patient.', 'error');
        return;
      }
      showToast(editingEntry ? 'Daily patient updated successfully.' : 'Daily patient added to queue.', 'success');

      // Also keep a permanent profile in "সব রোগী" (create one if this phone isn't registered yet)
      if (!editingEntry && form.phone.trim() && form.patientName.trim()) {
        try {
          const phone = form.phone.trim();
          const check = await apiFetch<any>(`/patients/check-phone/${encodeURIComponent(phone.replace(/\D/g, ''))}`);
          const exists = check.success && check.data?.exists;
          if (!exists) {
            const created = await apiFetch<any>('/patients', {
              method: 'POST',
              body: JSON.stringify({
                fullName: form.patientName.trim(),
                age: Number(form.age) || 0,
                phone,
                village: form.location.trim() || undefined,
                patientProblem: form.treatment.trim() || form.notes.trim() || 'Daily visit'
              })
            });
            if (created.success) showToast('স্থায়ী প্রোফাইলও তৈরি হয়েছে (Saved to All Patients)', 'success');
            else showToast('প্রোফাইল তৈরি হয়নি: ' + (created.error || 'error'), 'error');
          }
        } catch { /* ignore */ }
      }
      setIsModalOpen(false);
      if (form.date !== selectedDate) {
        setSelectedDate(form.date);
      } else {
        await loadEntries();
      }
    } catch {
      showToast('Unable to save daily patient. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: DailyPatient) => {
    if (!window.confirm('Delete this daily patient entry? All subsequent patients will move forward in the serial sequence.')) return;

    const entryIdToDelete = entry.id;
    setDeletingId(entryIdToDelete);
    setEntries((prev) => prev.filter((item) => item.id !== entryIdToDelete));

    try {
      const response = await apiFetch(`/daily-patients/${entryIdToDelete}`, { method: 'DELETE' });
      if (!response.success) {
        showToast(response.error || 'Unable to delete daily patient.', 'error');
        await loadEntries();
        return;
      }
      showToast('Daily patient removed. Queue serial re-indexed.', 'success');
      await loadEntries();
    } catch {
      showToast('Unable to delete daily patient. Please try again.', 'error');
      await loadEntries();
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm">
          <BadgeCheck className="w-3 h-3" /> Paid
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40 shadow-sm">
          <Clock3 className="w-3 h-3" /> Pending
        </span>
      );
    }
    if (s === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/80 text-blue-400 border border-blue-500/40 shadow-sm">
          <AlertCircle className="w-3 h-3" /> Partial
        </span>
      );
    }
    if (s === 'unpaid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-500/40 shadow-sm">
          <AlertCircle className="w-3 h-3" /> Unpaid
        </span>
      );
    }
    if (!status) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-800 text-gray-400 border border-gray-700">
          Not set
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
        {status}
      </span>
    );
  };

  const field = (key: keyof DailyPatientForm, label: string, type = 'text', placeholder?: string) => (
    <Input
      label={label}
      type={type}
      value={form[key]}
      placeholder={placeholder}
      onChange={(event) => updateField(key, event.target.value)}
    />
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-700/50 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                Daily Clinic Queue
              </span>
              <p className="text-xs font-semibold text-blue-400">Live Walk-in Registry</p>
            </div>
            <h1 className="mt-1 text-2xl font-black text-gray-100 tracking-tight">Daily Patients</h1>
            <p className="mt-1 text-xs text-gray-400">
              Track walk-in visitors with automated sequential serial numbering, complete visit metadata, and transparent blue cards.
            </p>
          </div>
          <Button onClick={openAdd} className="shadow-[0_0_20px_rgba(59,130,246,0.35)] bg-blue-600 hover:bg-blue-500 text-white border-blue-400/40">
            <Plus className="mr-2 h-4 w-4" /> Add Daily Patient
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard glow glowColor="blue" className="p-4 sm:p-5 flex flex-col justify-between">
            <label htmlFor="daily-patient-date" className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              Select Visit Date
            </label>
            <div className="mt-2 relative">
              <input
                id="daily-patient-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="glass-input w-full rounded-xl py-2.5 px-3.5 text-sm font-medium border-blue-500/30 text-gray-100 bg-[#060c18]"
              />
            </div>
            {selectedDate !== getLocalDate() && (
              <button
                type="button"
                onClick={() => setSelectedDate(getLocalDate())}
                className="mt-2 self-start text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                Return to Today
              </button>
            )}
          </GlassCard>

          <GlassCard glow glowColor="blue" className="p-4 sm:p-5 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Visits for {selectedDate}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-black text-white font-mono">{entries.length}</p>
              <span className="text-xs text-blue-400 font-medium">Patients registered</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">First registered stays on top as Serial #1</p>
          </GlassCard>

          <GlassCard glow glowColor="blue" className="p-4 sm:p-5 flex flex-col justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue for {selectedDate}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-black text-blue-400 font-mono">৳{dailyTotal.toLocaleString('en-BD')}</p>
              <span className="text-xs text-emerald-400 font-medium">Recorded sum</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Cumulative collected & expected visit fees</p>
          </GlassCard>
        </div>

        {isLoading ? (
          <GlassCard glow glowColor="blue" className="py-20 text-center text-sm text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading daily patients for {selectedDate}...
          </GlassCard>
        ) : loadError ? (
          <GlassCard glow glowColor="blue" className="py-16 text-center">
            <p className="text-sm text-red-400">{loadError}</p>
            <Button className="mt-4" variant="outline" onClick={loadEntries}>Try again</Button>
          </GlassCard>
        ) : entries.length === 0 ? (
          <GlassCard glow glowColor="blue" className="py-20 text-center space-y-3">
            <Users className="mx-auto h-12 w-12 text-blue-500/50" />
            <h2 className="text-lg font-bold text-gray-200">No daily patients for {selectedDate}</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              There are no walk-in entries recorded for this date. Click below to register the first patient and start the serial queue at #1.
            </p>
            <div className="pt-2">
              <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Patient #1
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {entries.map((entry, index) => {

              const serialNumber = entry.dailySerial ?? (index + 1);

              return (
                <div
                  key={entry.id || (entry as any)._id || index}
                  className="group relative overflow-hidden rounded-2xl border border-blue-500/35 bg-gradient-to-br from-[#081329]/80 via-[#060c18]/80 to-[#0c1e3d]/60 backdrop-blur-xl p-5 shadow-[0_0_25px_-5px_rgba(59,130,246,0.22)] hover:shadow-[0_0_35px_-2px_rgba(59,130,246,0.38)] hover:border-blue-400/60 transition-all duration-300"
                >

                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent pointer-events-none" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">

                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 border-2 border-blue-400 text-blue-300 font-black text-lg flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/20">
                          {serialNumber}
                        </div>
                        <span className="text-[9px] font-extrabold text-blue-400/90 uppercase tracking-widest mt-1">Serial</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black text-gray-100 group-hover:text-blue-200 transition-colors truncate">
                            {entry.patientName || 'Unnamed Walk-in Patient'}
                          </h2>
                          {entry.patientNumber !== undefined && (
                            <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 border border-red-800/50 px-2 py-0.5 rounded-lg">
                              #{entry.patientNumber}
                            </span>
                          )}
                          {entry.source === 'legacy' ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                              Historical Record
                            </span>
                          ) : (
                            <span className="rounded-full border border-blue-500/30 bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                              Daily Walk-in
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-gray-300">
                            <CalendarDays className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            {entry.date}
                          </span>
                          {entry.serial && (
                            <span className="text-[11px] text-gray-500 font-mono">
                              (Original Ref: {entry.serial})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Edit daily patient"
                        onClick={() => openEdit(entry)}
                        className="rounded-xl p-2 text-gray-400 hover:bg-blue-950/60 hover:text-blue-300 border border-transparent hover:border-blue-500/30 transition-all"
                        title="Edit Patient Information"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete daily patient"
                        onClick={() => handleDelete(entry)}
                        disabled={deletingId === entry.id}
                        className="rounded-xl p-2 text-gray-400 hover:bg-red-950/60 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all disabled:opacity-50"
                        title="Delete Patient & Re-index Queue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <Phone className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Phone</span>
                        {entry.phone ? (
                          <a href={`tel:${entry.phone}`} className="font-mono text-gray-200 hover:text-blue-400 transition-colors font-medium">
                            {entry.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">Not provided</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <User className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Age</span>
                        <span className="text-gray-200 font-medium">
                          {entry.age !== undefined && entry.age !== null ? `${entry.age} years old` : <span className="text-gray-500 italic">Not specified</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Location / Address</span>
                        <span className="text-gray-200 font-medium truncate block">
                          {entry.location ? entry.location : <span className="text-gray-500 italic">Not specified</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <Clock3 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Visit Time</span>
                        <span className="font-mono text-gray-200 font-medium">
                          {entry.visitTime ? entry.visitTime : <span className="text-gray-500 italic">Not scheduled</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                      <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Procedure / Treatment</span>
                        <span className="text-blue-300 font-semibold">
                          {entry.treatment ? entry.treatment : <span className="text-gray-500 font-normal italic">General Walk-in Consultation</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/25 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block">Visit Fee</span>
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {entry.amount !== undefined && entry.amount !== null ? `৳${Number(entry.amount).toLocaleString('en-BD')}` : '৳0 (Not set)'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide block mb-1">Status</span>
                        {getStatusBadge(entry.paymentStatus)}
                      </div>
                    </div>

                    {(entry as any).receiptNumber && (
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                        <Receipt className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Associated Receipt</span>
                          <span className="font-mono text-gray-200 font-bold">#{(entry as any).receiptNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400 font-semibold mb-1">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Visit Reason / Clinical Notes</span>
                    </div>
                    {entry.notes ? (
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">No additional notes recorded for this visit.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingEntry ? 'Edit Daily Patient' : 'Add Daily Patient to Queue'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-blue-300 bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl">
            {editingEntry
              ? 'Update the daily patient details. The queue serial position will remain intact.'
              : 'Add a new walk-in patient. They will be placed next in the serial queue for this day.'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {field('patientName', 'Patient Full Name', 'text', 'e.g. Karim Ullah')}
            {field('phone', 'Phone Number', 'tel', 'e.g. 017xxxxxxxx')}
            {field('age', 'Age (Years)', 'number', 'e.g. 35')}
            {field('location', 'Location / Village / Area', 'text', 'e.g. Mirpur, Dhaka')}
            {field('treatment', 'Procedure / Treatment', 'text', 'e.g. Tooth Extraction, Scaling')}
            {field('amount', 'Amount (৳)', 'number', 'e.g. 500')}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-300">
                Payment Status
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['paid', 'pending', 'partial', 'unpaid'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateField('paymentStatus', status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      form.paymentStatus?.toLowerCase() === status
                        ? 'bg-blue-600 text-white shadow-sm border border-blue-400'
                        : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {field('visitTime', 'Visit Time Slot', 'time', 'Optional')}
            {field('date', 'Visit Date', 'date')}
          </div>

          <div>
            <label htmlFor="daily-notes" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-300">
              Visit Reason / Clinical Notes
            </label>
            <textarea
              id="daily-notes"
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              rows={3}
              placeholder="Primary complaint, medical history notes, or next follow-up remarks..."
              className="glass-input w-full resize-y rounded-xl px-4 py-2.5 text-sm bg-[#060c18] border-blue-500/30 text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]"
            >
              {editingEntry ? 'Save Changes' : 'Add to Queue'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
