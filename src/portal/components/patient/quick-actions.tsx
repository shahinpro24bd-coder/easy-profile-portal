import React from 'react';
import {
  Receipt as ReceiptIcon,
  Wallet,
  CalendarPlus,
  Edit3,
  Phone,
  MessageSquare,
  Share2,
  FileText,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import Link from '@/portal/shims/next-link';

interface QuickActionsProps {
  patientNumber: string | number;
  phone?: string;
  hasDue?: boolean;
  onPayment: () => void;
  onAppointment: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

type Tile = {
  key: string;
  bn: string;
  en: string;
  icon: React.ElementType;
  primary?: boolean;
  danger?: boolean;
  href?: string;
  onClick?: () => void;
};

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * One simple panel with every common action for a patient, in plain words.
 * Everything a staff member needs can be started from here.
 */
export const PatientQuickActions: React.FC<QuickActionsProps> = ({
  patientNumber,
  phone,
  hasDue,
  onPayment,
  onAppointment,
  onEdit,
  onShare,
  onDelete,
}) => {
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

  const tiles: Tile[] = [
    { key: 'bill', bn: 'নতুন বিল', en: 'New Bill', icon: ReceiptIcon, primary: true, href: `/patients/${patientNumber}/receipt/new` },
    { key: 'pay', bn: hasDue ? 'বাকি টাকা নিন' : 'টাকা জমা নিন', en: 'Take Payment', icon: Wallet, onClick: onPayment },
    { key: 'apt', bn: 'অ্যাপয়েন্টমেন্ট দিন', en: 'Book Visit', icon: CalendarPlus, onClick: onAppointment },
    { key: 'edit', bn: 'তথ্য বদলান', en: 'Edit Info', icon: Edit3, onClick: onEdit },
    ...(cleanPhone
      ? [
          { key: 'call', bn: 'কল করুন', en: 'Call', icon: Phone, href: `tel:${cleanPhone}` },
          { key: 'sms', bn: 'SMS পাঠান', en: 'Send SMS', icon: MessageSquare, href: `sms:${cleanPhone}` },
        ]
      : []),
    { key: 'share', bn: 'লিংক শেয়ার', en: 'Share Profile', icon: Share2, onClick: onShare },
    { key: 'bills', bn: 'সব বিল দেখুন', en: 'See Bills', icon: FileText, onClick: () => scrollTo('patient-receipts') },
    { key: 'visits', bn: 'সব ভিজিট দেখুন', en: 'See Visits', icon: CalendarDays, onClick: () => scrollTo('patient-appointments') },
    { key: 'delete', bn: 'রোগী মুছুন', en: 'Delete', icon: Trash2, danger: true, onClick: onDelete },
  ];

  return (
    <section aria-label="Patient actions" className="glass-panel rounded-2xl p-4 sm:p-5 no-print">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-gray-100">কী করতে চান? <span className="text-gray-400 font-medium">· What do you want to do?</span></h2>
        <p className="text-xs text-gray-400 mt-0.5">একটি বোতামে চাপ দিন — এই রোগীর সব কাজ এখান থেকেই করা যায়।</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {tiles.map((t) => {
          const Icon = t.icon;
          const cls = `group flex flex-col items-center justify-center gap-1.5 text-center rounded-xl px-3 py-4 min-h-[92px] border transition-all duration-200 active:scale-[0.97] ${
            t.primary
              ? 'bg-gradient-to-br from-red-600 to-red-900 border-red-500/50 text-white shadow-glow-red'
              : t.danger
                ? 'bg-white/[0.02] border-white/10 text-red-400 hover:bg-red-950/40 hover:border-red-800/50'
                : 'bg-white/[0.03] border-white/10 text-gray-200 hover:bg-white/[0.06] hover:border-red-700/40'
          }`;
          const inner = (
            <>
              <Icon className={`w-6 h-6 ${t.primary ? 'text-white' : t.danger ? 'text-red-400' : 'text-red-400 group-hover:text-red-300'}`} />
              <span className="text-sm font-bold leading-tight">{t.bn}</span>
              <span className={`text-[11px] leading-tight ${t.primary ? 'text-red-100' : 'text-gray-400'}`}>{t.en}</span>
            </>
          );
          if (t.href) {
            return (
              <Link key={t.key} href={t.href} className={cls}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={t.key} type="button" onClick={t.onClick} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
};
