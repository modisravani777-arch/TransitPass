import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Plus, Ticket, Clock, ChevronRight } from 'lucide-react';
import api, { errMsg, fmtDate } from '../../api';
import { useAuth } from '../../context';
import PassCard, { passProgress } from '../../components/PassCard';
import { Empty, ErrorText, Skeleton, StatusBadge, Timeline } from '../../components/ui';

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="card group flex items-center gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
    <span className={`grid h-12 w-12 place-items-center rounded-2xl transition group-hover:scale-110 ${tone}`}><Icon size={22} /></span>
    <div><p className="text-sm text-slate-500">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [s, setS] = useState(null);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/student').then(async (r) => {
      setS(r.data);
      if (r.data.activePass) setPass((await api.get(`/passes/${r.data.activePass.id}`)).data);
    }).catch((e) => setError(errMsg(e)));
  }, []);

  const prog = pass ? passProgress(pass) : null;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const subtitle = !s ? 'Loading your latest updates…'
    : prog ? `Your ${pass.pass_type_name} is active. ${prog.label}.`
    : s.pending > 0 ? `You have ${s.pending} application${s.pending === 1 ? '' : 's'} waiting for review.`
    : 'Apply for a pass and start travelling without the queue.';

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-6 text-white shadow-lift sm:p-8">
        <div className="bg-grid-light pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-white/55">{today}</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="mt-2 max-w-md text-white/70">{subtitle}</p>
          </div>
          <Link to="/app/apply" className="btn-accent"><Plus size={18} />Apply for Bus Pass</Link>
        </div>
        {prog && (
          <div className="relative mt-6 max-w-md">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-1000" style={{ width: `${prog.pct}%` }} /></div>
          </div>
        )}
      </div>

      <ErrorText>{error}</ErrorText>
      {!s && !error && <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>}

      {s && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={Ticket} label="Active pass" value={s.activePass ? 'Active' : 'None'} tone="bg-accent-50 text-accent-600" />
            <Stat icon={Clock} label="Pending applications" value={s.pending} tone="bg-amber-50 text-amber-600" />
            <Stat icon={FileText} label="Total applications" value={s.total} tone="bg-brand-50 text-brand-600" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              {pass ? <PassCard pass={pass} /> : s.activePass ? <Skeleton className="h-72" /> : (
                <div className="card"><Empty title="No active pass yet" text="Apply for a pass and it will show up here once it's approved and paid.">
                  <Link to="/app/apply" className="btn-primary">Apply for Bus Pass</Link></Empty></div>
              )}
              {pass && <Link to={`/app/pass/${pass.id}`} className="btn-ghost w-full sm:w-auto">View full pass <ArrowRight size={16} /></Link>}
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="mb-5 text-lg font-semibold">Latest application</h2>
                {s.latest ? <><Timeline app={s.latest} /><Link to={`/app/applications/${s.latest.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Application #{s.latest.id}<ChevronRight size={14} /></Link></>
                  : <p className="text-sm text-slate-500">Your progress will appear here after you apply.</p>}
              </div>
              <div className="card p-6">
                <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
                {s.recent.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
                <ul className="divide-y divide-brand-100/70">
                  {s.recent.map((a) => (
                    <li key={a.id}>
                      <Link to={`/app/applications/${a.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80">
                        <div className="min-w-0"><p className="truncate text-sm font-semibold">{a.route_name}</p><p className="text-xs text-slate-500">#{a.id} · {fmtDate(a.updated_at)}</p></div>
                        <StatusBadge status={a.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}