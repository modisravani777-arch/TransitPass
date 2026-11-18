import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bus, X, Inbox } from 'lucide-react';
import { fileUrl, initials } from '../api';

export function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-brand-950 shadow-lg shadow-accent-500/30">
        <Bus size={20} strokeWidth={2.4} />
      </span>
      <span className={`font-display text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-brand-900'}`}>TransitPass</span>
    </Link>
  );
}

const BADGE = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Approved: 'bg-blue-50 text-blue-700 ring-blue-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  'Pass Issued': 'bg-accent-50 text-accent-600 ring-accent-100',
  Active: 'bg-accent-50 text-accent-600 ring-accent-100',
  Upcoming: 'bg-amber-50 text-amber-700 ring-amber-200',
  Expired: 'bg-slate-100 text-slate-600 ring-slate-200',
  Paid: 'bg-accent-50 text-accent-600 ring-accent-100',
  Unpaid: 'bg-slate-100 text-slate-600 ring-slate-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Success: 'bg-accent-50 text-accent-600 ring-accent-100',
};
export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${BADGE[status] || BADGE.Unpaid}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{status}
  </span>
);

export function Avatar({ name, photo, size = 40, className = '' }) {
  const src = fileUrl(photo);
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ${className}`} />
    : <span style={{ width: size, height: size, fontSize: size * 0.36 }} className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 font-display font-semibold text-white ${className}`}>{initials(name)}</span>;
}

export const Skeleton = ({ className = 'h-24' }) => <div className={`skeleton ${className}`} />;

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const Empty = ({ title, text, children }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500"><Inbox size={26} /></span>
    <h3 className="text-lg font-semibold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>
);

export function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const size = wide === 'xl' ? 'max-w-5xl' : wide ? 'max-w-3xl' : 'max-w-lg';
  // Rendered on document.body so the page's animation can't trap or mis-size the overlay
  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-brand-950/50 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}
          className={`card flex max-h-[calc(100vh-2rem)] w-full animate-fade flex-col shadow-lift ${size}`}>
          <div className="flex shrink-0 items-center justify-between border-b border-brand-100/70 px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-brand-50"><X size={18} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin] [scrollbar-color:#8E99D6_transparent] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B8C0E6] hover:[&::-webkit-scrollbar-thumb]:bg-[#4153C4]">{children}</div>
          {footer && <div className="shrink-0 rounded-b-2xl border-t border-brand-100/70 bg-white px-6 py-4">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}

export const Field = ({ label, children, hint }) => (
  <div><label className="label">{label}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</div>
);

export const ErrorText = ({ children }) => children ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{children}</p> : null;

export const Detail = ({ label, children }) => (
  <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-0.5 font-semibold">{children || '—'}</dd></div>
);

// Application progress: Submitted → Payment → Review → Pass issued
export function Timeline({ app }) {
  const rejected = app.status === 'Rejected';
  const reviewed = ['Approved', 'Pass Issued', 'Rejected'].includes(app.status);
  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Payment', done: app.payment_status === 'Paid' },
    { label: rejected ? 'Rejected' : 'Approved', done: reviewed, failed: rejected },
    { label: 'Pass issued', done: app.status === 'Pass Issued' },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((s, i) => (
        <li key={s.label} className="relative text-center">
          {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 transition-all duration-700 ${s.done || s.failed ? (s.failed ? 'bg-red-400' : 'bg-accent-500') : 'bg-brand-100'}`} />}
          <span className={`relative mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${s.failed ? 'bg-red-500 text-white' : s.done ? 'bg-accent-500 text-brand-950' : i === current ? 'bg-brand-900 text-white ring-4 ring-brand-900/10' : 'bg-brand-100 text-slate-400'}`}>
            {s.failed ? '✕' : s.done ? '✓' : i + 1}
          </span>
          <p className={`mt-2 text-xs font-medium ${s.done || i === current ? 'text-brand-900' : 'text-slate-400'}`}>{s.label}</p>
        </li>
      ))}
    </ol>
  );
}