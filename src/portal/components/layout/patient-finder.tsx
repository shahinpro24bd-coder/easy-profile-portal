import React, { useEffect, useRef, useState } from 'react';
import { Search, User, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from '@/portal/shims/next-navigation';
import { apiFetch } from '@/portal/lib/api/client';

type Found = { patientNumber: string | number; fullName?: string; phone?: string };

/** Type a name, phone or patient number and jump straight to that patient's profile. */
export const PatientFinder: React.FC<{ className?: string }> = ({ className = '' }) => {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Found[]>([]);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch<Found[]>(`/patients?page=1&limit=6&search=${encodeURIComponent(term)}`);
        setResults(Array.isArray(res.data) ? res.data : []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (p: Found) => {
    setOpen(false);
    setQ('');
    router.push(`/patients/${p.patientNumber}`);
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && results[active]) go(results[active]);
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Patient Lookup — নাম / ফোন / নম্বর লিখুন"
        aria-label="Find a patient by name, phone or number"
        className="w-full glass-input text-xs rounded-xl pl-10 pr-4 py-2.5 text-gray-200 placeholder:text-gray-500"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 shadow-glass overflow-hidden" style={{ background: 'var(--sidebar-bg)' }}>
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> খোঁজা হচ্ছে...
            </div>
          ) : results.length ? (
            results.map((p, i) => (
              <button
                key={String(p.patientNumber)}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === active ? 'bg-white/[0.06]' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-100 truncate">{p.fullName || 'Patient'}</p>
                  <p className="text-[11px] text-gray-400 font-mono truncate">#{p.patientNumber}{p.phone ? ` · ${p.phone}` : ''}</p>
                </div>
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push('/patients/new'); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs text-gray-300 hover:bg-white/[0.06]"
            >
              <UserPlus className="w-4 h-4 text-red-400" /> কাউকে পাওয়া যায়নি — নতুন রোগী যোগ করুন
            </button>
          )}
        </div>
      )}
    </div>
  );
};
