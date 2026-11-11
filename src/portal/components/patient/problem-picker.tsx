import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { appendPatientProblem } from '@/portal/lib/patient-fields';

export const COMMON_PROBLEMS: { en: string; bn: string }[] = [
  { en: 'Toothache', bn: 'দাঁতে ব্যথা' },
  { en: 'Cavity / Tooth decay', bn: 'দাঁতে গর্ত / ক্ষয়' },
  { en: 'Sensitivity', bn: 'ঠান্ডা-গরম লাগে' },
  { en: 'Gum bleeding', bn: 'মাড়ি থেকে রক্ত' },
  { en: 'Gum swelling', bn: 'মাড়ি ফোলা' },
  { en: 'Bad breath', bn: 'মুখে দুর্গন্ধ' },
  { en: 'Broken tooth', bn: 'দাঁত ভেঙে গেছে' },
  { en: 'Loose tooth', bn: 'দাঁত নড়ে' },
  { en: 'Wisdom tooth pain', bn: 'আক্কেল দাঁতে ব্যথা' },
  { en: 'Tooth extraction', bn: 'দাঁত তোলা' },
  { en: 'Scaling / Cleaning', bn: 'দাঁত পরিষ্কার' },
  { en: 'Filling', bn: 'ফিলিং' },
  { en: 'Root canal (RCT)', bn: 'রুট ক্যানাল' },
  { en: 'Crown / Cap', bn: 'ক্যাপ' },
  { en: 'Missing tooth / Denture', bn: 'দাঁত নেই / নকল দাঁত' },
  { en: 'Braces / Crooked teeth', bn: 'আঁকাবাঁকা দাঁত / ব্রেস' },
  { en: 'Teeth whitening', bn: 'দাঁত সাদা করা' },
  { en: 'Mouth ulcer', bn: 'মুখে ঘা' },
  { en: 'Jaw pain', bn: 'চোয়ালে ব্যথা' },
  { en: 'Check-up', bn: 'সাধারণ চেকআপ' },
];

const split = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);

/** Click a chip to add/remove a common problem in the complaint text (no typing needed). */
export const ProblemPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [manualProblem, setManualProblem] = useState('');
  const parts = split(value);
  const has = (en: string) => parts.some((p) => p.toLowerCase() === en.toLowerCase());
  const toggle = (en: string) => {
    const next = has(en) ? parts.filter((p) => p.toLowerCase() !== en.toLowerCase()) : [...parts, en];
    onChange(next.join(', '));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {COMMON_PROBLEMS.map((p) => {
          const on = has(p.en);
          return (
            <button
              key={p.en}
              type="button"
              onClick={() => toggle(p.en)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                on
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08]'
              }`}
            >
              {on && <Check className="w-3 h-3" />}
              <span className="font-semibold">{p.bn}</span>
              <span className={`text-[10px] ${on ? 'text-red-100' : 'text-gray-500'}`}>{p.en}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-end gap-2">
        <Input
          label="নিজে সমস্যা লিখুন / Add manually"
          placeholder="সমস্যার নাম লিখুন"
          value={manualProblem}
          onChange={(event) => setManualProblem(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onChange(appendPatientProblem(value, manualProblem));
            setManualProblem('');
          }}
        />
        <Button type="button" variant="outline" disabled={!manualProblem.trim()} onClick={() => {
          onChange(appendPatientProblem(value, manualProblem));
          setManualProblem('');
        }} className="shrink-0 gap-1.5">
          <Plus className="w-4 h-4" /> যোগ করুন
        </Button>
      </div>
    </div>
  );
};
