import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ExternalLink, Ticket } from 'lucide-react';
import api, { errMsg, fileUrl, fmtDate, money } from '../../api';
import { Detail, ErrorText, PageHeader, Skeleton, StatusBadge, Timeline } from '../../components/ui';

export default function ApplicationDetail() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/applications/${id}`).then((r) => setA(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  if (error) return <><Link to="/app/applications" className="btn-ghost btn-sm mb-5"><ArrowLeft size={14} />Back</Link><ErrorText>{error}</ErrorText></>;
  if (!a) return <Skeleton className="h-96" />;

  return (
    <>
      <Link to="/app/applications" className="btn-ghost btn-sm mb-5"><ArrowLeft size={14} />All applications</Link>
      <PageHeader title={`Application #${a.id}`} subtitle={`Submitted on ${fmtDate(a.created_at)}`}><StatusBadge status={a.status} /></PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="card p-6"><Timeline app={a} /></div>
          {a.status === 'Rejected' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-700">Your application was rejected</p>
              <p className="mt-1 text-sm text-red-700/90">{a.rejection_reason}</p>
              <Link to="/app/apply" className="btn-primary btn-sm mt-4">Apply again</Link>
            </div>
          )}
          <div className="card p-6">
            <h2 className="mb-5 text-lg font-semibold">Pass details</h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Route">{a.source} → {a.destination}</Detail>
              <Detail label="Pass type">{a.pass_type_name} ({a.duration_days} days)</Detail>
              <Detail label="Start date">{fmtDate(a.start_date)}</Detail>
              <Detail label="Amount">{money(a.amount)}</Detail>
              <Detail label="Document">{a.document_path ? <a href={fileUrl(a.document_path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">{a.document_name}<ExternalLink size={13} /></a> : null}</Detail>
              <Detail label="Payment"><StatusBadge status={a.payment_status} /></Detail>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          {a.payment_status === 'Unpaid' && a.status !== 'Rejected' && (
            <div className="card p-6">
              <p className="font-semibold">Payment pending</p>
              <p className="mt-1 text-sm text-slate-500">Pay {money(a.amount)} to continue with your application.</p>
              <Link to={`/app/pay/${a.id}`} className="btn-accent mt-4 w-full"><CreditCard size={16} />Pay now</Link>
            </div>
          )}
          {a.payment && (
            <div className="card p-6">
              <h3 className="mb-4 font-semibold">Payment receipt</h3>
              <dl className="space-y-3"><Detail label="Transaction ID">{a.payment.transaction_id}</Detail><Detail label="Method">{a.payment.method}</Detail><Detail label="Paid on">{fmtDate(a.payment.created_at)}</Detail></dl>
            </div>
          )}
          {a.pass_id && (
            <div className="card bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white">
              <p className="font-semibold">Your pass is ready</p>
              <p className="mt-1 text-sm text-white/65">{a.pass_number}</p>
              <Link to={`/app/pass/${a.pass_id}`} className="btn-accent mt-4 w-full"><Ticket size={16} />View digital pass</Link>
            </div>
          )}
          {a.status === 'Pending' && a.payment_status === 'Paid' && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-700">Payment received. An admin will review your application soon.</p>}
          {a.status === 'Approved' && !a.pass_id && <p className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">Approved. Complete the payment and your pass will be issued instantly.</p>}
        </div>
      </div>
    </>
  );
}
