import { useRef } from 'react';
import { Bus } from 'lucide-react';
import { fmtDate } from '../api';
import { Avatar } from './ui';

const PILL = {
  Active: 'bg-accent-400/20 text-accent-400 ring-accent-400/40',
  Upcoming: 'bg-amber-400/20 text-amber-300 ring-amber-300/40',
  Expired: 'bg-white/10 text-white/70 ring-white/25',
};

const DAY = 864e5;
const day = (s) => new Date(`${s}T00:00:00`);

// How far through its validity a pass is, plus a friendly label ("19 days left")
export function passProgress(p) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const from = day(p.valid_from), to = day(p.valid_until);
  const span = Math.round((to - from) / DAY) + 1;
  if (now < from) { const n = Math.round((from - now) / DAY); return { pct: 0, label: `Starts in ${n} day${n === 1 ? '' : 's'}` }; }
  if (now > to) return { pct: 100, label: 'Expired' };
  const left = Math.round((to - now) / DAY);
  const used = Math.round((now - from) / DAY) + 1;
  return { pct: Math.min(100, Math.round((used / span) * 100)), label: left === 0 ? 'Last day' : `${left} day${left === 1 ? '' : 's'} left` };
}

// Premium digital travel card. `pass` comes from GET /passes/:id (includes the QR data-URL)
export default function PassCard({ pass }) {
  const ref = useRef(null);
  const prog = passProgress(pass);

  // Gentle 3D tilt + light sheen that follows the pointer (desktop only)
  const move = (e) => {
    if (!window.matchMedia('(hover: hover)').matches || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    ref.current.style.setProperty('--sx', `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty('--sy', `${(y + 0.5) * 100}%`);
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };

  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave}
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white shadow-lift ring-1 ring-white/10 transition-transform duration-200 ease-out will-change-transform">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 via-brand-500 to-accent-400" />
      <div className="bg-grid-light pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-brand-500/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(520px circle at var(--sx, 50%) var(--sy, 0%), rgba(255,255,255,.13), transparent 45%)' }} />

      <div className="relative grid md:grid-cols-[1fr_230px]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-brand-950 shadow-glow"><Bus size={20} strokeWidth={2.4} /></span>
              <span className="font-display text-lg font-bold">TransitPass</span>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${PILL[pass.status] || PILL.Expired}`}>● {pass.status}</span>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <Avatar name={pass.user_name} photo={pass.user_photo} size={64} className="!rounded-2xl ring-2 ring-white/30" />
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold">{pass.user_name}</p>
              <p className="text-sm text-white/65">{pass.pass_type_name}</p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/[.06] px-4 py-3 ring-1 ring-inset ring-white/10">
            <div className="min-w-0"><p className="text-xs text-white/50">From</p><p className="truncate font-semibold">{pass.source}</p></div>
            <div className="relative h-7 flex-1 text-white/40">
              <div className="road absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" />
              <span className="absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent-500 text-brand-950 shadow-glow"><Bus size={14} /></span>
            </div>
            <div className="min-w-0 text-right"><p className="text-xs text-white/50">To</p><p className="truncate font-semibold">{pass.destination}</p></div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-white/50">Pass number</p>
              <p className="break-all font-display text-2xl font-bold tracking-wider sm:text-3xl">{pass.pass_number}</p>
            </div>
            <div aria-hidden className="hidden h-8 w-11 shrink-0 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-1 sm:block">
              <div className="h-full w-full rounded-[3px] border border-amber-800/30"
                style={{ backgroundImage: 'linear-gradient(90deg, transparent 47%, rgba(120,53,15,.35) 47% 53%, transparent 53%), linear-gradient(transparent 47%, rgba(120,53,15,.35) 47% 53%, transparent 53%)' }} />
            </div>
          </div>

          <div className="mt-6 border-t border-white/15 pt-5">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-white/50">Valid from</p><p className="font-semibold">{fmtDate(pass.valid_from)}</p></div>
              <div><p className="text-xs text-white/50">Valid until</p><p className="font-semibold">{fmtDate(pass.valid_until)}</p></div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-1000" style={{ width: `${prog.pct}%` }} />
              </div>
              <p className="mt-2 text-xs font-medium text-white/70">{prog.label}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-dashed border-white/25 p-6 md:border-l md:border-t-0">
          <div className="rounded-2xl bg-white p-3 shadow-lg ring-4 ring-white/10">
            {pass.qr ? <img src={pass.qr} alt={`QR code for ${pass.pass_number}`} className="h-36 w-36 md:h-40 md:w-40" /> : <div className="skeleton h-36 w-36" />}
          </div>
          <p className="text-center text-xs text-white/60">Show this code to the conductor</p>
        </div>
      </div>
    </div>
  );
}