import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, CreditCard, FileText, LayoutDashboard, LogOut, Menu, PlusCircle, Route, ShieldCheck, Tags, Ticket, UserRound, Users, X, Bus } from 'lucide-react';
import api, { fmtDate } from '../api';
import { useAuth } from '../context';
import { Avatar, Logo } from './ui';

// `tab` items also appear in the mobile bottom bar (short label shown there)
const NAV = {
  student: [
    { to: '/app', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true, tab: true },
    { to: '/app/apply', label: 'Apply for pass', short: 'Apply', icon: PlusCircle, tab: true },
    { to: '/app/applications', label: 'My applications', short: 'Requests', icon: FileText, tab: true },
    { to: '/app/pass', label: 'My pass', short: 'Pass', icon: Ticket, tab: true },
    { to: '/app/profile', label: 'Profile', icon: UserRound },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true, tab: true },
    { to: '/admin/applications', label: 'Applications', short: 'Requests', icon: FileText, tab: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/routes', label: 'Routes', icon: Route },
    { to: '/admin/pass-types', label: 'Pass types', icon: Tags },
    { to: '/admin/passes', label: 'Bus passes', short: 'Passes', icon: Ticket, tab: true },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/verify', label: 'Verify pass', short: 'Verify', icon: ShieldCheck, tab: true },
  ],
};

function Bell_({ role }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const load = () => api.get('/stats/notifications').then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const to = (id) => (role === 'admin' ? '/admin/applications' : `/app/applications/${id}`);
  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); load(); }} aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-brand-100 bg-white shadow-sm transition hover:bg-brand-50">
        <Bell size={18} />
        {items.length > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 z-40 mt-2 w-80 max-w-[85vw] animate-fade p-2 shadow-lift">
            <p className="px-3 py-2 text-sm font-semibold">{role === 'admin' ? 'Waiting for review' : 'Latest updates'}</p>
            {items.length === 0 && <p className="px-3 pb-3 text-sm text-slate-500">You're all caught up.</p>}
            {items.map((n) => (
              <Link key={n.id} to={to(n.id)} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 hover:bg-brand-50">
                <p className="text-sm font-medium">{n.text}</p>
                <p className="text-xs text-slate-500">{fmtDate(n.at)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Shell({ role }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [loc.pathname]);

  const signOut = () => { logout(); navigate('/'); };
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-brand-900 to-brand-950 text-white">
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />
      <div className="relative flex items-center justify-between px-6 py-6">
        <Logo light to={role === 'admin' ? '/admin' : '/app'} />
        <button className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
      </div>
      <p className="relative px-7 pb-2 text-xs font-medium text-white/40">{role === 'admin' ? 'Manage' : 'Menu'}</p>
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3">
        {NAV[role].map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-accent-500 text-brand-950 shadow-glow' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={18} className="transition group-hover:scale-110" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="relative m-3 rounded-2xl bg-white/[.06] p-3 ring-1 ring-inset ring-white/10">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} photo={user.photo} size={38} />
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs capitalize text-white/55">{user.role}</p></div>
        </div>
        <button onClick={signOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/20"><LogOut size={16} />Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-100/60 bg-surface/80 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-brand-100 bg-white shadow-sm lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
            <span className="flex items-center gap-2 font-display font-bold lg:hidden"><Bus size={18} className="text-accent-600" />TransitPass</span>
            <span className="hidden text-sm font-medium text-slate-500 lg:block">{today}</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell_ role={role} />
            <Link to={role === 'admin' ? '/admin' : '/app/profile'} aria-label="Profile" className="rounded-full ring-2 ring-white transition hover:ring-accent-400"><Avatar name={user.name} photo={user.photo} size={40} /></Link>
          </div>
        </header>
        <main key={loc.pathname} className="mx-auto max-w-6xl animate-fade p-4 pb-28 sm:p-8 lg:pb-10"><Outlet /></main>
      </div>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV[role].filter((n) => n.tab).map(({ to, short, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${isActive ? 'text-brand-900' : 'text-slate-400'}`}>
              {({ isActive }) => (<>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-500" />}
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />{short}
              </>)}
            </NavLink>
          ))}
          <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-slate-400"><Menu size={20} />More</button>
        </div>
      </nav>
    </div>
  );
}