import React, { useEffect, useRef, useState } from 'react';
import { Search, User, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from '@/portal/shims/next-navigation';
import { apiFetch } from '@/portal/lib/api/client';

type Found = { patientNumber: string | number; fullName?: string; phone?: string };

/** Type a name, phone or patient number and jump straight to that patient's profile. */
export const PatientFinder: React.FC<{ className?: string; inputClassName?: string; placeholder?: string; onQueryChange?: (q: string) => void }> = ({ className = '', inputClassName = 'text-xs', placeholder, onQueryChange }) => {
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
        const res = await apiFetch<Found[]>(`/patients?page=1&limit=8&search=${encodeURIComponent(term)}`);
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

  const term = q.trim();
  const showPanel = open && !!term;

  // Google-style: typed part normal, the rest bold
  const hl = (text: string) => {
    const i = text.toLowerCase().indexOf(term.toLowerCase());
    if (!term || i < 0) return <span className="font-semibold text-gray-100">{text}</span>;
    return (
      <>
        <span className="font-semibold text-gray-100">{text.slice(0, i)}</span>
        <span className="font-normal text-gray-400">{text.slice(i, i + term.length)}</span>
        <span className="font-semibold text-gray-100">{text.slice(i + term.length)}</span>
      </>
    );
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div
        className={showPanel ? 'absolute left-0 right-0 top-0 z-50 rounded-2xl border border-white/10 shadow-glass overflow-hidden' : ''}
        style={showPanel ? { background: 'var(--sidebar-bg)' } : undefined}
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onQueryChange?.(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === 'Enter' && results[active]) go(results[active]);
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder={placeholder || "Patient Lookup — নাম / ফোন / নম্বর লিখুন"}
            aria-label="Find a patient by name, phone or number"
            className={showPanel
              ? `w-full bg-transparent outline-none border-0 ${inputClassName} pl-10 pr-10 py-2.5 text-gray-100 placeholder:text-gray-500`
              : `w-full glass-input ${inputClassName} rounded-xl pl-10 pr-4 py-2.5 text-gray-200 placeholder:text-gray-500`}
          />
          {showPanel && loading && <Loader2 className="w-4 h-4 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        </div>

        {showPanel && (
          <div className="border-t border-white/10 py-1.5">
            {results.length ? (
              results.map((p, i) => (
                <button
                  key={String(p.patientNumber)}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(p)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors border-l-2 ${i === active ? 'bg-white/[0.06] border-red-500' : 'border-transparent'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                    {(p.fullName || '?').trim().charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{hl(p.fullName || 'Patient')}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      রোগী #{hl(String(p.patientNumber))}{p.phone ? <> · {hl(p.phone)}</> : null}
                    </p>
                  </div>
                </button>
              ))
            ) : loading ? (
              <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-400">
                <Search className="w-4 h-4" /> খোঁজা হচ্ছে...
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setOpen(false); router.push('/patients/new'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/[0.06]"
              >
                <UserPlus className="w-4 h-4 text-red-400" /> কাউকে পাওয়া যায়নি — নতুন রোগী যোগ করুন
              </button>
            )}
          </div>
        )}
      </div>
      {/* keeps layout height while the panel floats */}
      {showPanel && <div className={`invisible ${inputClassName} py-2.5`}>.</div>}
    </div>
  );
};
