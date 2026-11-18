import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, IndianRupee, Ticket, Users } from 'lucide-react';
import api, { errMsg, fmtDate, money } from '../../api';
import { ErrorText, PageHeader, Skeleton } from '../../components/ui';

const COLORS = { Pending: '#F59E0B', Approved: '#3B82F6', Rejected: '#EF4444', 'Pass Issued': '#14B8A6' };

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="card p-5 transition duration-300 hover:-translate-y-0.5">
    <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={20} /></span>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="font-display text-3xl font-bold">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/admin').then((r) => { setD(r.data); requestAnimationFrame(() => setReady(true)); }).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!d) return <><PageHeader title="Dashboard" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36" />)}</div></>;

  const max = Math.max(...d.monthly.map((m) => m.total), 1);
  const total = d.byStatus.reduce((s, x) => s + x.count, 0) || 1;
  let acc = 0;
  const donut = d.byStatus.map((s) => { const from = (acc / total) * 100; acc += s.count; return `${COLORS[s.status]} ${from}% ${(acc / total) * 100}%`; }).join(', ');
  const topMax = Math.max(...d.topRoutes.map((r) => r.count), 1);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at how TransitPass is doing." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total students" value={d.students} tone="bg-brand-50 text-brand-600" />
        <Stat icon={Clock} label="Pending applications" value={d.pending} tone="bg-amber-50 text-amber-600" />
        <Stat icon={Ticket} label="Active passes" value={d.activePasses} tone="bg-accent-50 text-accent-600" />
        <Stat icon={IndianRupee} label="Total revenue" value={money(d.revenue)} tone="bg-blue-50 text-blue-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Revenue by month</h2>
          {d.monthly.length === 0 ? <p className="mt-6 text-sm text-slate-500">No payments yet.</p> : (
            <div className="mt-6 flex h-52 items-end gap-3 sm:gap-5">
              {d.monthly.map((m) => (
                <div key={m.ym} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-slate-500">{money(m.total)}</span>
                  <div className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-brand-700 to-accent-500 transition-all duration-700" style={{ height: ready ? `${Math.max((m.total / max) * 78, 4)}%` : '0%' }} />
                  <span className="text-xs font-medium text-slate-500">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Applications by status</h2>
          <div className="mt-6 flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${donut})` }}>
              <div className="absolute inset-4 grid place-items-center rounded-full bg-white"><span className="font-display text-2xl font-bold">{total}</span></div>
            </div>
            <ul className="space-y-2 text-sm">
              {d.byStatus.map((s) => <li key={s.status} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[s.status] }} />{s.status}<span className="font-semibold">{s.count}</span></li>)}
            </ul>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-lg font-semibold">Busiest routes</h2>
          <ul className="space-y-4">
            {d.topRoutes.map((r) => (
              <li key={r.name}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="truncate font-medium">{r.name}</span><span className="font-semibold">{r.count}</span></div>
                <div className="h-2 rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: ready ? `${(r.count / topMax) * 100}%` : '0%' }} /></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Waiting for review</h2><Link to="/admin/applications" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link></div>
          {d.pendingList.length === 0 && <p className="text-sm text-slate-500">Nothing pending. Nice work.</p>}
          <ul className="divide-y divide-brand-100/70">
            {d.pendingList.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{a.user_name}</p><p className="truncate text-xs text-slate-500">{a.route_name}</p></div>
                <span className="whitespace-nowrap text-xs text-slate-500">{fmtDate(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
