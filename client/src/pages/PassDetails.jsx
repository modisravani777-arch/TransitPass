import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Bus, CalendarDays, CheckCircle2, Clock, Hash, IndianRupee, MapPin, QrCode, Route as RouteIcon, ShieldCheck, Ticket, XCircle } from 'lucide-react';
import api, { errMsg, fmtDate, money } from '../api';
import { useAuth } from '../context';
import { Avatar } from '../components/ui';

const VERDICT = {
  Active: { title: 'VALID PASS', Icon: CheckCircle2, banner: 'bg-accent-500 text-brand-950', bar: 'bg-accent-500' },
  Upcoming: { title: 'NOT VALID YET', Icon: Clock, banner: 'bg-amber-400 text-amber-950', bar: 'bg-amber-400' },
  Expired: { title: 'EXPIRED PASS', Icon: XCircle, banner: 'bg-red-600 text-white', bar: 'bg-red-500' },
};

const DAY = 86400000;
const day = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`).getTime();
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="break-words font-semibold text-slate-800">{children}</p>
      </div>
    </div>
  );
}

// Opens whenever a pass QR is scanned (any phone camera, Google Lens or the admin scanner): /verify/:number
export default function PassDetails() {
  const { number } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false); // true only when the server says this pass number does not exist
  const [tries, setTries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkedAt] = useState(() => new Date());
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let alive = true;
    setLoading(true); setPass(null); setError(''); setNotFound(false);
    api.get(`/passes/public/${encodeURIComponent(number)}`)
      .then((r) => alive && setPass(r.data))
      .catch((e) => {
        if (!alive) return;
        const msg = e.response?.data?.message;
        // Only a JSON "No pass found" reply from our API means the pass really doesn't exist.
        // Anything else (server down, route missing, network) is a checking problem, not an invalid pass.
        if (e.response?.status === 404 && msg === 'No pass found with that number') { setNotFound(true); setError('No pass found with this number'); }
        else setError(e.response?.status === 404 ? 'The verification service is not available (server needs updating or restarting).' : errMsg(e));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [number, tries]);

  const v = pass && (VERDICT[pass.status] || VERDICT.Expired);

  // Days left / until start / since expiry, plus how far through the validity period we are
  const timing = useMemo(() => {
    if (!pass) return null;
    const from = day(pass.valid_from), until = day(pass.valid_until), t = today();
    const total = Math.round((until - from) / DAY) + 1;
    if (pass.status === 'Upcoming') { const n = Math.round((from - t) / DAY); return { text: `Starts in ${n} day${n === 1 ? '' : 's'}`, pct: 0, total }; }
    if (pass.status === 'Expired') { const n = Math.round((t - until) / DAY); return { text: `Expired ${n} day${n === 1 ? '' : 's'} ago`, pct: 100, total }; }
    const left = Math.round((until - t) / DAY) + 1;
    return { text: left === 1 ? 'Last day of validity' : `${left} days remaining`, pct: Math.min(100, Math.max(0, ((t - from) / DAY / total) * 100)), total };
  }, [pass]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl animate-fade">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold text-brand-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-brand-950"><Bus size={20} strokeWidth={2.4} /></span>TransitPass
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><ShieldCheck size={15} className="text-accent-600" />Pass verification</span>
        </div>

        <div className="card overflow-hidden">
          {loading && <div className="p-8"><div className="skeleton mb-4 h-28 w-full" /><div className="skeleton mb-3 h-6 w-2/3" /><div className="skeleton mb-3 h-6 w-1/2" /><div className="skeleton h-6 w-3/4" /></div>}

          {!loading && error && notFound && (
            <>
              <div className="flex flex-col items-center gap-2 bg-red-600 px-6 py-10 text-center text-white">
                <XCircle size={64} strokeWidth={1.8} />
                <p className="font-display text-3xl font-bold">INVALID PASS</p>
                <p className="text-white/85">Do not allow boarding</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-slate-600">{error}</p>
                <p className="mt-2 break-all text-sm text-slate-400">Scanned: {number}</p>
              </div>
            </>
          )}

          {!loading && error && !notFound && (
            <>
              <div className="flex flex-col items-center gap-2 bg-slate-700 px-6 py-10 text-center text-white">
                <AlertTriangle size={60} strokeWidth={1.8} />
                <p className="font-display text-2xl font-bold">COULDN'T CHECK THIS PASS</p>
                <p className="text-white/80">This does not mean the pass is invalid</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-slate-600">{error}</p>
                <p className="mt-2 break-all text-sm text-slate-400">Scanned: {number}</p>
                <button className="btn-primary mt-5" onClick={() => setTries((t) => t + 1)}>Try again</button>
              </div>
            </>
          )}

          {!loading && pass && (
            <>
              <div className={`px-6 py-9 text-center ${v.banner}`}>
                <v.Icon size={60} strokeWidth={1.8} className="mx-auto" />
                <p className="mt-2 font-display text-3xl font-bold">{v.title}</p>
                <p className="mt-1 font-medium opacity-85">{timing.text}</p>
              </div>

              <div className="px-6 pt-6 sm:px-8">
                <div className="flex items-center gap-4">
                  <Avatar name={pass.user_name} photo={pass.user_photo} size={68} />
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-bold">{pass.user_name}</p>
                    <p className="text-sm text-slate-500">{pass.pass_type_name}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-1.5 flex justify-between text-xs text-slate-500"><span>{fmtDate(pass.valid_from)}</span><span>{fmtDate(pass.valid_until)}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${v.bar}`} style={{ width: `${timing.pct}%` }} /></div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 px-6 pb-4 pt-3 sm:px-8">
                <Row icon={Hash} label="Pass number">{pass.pass_number}</Row>
                <Row icon={Ticket} label="Pass type">{pass.pass_type_name} · {pass.duration_days} day{pass.duration_days === 1 ? '' : 's'}</Row>
                <Row icon={RouteIcon} label="Route">{pass.route_name}</Row>
                <Row icon={MapPin} label="From → To">{pass.source} → {pass.destination}</Row>
                <Row icon={CalendarDays} label="Valid from">{fmtDate(pass.valid_from)}</Row>
                <Row icon={CalendarDays} label="Valid until">{fmtDate(pass.valid_until)}</Row>
                <Row icon={IndianRupee} label="Amount paid">{money(pass.amount)}</Row>
                <Row icon={Clock} label="Issued on">{fmtDate(pass.issued_at)}</Row>
              </div>

              <p className="border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-400 sm:px-8">
                Application #{pass.application_id} · Checked {checkedAt.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </>
          )}

          {isAdmin && (
            <div className="flex flex-col gap-3 border-t border-brand-100/70 p-5 sm:flex-row">
              <button className="btn-accent flex-1" onClick={() => navigate('/admin/verify', { state: { autoStart: true } })}><QrCode size={18} />Scan next pass</button>
              <Link to="/admin" className="btn-ghost flex-1 text-center">Dashboard</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}