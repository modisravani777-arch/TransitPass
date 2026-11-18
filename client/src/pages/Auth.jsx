import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { errMsg } from '../api';
import { useAuth } from '../context';
import { ErrorText, Field, Logo } from '../components/ui';

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <Logo light />
        <div className="relative">
          <h2 className="max-w-md text-4xl font-bold leading-tight">Skip the counter. Your pass is a few taps away.</h2>
          <p className="mt-4 max-w-sm text-white/65">Apply online, pay in seconds and carry your bus pass on your phone.</p>
          <div className="mt-10 flex max-w-sm items-center gap-3 text-white/40">
            <span className="h-3 w-3 rounded-full bg-accent-400" /><span className="road h-1 flex-1" /><span className="h-3 w-3 rounded-full border-2 border-white/60" />
          </div>
        </div>
        <p className="relative text-sm text-white/45">B.Tech college project · TransitPass</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mb-8 mt-2 text-slate-500">{subtitle}</p>
          {children}
          <p className="mt-8 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </div>
    </div>
  );
}

const Submit = ({ busy, children }) => (
  <button className="btn-primary w-full py-3" disabled={busy}>
    {busy ? <Loader2 size={18} className="animate-spin" /> : <>{children}<ArrowRight size={16} /></>}
  </button>
);

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { const u = await login(form.email, form.password); navigate(u.role === 'admin' ? '/admin' : '/app'); }
    catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your bus pass." footer={<>New to TransitPass? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <ErrorText>{error}</ErrorText>
        <Field label="Email"><input className="input" type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" required autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Submit busy={busy}>Log in</Submit>
      </form>
      <div className="mt-6 rounded-2xl border border-dashed border-brand-100 bg-white p-4 text-sm">
        <p className="mb-2 font-semibold">Demo accounts</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setForm({ email: 'student@transitpass.com', password: 'Student@123' })}>Fill student login</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setForm({ email: 'admin@transitpass.com', password: 'Admin@123' })}>Fill admin login</button>
        </div>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setBusy(true);
    try { await register(form); navigate('/app'); }
    catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute." footer={<>Already registered? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorText>{error}</ErrorText>
        <Field label="Full name"><input className="input" required placeholder="Sai Kiran" value={form.name} onChange={set('name')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email"><input className="input" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} /></Field>
          <Field label="Phone"><input className="input" required inputMode="numeric" maxLength={10} pattern="\d{10}" title="10 digit phone number" placeholder="9876543210" value={form.phone} onChange={set('phone')} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password"><input className="input" type="password" required minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} /></Field>
          <Field label="Confirm password"><input className="input" type="password" required placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} /></Field>
        </div>
        <Submit busy={busy}>Create account</Submit>
      </form>
    </AuthLayout>
  );
}
