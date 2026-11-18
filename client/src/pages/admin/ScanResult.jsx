import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, QrCode, XCircle } from 'lucide-react';
import api, { errMsg, fmtDate } from '../../api';
import { Avatar, Detail } from '../../components/ui';

const VERDICT = {
  Active: { title: 'VALID PASS', sub: 'Allow boarding', Icon: CheckCircle2, banner: 'bg-accent-500 text-brand-950', bar: 'bg-accent-500' },
  Upcoming: { title: 'NOT VALID YET', sub: 'Pass starts on a later date', Icon: Clock, banner: 'bg-amber-400 text-amber-950', bar: 'bg-amber-400' },
  Expired: { title: 'EXPIRED PASS', sub: 'Do not allow boarding', Icon: XCircle, banner: 'bg-red-600 text-white', bar: 'bg-red-500' },
};

// Opens right after a QR scan: /admin/verify/:number
export default function ScanResult() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [scannedAt] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    setLoading(true); setPass(null); setError('');
    api.get(`/passes/verify/${encodeURIComponent(number)}`)
      .then((r) => alive && setPass(r.data))
      .catch((e) => alive && setError(e.response?.status === 404 ? 'No pass found with this number' : errMsg(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [number]);

  const scanNext = () => navigate('/admin/verify', { state: { autoStart: true } });
  const v = pass && (VERDICT[pass.status] || VERDICT.Expired);

  return (
    <div className="mx-auto max-w-xl animate-fade">
      <Link to="/admin/verify" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-900"><ArrowLeft size={16} />Back to verify</Link>

      <div className="card overflow-hidden">
        {loading && (
          <div className="p-8"><div className="skeleton mb-4 h-24 w-full" /><div className="skeleton mb-3 h-6 w-2/3" /><div className="skeleton h-6 w-1/2" /></div>
        )}

        {!loading && error && (
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

        {!loading && pass && (
          <>
            <div className={`flex flex-col items-center gap-2 px-6 py-10 text-center ${v.banner}`}>
              <v.Icon size={64} strokeWidth={1.8} />
              <p className="font-display text-3xl font-bold">{v.title}</p>
              <p className="opacity-80">{v.sub}</p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <Avatar name={pass.user_name} photo={pass.user_photo} size={64} />
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold">{pass.user_name}</p>
                  <p className="text-sm text-slate-500">{pass.pass_type_name}</p>
                </div>
              </div>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <Detail label="Pass number">{pass.pass_number}</Detail>
                <Detail label="Status">{pass.status}</Detail>
                <Detail label="Route">{pass.source} → {pass.destination}</Detail>
                <Detail label="Valid from">{fmtDate(pass.valid_from)}</Detail>
                <Detail label="Valid until">{fmtDate(pass.valid_until)}</Detail>
                <Detail label="Scanned at">{scannedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Detail>
              </dl>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-brand-100/70 p-5 sm:flex-row">
          <button className="btn-accent flex-1" onClick={scanNext}><QrCode size={18} />Scan next pass</button>
          <Link to="/admin" className="btn-ghost flex-1 text-center">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}