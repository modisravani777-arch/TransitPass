import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { errMsg, fmtDate, money } from '../../api';
import { useToast } from '../../context';
import { Avatar, Detail, Empty, ErrorText, Modal, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

export default function AdminUsers() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => { api.get('/users', { params: { q } }).then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const toggle = async (u) => {
    try { await api.patch(`/users/${u.id}/status`, { isActive: !u.is_active }); toast(u.is_active ? 'User deactivated' : 'User activated'); load(); setView(null); }
    catch (e) { toast(errMsg(e), 'error'); }
  };
  const open = async (id) => { try { setView((await api.get(`/users/${id}`)).data); } catch (e) { toast(errMsg(e), 'error'); } };

  return (
    <>
      <PageHeader title="Users" subtitle="Students registered on TransitPass." />
      <ErrorText>{error}</ErrorText>
      <div className="relative mb-4 max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="card overflow-hidden">
        {!rows && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {rows?.length === 0 && <Empty title="No students found" text="Try a different search." />}
        {rows?.length > 0 && (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-brand-50/60"><tr>{['Student', 'Phone', 'Applications', 'Joined', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-brand-100/70">
              {rows.map((u) => (
                <tr key={u.id} className="transition hover:bg-brand-50/50">
                  <td className="td"><div className="flex items-center gap-3"><Avatar name={u.name} photo={u.photo} size={36} /><div><p className="font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
                  <td className="td">{u.phone}</td><td className="td">{u.applications}</td><td className="td whitespace-nowrap text-slate-500">{fmtDate(u.created_at)}</td>
                  <td className="td"><StatusBadge status={u.is_active ? 'Active' : 'Inactive'} /></td>
                  <td className="td"><div className="flex gap-2"><button className="btn-ghost btn-sm" onClick={() => open(u.id)}>View</button>
                    <button className={`btn-sm ${u.is_active ? 'btn-ghost text-red-600' : 'btn-accent'}`} onClick={() => toggle(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button></div></td>
                </tr>
              ))}
            </tbody></table></div>
        )}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title="Student details" wide>
        {view && (
          <div className="space-y-6">
            <div className="flex items-center gap-4"><Avatar name={view.name} photo={view.photo} size={64} /><div><p className="text-lg font-semibold">{view.name}</p><StatusBadge status={view.is_active ? 'Active' : 'Inactive'} /></div></div>
            <dl className="grid gap-5 sm:grid-cols-3"><Detail label="Email">{view.email}</Detail><Detail label="Phone">{view.phone}</Detail><Detail label="Joined">{fmtDate(view.created_at)}</Detail></dl>
            <div>
              <h3 className="mb-2 font-semibold">Applications ({view.applications.length})</h3>
              {view.applications.length === 0 ? <p className="text-sm text-slate-500">No applications yet.</p> : (
                <ul className="divide-y divide-brand-100/70 rounded-xl border border-brand-100/70">
                  {view.applications.map((a) => <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="min-w-0 truncate">#{a.id} · {a.route_name} · {a.pass_type_name} · {money(a.amount)}</span><StatusBadge status={a.status} /></li>)}
                </ul>
              )}
            </div>
            <button className={view.is_active ? 'btn-ghost text-red-600' : 'btn-accent'} onClick={() => toggle(view)}>{view.is_active ? 'Deactivate user' : 'Activate user'}</button>
          </div>
        )}
      </Modal>
    </>
  );
}
