import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import api, { fmtDate } from '../api';
import { passProgress } from '../components/PassCard';
import { Avatar, Detail, Logo, Skeleton } from '../components/ui';

const VERDICT = {
  Active: { title: 'VALID PASS', note: 'This pass is valid for travel today.', icon: CheckCircle2, bar: 'from-accent-500 to-accent-600', text: 'text-brand-950' },
  Upcoming: { title: 'NOT VALID YET', note: 'This pass has not started yet.', icon: Clock, bar: 'from-amber-400 to-amber-500', text: 'text-brand-950' },
  Expired: { title: 'EXPIRED PASS', note: 'This pass is no longer valid for travel.', icon: XCircle, bar: 'from-red-500 to-red-600', text: 'text-white' },
};

// Public page opened by scanning the pass QR code. No login needed.
export default function PublicVerify() {
  const { number } = useParams();
  const [pass, setPass] = useState(null);
  const [missing, setMissing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get(`/passes/public/${encodeURIComponent(number)}`)
      .then((r) => setPass(r.data))
      .catch((e) => (e.response?.status === 404 ? setMissing(true) : setFailed(true)));
  }, [number]);

  const v = pass && VERDICT[pass.status];
  const Icon = v?.icon;

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-100/60 bg-white/80 backdrop-blur"><div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5"><Logo /><span className="text-xs font-medium text-slate-500">Pass verification</span></div></header>

      <main className="mx-auto max-w-md animate-fade p-4 pb-10 sm:pt-8">
        {!pass && !missing && !failed && <div className="space-y-4"><Skeleton className="h-36" /><Skeleton className="h-72" /></div>}

        {(missing || failed) && (
          <div className="card overflow-hidden text-center">
            <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-8 text-white">
              <XCircle size={56} className="mx-auto" />
              <h1 className="mt-3 text-2xl font-extrabold">{missing ? 'INVALID PASS' : 'COULD NOT VERIFY'}</h1>
            </div>
            <p className="p-6 text-slate-600">{missing ? <>No pass was found with the number <b>{number}</b>.</> : 'Unable to reach the server. Check your connection and scan again.'}</p>
          </div>
        )}

        {pass && (
          <div className="card overflow-hidden shadow-lift">
            <div className={`bg-gradient-to-br ${v.bar} ${v.text} px-6 py-8 text-center`}>
              <Icon size={60} className="mx-auto" strokeWidth={2} />
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{v.title}</h1>
              <p className="mt-1 text-sm font-medium opacity-80">{v.note}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <Avatar name={pass.user_name} photo={pass.user_photo} size={64} className="!rounded-2xl" />
                <div className="min-w-0"><p className="truncate font-display text-xl font-semibold">{pass.user_name}</p><p className="text-sm text-slate-500">{pass.pass_type_name}</p></div>
              </div>

              <div className="mt-6 rounded-2xl bg-surface p-4">
                <p className="text-xs font-medium text-slate-500">Pass number</p>
                <p className="break-all font-display text-2xl font-bold tracking-wider">{pass.pass_number}</p>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-5">
                <div className="col-span-2"><Detail label="Route">{pass.source} → {pass.destination}</Detail></div>
                <Detail label="Valid from">{fmtDate(pass.valid_from)}</Detail>
                <Detail label="Valid until">{fmtDate(pass.valid_until)}</Detail>
                <Detail label="Validity">{passProgress(pass).label}</Detail>
                <Detail label="Status">{pass.status}</Detail>
              </dl>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">Checked live from TransitPass records · {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        <p className="mt-2 text-center text-xs"><Link to="/" className="font-medium text-brand-600 hover:underline">What is TransitPass?</Link></p>
      </main>
    </div>
  );
}