import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, money } from '../../api';
import { Empty, ErrorText, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

export default function AdminPayments() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/payments').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, []);
  const total = rows?.reduce((s, p) => s + Number(p.amount), 0) || 0;

  return (
    <>
      <PageHeader title="Payments" subtitle="All simulated transactions.">
        {rows && <div className="card px-5 py-3"><p className="text-xs text-slate-500">Total collected</p><p className="font-display text-xl font-bold">{money(total)}</p></div>}
      </PageHeader>
      <ErrorText>{error}</ErrorText>
      <div className="card overflow-hidden">
        {!rows && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {rows?.length === 0 && <Empty title="No payments yet" />}
        {rows?.length > 0 && (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-brand-50/60"><tr>{['Transaction', 'Student', 'Application', 'Method', 'Amount', 'Date', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-brand-100/70">
              {rows.map((p) => (
                <tr key={p.id} className="transition hover:bg-brand-50/50">
                  <td className="td font-semibold">{p.transaction_id}</td><td className="td">{p.user_name}</td>
                  <td className="td">#{p.application_id} · {p.pass_type_name}</td><td className="td">{p.method}</td>
                  <td className="td font-semibold">{money(p.amount)}</td><td className="td whitespace-nowrap text-slate-500">{fmtDate(p.created_at)}</td>
                  <td className="td"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody></table></div>
        )}
      </div>
    </>
  );
}
