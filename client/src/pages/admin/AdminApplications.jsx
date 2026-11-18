import { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Search, X } from 'lucide-react';
import api, { errMsg, fileUrl, fmtDate, money } from '../../api';
import { useToast } from '../../context';
import { Detail, Empty, ErrorText, Modal, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

function ReviewModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const [a, setA] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/applications/${id}`).then((r) => setA(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  const act = async (kind) => {
    setBusy(true); setError('');
    try {
      const { data } = await api.patch(`/applications/${id}/${kind}`, kind === 'reject' ? { reason } : {});
      toast(kind === 'approve' ? 'Application approved' : 'Application rejected');
      setA({ ...a, ...data }); setRejecting(false); onChanged();
    } catch (e) { setError(errMsg(e)); }
    setBusy(false);
  };

  const doc = fileUrl(a?.document_path);
  const isPdf = doc?.toLowerCase().endsWith('.pdf');

  // Approve / Reject stay pinned at the bottom of the panel, so they are always visible
  const footer = a && a.status === 'Pending' ? (
    <div className="space-y-3">
      <ErrorText>{error}</ErrorText>
      {rejecting ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Reason for rejection (shown to the student)</label>
            <input className="input" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Document is unclear. Please upload a readable college ID." />
          </div>
          <div className="flex gap-3">
            <button className="btn-danger" disabled={busy} onClick={() => act('reject')}>Confirm rejection</button>
            <button className="btn-ghost" onClick={() => setRejecting(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={busy} onClick={() => act('approve')}><Check size={16} />Approve</button>
          <button className="btn-ghost text-red-600" disabled={busy} onClick={() => setRejecting(true)}><X size={16} />Reject</button>
          {a.payment_status === 'Unpaid' && <p className="text-xs text-slate-500">Unpaid: the pass is issued once the student pays.</p>}
        </div>
      )}
    </div>
  ) : null;

  return (
    <Modal open onClose={onClose} title={`Application #${id}`} wide="xl" footer={footer}>
      {!a ? (error ? <ErrorText>{error}</ErrorText> : <Skeleton className="h-64" />) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge status={a.status} /><StatusBadge status={a.payment_status} /></div>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Student">{a.user_name}</Detail><Detail label="Email">{a.user_email}</Detail>
              <Detail label="Phone">{a.user_phone}</Detail><Detail label="Amount">{money(a.amount)}</Detail>
              <Detail label="Route">{a.source} → {a.destination}</Detail><Detail label="Pass type">{a.pass_type_name}</Detail>
              <Detail label="Start date">{fmtDate(a.start_date)}</Detail><Detail label="Applied on">{fmtDate(a.created_at)}</Detail>
              <Detail label="Pass number">{a.pass_number}</Detail>
            </dl>
            {a.rejection_reason && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><b>Rejection reason:</b> {a.rejection_reason}</p>}
          </div>

          <div>
            <p className="mb-2 flex items-center justify-between text-sm font-semibold">Uploaded document
              {doc && <a href={doc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">Open in new tab<ExternalLink size={12} /></a>}</p>
            {doc && !isPdf && <img src={doc} alt="Uploaded document" className="max-h-80 w-full rounded-xl border border-brand-100 bg-surface object-contain" />}
            {doc && isPdf && <a href={doc} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">{a.document_name}</a>}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminApplications() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/applications', { params: { q: q || undefined, status: status || undefined } }).then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  }, [q, status]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <>
      <PageHeader title="Applications" subtitle="Review, approve or reject pass requests." />
      <ErrorText>{error}</ErrorText>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search by student, email, route or ID" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{['Pending', 'Approved', 'Rejected', 'Pass Issued'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        {!rows && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {rows?.length === 0 && <Empty title="No applications found" text="Try a different search or status filter." />}
        {rows?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-50/60"><tr>{['ID', 'Student', 'Route', 'Pass type', 'Amount', 'Payment', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-brand-100/70">
                {rows.map((a) => (
                  <tr key={a.id} className="transition hover:bg-brand-50/50">
                    <td className="td font-semibold">#{a.id}</td>
                    <td className="td"><p className="font-semibold">{a.user_name}</p><p className="text-xs text-slate-500">{a.user_email}</p></td>
                    <td className="td">{a.route_name}</td><td className="td">{a.pass_type_name}</td>
                    <td className="td font-semibold">{money(a.amount)}</td>
                    <td className="td"><StatusBadge status={a.payment_status} /></td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                    <td className="td"><button className="btn-ghost btn-sm" onClick={() => setOpen(a.id)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {open && <ReviewModal id={open} onClose={() => setOpen(null)} onChanged={load} />}
    </>
  );
}