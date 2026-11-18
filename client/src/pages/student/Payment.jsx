import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CreditCard, Landmark, Loader2, Lock, Smartphone } from 'lucide-react';
import api, { errMsg, fmtDate, money } from '../../api';
import { ErrorText, Field, PageHeader, Skeleton } from '../../components/ui';

const METHODS = [
  { id: 'UPI', icon: Smartphone, text: 'Pay using any UPI app' },
  { id: 'Card', icon: CreditCard, text: 'Debit or credit card' },
  { id: 'Net Banking', icon: Landmark, text: 'Pay from your bank' },
];

export default function Payment() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [method, setMethod] = useState('UPI');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => { api.get(`/applications/${id}`).then((r) => setA(r.data)).catch((e) => setError(errMsg(e))); }, [id]);

  const pay = async () => {
    setBusy(true); setError('');
    try {
      await new Promise((r) => setTimeout(r, 1400)); // pretend to talk to a bank
      setReceipt((await api.post('/payments', { applicationId: Number(id), method })).data);
    } catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  if (!a) return error ? <ErrorText>{error}</ErrorText> : <Skeleton className="h-96" />;

  if (receipt) return (
    <div className="mx-auto max-w-md">
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-20 w-20 animate-pop place-items-center rounded-full bg-accent-500 text-brand-950 shadow-lg shadow-accent-500/30"><Check size={40} strokeWidth={3} /></span>
        <h1 className="mt-6 text-2xl font-bold">Payment successful</h1>
        <p className="mt-1 text-slate-500">{a.status === 'Approved' ? 'Your pass has been issued.' : 'An admin will review your application shortly.'}</p>
        <p className="mt-6 font-display text-4xl font-bold">{money(receipt.amount)}</p>
        <dl className="mt-6 space-y-3 rounded-2xl bg-surface p-5 text-left text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Transaction ID</dt><dd className="break-all text-right font-semibold">{receipt.transactionId}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-semibold">{receipt.method}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Application</dt><dd className="font-semibold">#{receipt.applicationId}</dd></div>
        </dl>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to={`/app/applications/${a.id}`} className="btn-primary">Track application</Link>
          <Link to="/app" className="btn-ghost">Dashboard</Link>
        </div>
      </div>
    </div>
  );

  if (a.payment_status === 'Paid' || a.status === 'Rejected') return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-bold">{a.status === 'Rejected' ? 'This application was rejected' : 'Already paid'}</h1>
      <p className="mt-2 text-slate-500">{a.status === 'Rejected' ? 'Rejected applications cannot be paid.' : 'There is nothing left to pay for this application.'}</p>
      <Link to={`/app/applications/${a.id}`} className="btn-primary mt-6">View application</Link>
    </div>
  );

  return (
    <>
      <PageHeader title="Complete your payment" subtitle={`Application #${a.id}`} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-6 p-6 sm:p-8">
          <ErrorText>{error}</ErrorText>
          <h2 className="text-lg font-semibold">Payment method</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {METHODS.map(({ id: m, icon: Icon, text }) => (
              <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-2xl border-2 p-4 text-left transition ${method === m ? 'border-brand-600 bg-brand-50' : 'border-brand-100 hover:border-brand-500/40'}`}>
                <Icon size={22} className={method === m ? 'text-brand-600' : 'text-slate-400'} />
                <p className="mt-3 font-semibold">{m}</p><p className="text-xs text-slate-500">{text}</p>
              </button>
            ))}
          </div>

          <div key={method} className="animate-fade space-y-4">
            {method === 'UPI' && <Field label="UPI ID"><input className="input" placeholder="name@bank" /></Field>}
            {method === 'Card' && <>
              <Field label="Card number"><input className="input" inputMode="numeric" placeholder="4242 4242 4242 4242" /></Field>
              <div className="grid grid-cols-2 gap-4"><Field label="Expiry"><input className="input" placeholder="MM/YY" /></Field><Field label="CVV"><input className="input" type="password" placeholder="•••" /></Field></div>
            </>}
            {method === 'Net Banking' && <Field label="Choose your bank"><select className="input">{['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Canara Bank'].map((b) => <option key={b}>{b}</option>)}</select></Field>}
            <p className="flex items-center gap-2 text-xs text-slate-500"><Lock size={13} />Demo payment. No real money is charged and these details are not saved.</p>
          </div>
        </div>

        <div className="card h-fit p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold">Order summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Pass type</dt><dd className="text-right font-semibold">{a.pass_type_name}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Route</dt><dd className="text-right font-semibold">{a.source} → {a.destination}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Starts</dt><dd className="font-semibold">{fmtDate(a.start_date)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Method</dt><dd className="font-semibold">{method}</dd></div>
          </dl>
          <div className="my-5 border-t border-dashed border-brand-100" />
          <div className="flex items-end justify-between"><span className="text-slate-500">Total</span><span className="font-display text-3xl font-bold">{money(a.amount)}</span></div>
          <button className="btn-accent mt-6 w-full py-3.5" disabled={busy} onClick={pay}>{busy ? <><Loader2 size={18} className="animate-spin" />Processing…</> : `Pay ${money(a.amount)} now`}</button>
          <Link to={`/app/applications/${a.id}`} className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-brand-900">Pay later</Link>
        </div>
      </div>
    </>
  );
}
