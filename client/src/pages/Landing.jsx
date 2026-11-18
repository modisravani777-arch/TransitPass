import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bus, CheckCircle2, CreditCard, FileUp, Menu, MapPin, QrCode, Radar, Receipt, ShieldCheck, Smartphone, UserPlus, X } from 'lucide-react';
import api, { money } from '../api';
import { useAuth } from '../context';
import { Logo, Skeleton } from '../components/ui';

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`transition duration-700 ${on ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${className}`}>{children}</div>;
}

const LINKS = [['Home', '#top'], ['How it works', '#how'], ['Passes', '#passes'], ['Routes', '#routes']];

function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const home = user ? (user.role === 'admin' ? '/admin' : '/app') : null;
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {LINKS.map(([l, h]) => <a key={l} href={h} className="transition hover:text-brand-900">{l}</a>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {home ? <Link to={home} className="btn-primary btn-sm">Open dashboard</Link> : <>
            <Link to="/login" className="btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
          </>}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-brand-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {open && (
        <div className="animate-fade border-t border-brand-100/60 bg-white px-5 pb-5 md:hidden">
          {LINKS.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="block border-b border-brand-100/60 py-3 font-medium">{l}</a>)}
          <div className="mt-4 flex gap-3">
            {home ? <Link to={home} className="btn-primary flex-1">Open dashboard</Link> : <>
              <Link to="/login" className="btn-ghost flex-1">Login</Link>
              <Link to="/register" className="btn-primary flex-1">Get Started</Link>
            </>}
          </div>
        </div>
      )}
    </header>
  );
}

// Decorative QR-style pattern for the hero card
function MiniQR() {
  const cells = [];
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
    const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    if (!finder && (x * 7 + y * 13 + x * y) % 3 === 0) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  const f = (x, y) => <g key={`${x}${y}`}><rect x={x} y={y} width="3" height="3" /><rect x={x + 0.7} y={y + 0.7} width="1.6" height="1.6" fill="white" /></g>;
  return <svg viewBox="0 0 11 11" className="h-full w-full" fill="#0B1B3F">{cells}{f(0, 0)}{f(8, 0)}{f(0, 8)}</svg>;
}

function Hero({ routes, types }) {
  const min = types?.length ? Math.min(...types.map((t) => Number(t.price))) : null;
  const stats = [[routes ? routes.length : '–', 'Active routes'], [types ? types.length : '–', 'Pass types'], [min ? money(min) : '–', 'Passes from']];
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-brand-100 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-16">
        <div>
          <h1 className="text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">Your Journey.<br />Your Pass.<br /><span className="bg-[linear-gradient(transparent_66%,#99F6E4_66%)]">Simplified.</span></h1>
          <p className="mt-6 max-w-md text-lg text-slate-600">Apply for your bus pass, track your application and travel with confidence — all in one place.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3.5">Get Your Pass <ArrowRight size={16} /></Link>
            <a href="#routes" className="btn-ghost px-6 py-3.5">Explore Routes</a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-600" />No queues</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-600" />No paperwork</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-600" />QR on your phone</span>
          </div>
        </div>

        {/* Hero visual: a pass card plus a bus travelling along a route */}
        <div className="relative mx-auto w-full max-w-md pb-4 pt-8">
          <div className="animate-float rounded-3xl bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-6 text-white shadow-lift ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-500 text-brand-950 shadow-glow"><Bus size={17} /></span>TransitPass</span>
              <span className="rounded-full bg-accent-400/20 px-3 py-1 text-xs font-semibold text-accent-400 ring-1 ring-accent-400/40">● Active</span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-white/50">Route</p>
                <p className="font-semibold">Visakhapatnam → Madhurawada</p>
                <p className="mt-4 text-xs text-white/50">Pass number</p>
                <p className="font-display text-xl font-bold tracking-wider">TP-2026-100001</p>
              </div>
              <div className="h-24 w-24 shrink-0 rounded-xl bg-white p-2"><MiniQR /></div>
            </div>
          </div>

          <div className="card relative z-10 -mt-3 ml-auto w-[88%] animate-bob p-4 shadow-lift">
            <div className="flex justify-between text-xs font-semibold text-slate-500"><span>Visakhapatnam</span><span>Madhurawada</span></div>
            <div className="relative mt-3 h-8 text-brand-500/40">
              <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent-500" />
              <span className="road absolute inset-x-4 top-1/2 h-1 -translate-y-1/2" />
              <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-brand-900 bg-white" />
              <span className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-drive place-items-center rounded-full bg-brand-900 text-white shadow-lg"><Bus size={15} /></span>
            </div>
          </div>

          <div className="card absolute -right-2 top-0 flex items-center gap-2.5 px-4 py-3 shadow-lift sm:-right-6">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600"><QrCode size={17} /></span>
            <p className="text-sm font-semibold">QR ready</p>
          </div>
          <div className="card absolute -left-2 bottom-16 flex items-center gap-2.5 px-4 py-3 shadow-lift sm:-left-8">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-50 text-accent-600"><CheckCircle2 size={18} /></span>
            <div><p className="text-sm font-semibold">Application approved</p><p className="text-xs text-slate-500">Pass issued instantly</p></div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 lg:pb-24">
        <div className="card grid grid-cols-3 divide-x divide-brand-100/70 text-center">
          {stats.map(([v, l]) => (
            <div key={l} className="px-3 py-5 sm:py-6"><p className="font-display text-2xl font-bold sm:text-3xl">{v}</p><p className="mt-1 text-xs text-slate-500 sm:text-sm">{l}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: UserPlus, title: 'Create an account', text: 'Register with your email and phone number.' },
  { icon: FileUp, title: 'Apply with your ID', text: 'Pick a route and pass, then upload your document.' },
  { icon: CreditCard, title: 'Pay online', text: 'Choose UPI, card or net banking.' },
  { icon: QrCode, title: 'Get your digital pass', text: 'Once approved, your QR pass is ready to use.' },
];

const WHY = [
  { icon: Smartphone, title: 'Always in your pocket', text: 'Your pass lives on your phone, with a QR code ready to scan.' },
  { icon: Radar, title: 'Live application status', text: 'Follow your request from submitted to issued without visiting an office.' },
  { icon: Receipt, title: 'Clear pricing', text: 'You see the exact amount before you pay. No hidden charges.' },
  { icon: ShieldCheck, title: 'Verified passes', text: 'Admins can check any pass number and see if it is valid.' },
];

export default function Landing() {
  const [routes, setRoutes] = useState(null);
  const [types, setTypes] = useState(null);
  useEffect(() => {
    api.get('/routes').then((r) => setRoutes(r.data)).catch(() => setRoutes([]));
    api.get('/pass-types').then((r) => setTypes(r.data)).catch(() => setTypes([]));
  }, []);

  const best = types?.length ? types.reduce((x, y) => (y.price / y.duration_days < x.price / x.duration_days ? y : x)) : null;

  return (
    <div className="bg-white">
      <Navbar />
      <Hero routes={routes} types={types} />

      <section id="how" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><h2 className="text-3xl font-bold sm:text-4xl">From sign-up to boarding in four steps</h2></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title}>
                <div className="card h-full p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-900 text-white"><Icon size={20} /></span>
                    <span className="font-display text-sm font-semibold text-slate-400">Step {i + 1}</span>
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="passes" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><h2 className="text-3xl font-bold sm:text-4xl">Pick the pass that fits your routine</h2></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {!types && [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-56" />)}
            {types?.length === 0 && <p className="text-slate-500">Pass types will appear here once the server is running.</p>}
            {types?.map((t, i) => (
              <Reveal key={t.id}>
                <div className={`flex h-full flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 ${t.id === best?.id ? 'bg-brand-900 text-white shadow-lift' : 'card'}`}>
                  <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{t.name}</h3>{t.id === best?.id && <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-semibold text-brand-950">Best value</span>}</div>
                  <p className="mt-4 font-display text-4xl font-bold">{money(t.price)}</p>
                  <p className={`text-sm ${t.id === best?.id ? 'text-white/60' : 'text-slate-500'}`}>for {t.duration_days} days</p>
                  <p className={`mt-4 flex-1 text-sm ${t.id === best?.id ? 'text-white/70' : 'text-slate-600'}`}>{t.description}</p>
                  <Link to="/register" className={`mt-6 ${t.id === best?.id ? 'btn-accent' : 'btn-ghost'}`}>Choose pass</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="routes" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><h2 className="text-3xl font-bold sm:text-4xl">Popular routes</h2></Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!routes && [1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
            {routes?.length === 0 && <p className="text-slate-500">Routes will appear here once the server is running.</p>}
            {routes?.map((r) => (
              <Reveal key={r.id}>
                <div className="card p-5 transition duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate font-semibold">{r.source}</span>
                    <span className="road h-1 w-12 text-brand-500/50" />
                    <span className="min-w-0 flex-1 truncate text-right font-semibold">{r.destination}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin size={14} />Single trip</span>
                    <span className="rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-600">{money(r.fare)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><h2 className="max-w-xl text-3xl font-bold sm:text-4xl">Why students choose TransitPass</h2></Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {WHY.map(({ icon: Icon, title, text }) => (
              <Reveal key={title}>
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-50 text-accent-600"><Icon size={22} /></span>
                  <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-slate-500">{text}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 px-8 py-16 text-center text-white">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-500/25 blur-3xl" />
          <h2 className="relative mx-auto max-w-xl text-3xl font-bold sm:text-4xl">Ready for a ride without the queue?</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/65">Create your account and apply for your pass in under five minutes.</p>
          <Link to="/register" className="btn-accent relative mt-8 px-7 py-3.5">Get Your Pass <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-brand-100/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} TransitPass · Online Bus Pass Management System</p>
          <div className="flex gap-5"><a href="#how" className="hover:text-brand-900">How it works</a><a href="#passes" className="hover:text-brand-900">Passes</a><Link to="/login" className="hover:text-brand-900">Login</Link></div>
        </div>
      </footer>
    </div>
  );
}