import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { errMsg, fmtDate } from '../../api';
import { useToast } from '../../context';
import PassCard from '../../components/PassCard';
import { Empty, ErrorText, Modal, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

export default function AdminPasses() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => { api.get('/passes', { params: { q } }).then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  const open = async (id) => { try { setPass((await api.get(`/passes/${id}`)).data); } catch (e) { toast(errMsg(e), 'error'); } };

  return (
    <>
      <PageHeader title="Bus passes" subtitle="Every pass issued to students." />
      <ErrorText>{error}</ErrorText>
      <div className="relative mb-4 max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search by pass number or student" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="card overflow-hidden">
        {!rows && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {rows?.length === 0 && <Empty title="No passes found" text="Passes appear here after approved applications are paid." />}
        {rows?.length > 0 && (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-brand-50/60"><tr>{['Pass number', 'Student', 'Route', 'Type', 'Valid', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-brand-100/70">
              {rows.map((p) => (
                <tr key={p.id} className="transition hover:bg-brand-50/50">
                  <td className="td font-semibold">{p.pass_number}</td><td className="td">{p.user_name}</td><td className="td">{p.route_name}</td><td className="td">{p.pass_type_name}</td>
                  <td className="td whitespace-nowrap text-slate-500">{fmtDate(p.valid_from)} – {fmtDate(p.valid_until)}</td>
                  <td className="td"><StatusBadge status={p.status} /></td>
                  <td className="td"><button className="btn-ghost btn-sm" onClick={() => open(p.id)}>View</button></td>
                </tr>
              ))}
            </tbody></table></div>
        )}
      </div>
      <Modal open={!!pass} onClose={() => setPass(null)} title="Bus pass" wide>{pass && <PassCard pass={pass} />}</Modal>
    </>
  );
}
