import React from 'react';
import { DatePicker } from '@/portal/components/ui/date-picker';
import { getDhakaDateString, addDaysDhaka } from '@/portal/lib/utils/date-time';

/** "Which day was the money paid?" — quick buttons + calendar. Future dates are blocked. */
export function PaymentDateField({
  value,
  onChange,
  label = 'কোন দিন টাকা দিয়েছে?',
  sub = 'Payment date',
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  sub?: string;
}) {
  const today = getDhakaDateString();
  const quick = [
    { bn: 'আজ', en: 'Today', v: today },
    { bn: 'গতকাল', en: 'Yesterday', v: addDaysDhaka(today, -1) },
    { bn: '৩ দিন আগে', en: '3 days ago', v: addDaysDhaka(today, -3) },
    { bn: '৭ দিন আগে', en: '7 days ago', v: addDaysDhaka(today, -7) },
  ];
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-300">
        {label} <span className="text-gray-500 font-normal">· {sub}</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {quick.map((q) => (
          <button
            key={q.en}
            type="button"
            onClick={() => onChange(q.v)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              value === q.v
                ? 'bg-red-600 border-red-500 text-white shadow-glow-red-sm'
                : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <span className="block">{q.bn}</span>
            <span className="block text-[10px] font-normal opacity-70">{q.en}</span>
          </button>
        ))}
      </div>
      <DatePicker value={value} onChange={onChange} maxDate={today} placeholder="অন্য তারিখ বেছে নিন · Pick another date" />
    </div>
  );
}

/** Turn a YYYY-MM-DD clinic date into an ISO timestamp (noon Dhaka) the server can store. */
export function paymentDateToIso(d: string): string | undefined {
  if (!d) return undefined;
  if (d === getDhakaDateString()) return new Date().toISOString();
  return new Date(`${d}T12:00:00+06:00`).toISOString();
}
