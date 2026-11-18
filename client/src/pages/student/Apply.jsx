import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Check, FileUp, Loader2 } from 'lucide-react';
import api, { addDays, errMsg, fmtDate, money, todayISO } from '../../api';
import { useAuth, useToast } from '../../context';
import { Avatar, Detail, ErrorText, Field, PageHeader, Skeleton } from '../../components/ui';

const STEPS = ['Details', 'Route', 'Pass type', 'Start date', 'Document', 'Review'];

const Choice = ({ selected, onClick, children }) => (
  <button type="button" onClick={onClick}
    className={`relative w-full rounded-2xl border-2 p-4 text-left transition duration-200 ${selected ? 'border-brand-600 bg-brand-50 shadow-card' : 'border-brand-100 bg-white hover:border-brand-500/40'}`}>
    {selected && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white"><Check size={14} /></span>}
    {children}
  </button>
);

export default function Apply() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [routes, setRoutes] = useState(null);
  const [types, setTypes] = useState(null);
  const [f, setF] = useState({ routeId: null, passTypeId: null, startDate: todayISO(), file: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/routes').then((r) => setRoutes(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/pass-types').then((r) => setTypes(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const route = routes?.find((r) => r.id === f.routeId);
  const type = types?.find((t) => t.id === f.passTypeId);
  const canNext = [true, !!f.routeId, !!f.passTypeId, !!f.startDate && f.startDate >= todayISO(), !!f.file, true][step];

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('photo', file);
    try { setUser((await api.put('/users/profile', fd)).data.user); toast('Profile photo updated'); }
    catch (err) { toast(errMsg(err), 'error'); }
  };

  const pickFile = (e) => {
    const file = e.target.files[0];
    setError('');
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('File is too large (max 5 MB)');
    setF({ ...f, file });
  };

  const submit = async () => {
    setBusy(true); setError('');
    const fd = new FormData();
    fd.append('routeId', f.routeId); fd.append('passTypeId', f.passTypeId);
    fd.append('startDate', f.startDate); fd.append('document', f.file);
    try { const { data } = await api.post('/applications', fd); navigate(`/app/pay/${data.id}`); }
    catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Apply for a bus pass" subtitle="Six quick steps. You'll pay at the end." />
      <div className="mb-6">
        <div className="mb-3 flex justify-between text-xs font-medium text-slate-500">
          {STEPS.map((s, i) => <span key={s} className={`${i === step ? 'font-semibold text-brand-900' : ''} ${i === step ? '' : 'hidden sm:block'}`}>{i + 1}. {s}</span>)}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <div key={step} className="animate-fade space-y-6">
          <ErrorText>{error}</ErrorText>

          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold">Your details</h2>
              <div className="flex items-center gap-5">
                <Avatar name={user.name} photo={user.photo} size={80} />
                <div>
                  <label className="btn-ghost btn-sm cursor-pointer"><Camera size={15} />{user.photo ? 'Change photo' : 'Add photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} /></label>
                  <p className="mt-2 text-xs text-slate-500">Your photo appears on your digital pass.</p>
                </div>
              </div>
              <dl className="grid gap-5 sm:grid-cols-3"><Detail label="Full name">{user.name}</Detail><Detail label="Email">{user.email}</Detail><Detail label="Phone">{user.phone}</Detail></dl>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold">Select your route</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {!routes && [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
                {routes?.map((r) => (
                  <Choice key={r.id} selected={f.routeId === r.id} onClick={() => setF({ ...f, routeId: r.id })}>
                    <p className="pr-8 font-semibold">{r.source} → {r.destination}</p>
                    <p className="mt-1 text-sm text-slate-500">Single trip fare {money(r.fare)}</p>
                  </Choice>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">Choose a pass type</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {!types && [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
                {types?.map((t) => (
                  <Choice key={t.id} selected={f.passTypeId === t.id} onClick={() => setF({ ...f, passTypeId: t.id })}>
                    <div className="flex items-baseline justify-between pr-8"><p className="font-semibold">{t.name}</p><p className="font-display text-lg font-bold">{money(t.price)}</p></div>
                    <p className="mt-1 text-sm text-slate-500">{t.duration_days} days · {t.description}</p>
                  </Choice>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold">When should your pass start?</h2>
              <div className="max-w-xs"><Field label="Start date"><input type="date" className="input" min={todayISO()} value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></Field></div>
              {type && f.startDate && <p className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-medium text-accent-600">Your pass will be valid until {fmtDate(addDays(f.startDate, type.duration_days - 1))}.</p>}
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold">Upload your document</h2>
              <p className="-mt-3 text-sm text-slate-500">A clear photo of your college ID or other proof. JPG, PNG, WebP or PDF, up to 5 MB.</p>
              <label className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${f.file ? 'border-accent-500 bg-accent-50' : 'border-brand-100 hover:border-brand-500/50 hover:bg-brand-50'}`}>
                <span className={`mb-3 grid h-14 w-14 place-items-center rounded-2xl ${f.file ? 'bg-accent-500 text-brand-950' : 'bg-brand-50 text-brand-600'}`}>{f.file ? <Check size={26} /> : <FileUp size={26} />}</span>
                <span className="font-semibold">{f.file ? f.file.name : 'Click to choose a file'}</span>
                {f.file && <span className="mt-1 text-sm text-slate-500">{(f.file.size / 1024).toFixed(0)} KB · click to replace</span>}
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={pickFile} />
              </label>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-semibold">Review your application</h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail label="Passenger">{user.name}</Detail>
                <Detail label="Route">{route?.source} → {route?.destination}</Detail>
                <Detail label="Pass type">{type?.name} ({type?.duration_days} days)</Detail>
                <Detail label="Valid">{fmtDate(f.startDate)} to {fmtDate(addDays(f.startDate, (type?.duration_days || 1) - 1))}</Detail>
                <Detail label="Document">{f.file?.name}</Detail>
              </dl>
              <div className="flex items-center justify-between rounded-2xl bg-brand-900 px-6 py-5 text-white">
                <span className="text-white/70">Amount to pay</span><span className="font-display text-3xl font-bold">{money(type?.price || 0)}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-brand-100/70 pt-6">
          <button className="btn-ghost" disabled={step === 0 || busy} onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeft size={16} />Back</button>
          {step < 5
            ? <button className="btn-primary" disabled={!canNext} onClick={() => { setError(''); setStep(step + 1); }}>Continue<ArrowRight size={16} /></button>
            : <button className="btn-accent" disabled={busy} onClick={submit}>{busy ? <Loader2 size={18} className="animate-spin" /> : <>Submit & pay<ArrowRight size={16} /></>}</button>}
        </div>
      </div>
    </>
  );
}
