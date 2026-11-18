import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, fmtDate, money } from '../../api';
import { Empty, ErrorText, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

const TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Pass Issued'];

export default function Applications() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => { api.get('/applications').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, []);
  const shown = rows?.filter((r) => tab === 'All' || r.status === tab);

  return (
    <>
      <PageHeader title="My applications" subtitle="Every pass request you've made.">
        <Link to="/app/apply" className="btn-primary">New application</Link>
      </PageHeader>
      <ErrorText>{error}</ErrorText>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t ? 'bg-brand-900 text-white' : 'bg-white text-slate-600 ring-1 ring-brand-100 hover:bg-brand-50'}`}>{t}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {!rows && !error && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {shown?.length === 0 && <Empty title="No applications here" text="Applications you submit will be listed in this table."><Link to="/app/apply" className="btn-primary">Apply for Bus Pass</Link></Empty>}
        {shown?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-50/60"><tr>{['ID', 'Route', 'Pass type', 'Amount', 'Applied', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-brand-100/70">
                {shown.map((a) => (
                  <tr key={a.id} onClick={() => navigate(`/app/applications/${a.id}`)} className="cursor-pointer transition hover:bg-brand-50/50">
                    <td className="td font-semibold">#{a.id}</td>
                    <td className="td">{a.route_name}</td>
                    <td className="td">{a.pass_type_name}</td>
                    <td className="td font-semibold">{money(a.amount)}</td>
                    <td className="td whitespace-nowrap text-slate-500">{fmtDate(a.created_at)}</td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
