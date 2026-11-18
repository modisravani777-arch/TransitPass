import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import api, { errMsg } from '../../api';
import { useAuth, useToast } from '../../context';
import { Avatar, ErrorText, Field, PageHeader } from '../../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file); setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    const fd = new FormData();
    fd.append('name', form.name); fd.append('phone', form.phone);
    if (photo) fd.append('photo', photo);
    try { setUser((await api.put('/users/profile', fd)).data.user); setPhoto(null); toast('Profile saved'); }
    catch (err) { setError(errMsg(err)); }
    setBusy(false);
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your details up to date." />
      <form onSubmit={save} className="card max-w-2xl space-y-6 p-6 sm:p-8">
        <ErrorText>{error}</ErrorText>
        <div className="flex items-center gap-5">
          {preview ? <img src={preview} alt="New profile" className="h-24 w-24 rounded-full object-cover" /> : <Avatar name={user.name} photo={user.photo} size={96} />}
          <div>
            <label className="btn-ghost btn-sm cursor-pointer"><Camera size={15} />Change photo<input type="file" accept="image/*" className="hidden" onChange={pick} /></label>
            <p className="mt-2 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB.</p>
          </div>
        </div>
        <Field label="Full name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Phone"><input className="input" required inputMode="numeric" maxLength={10} pattern="\d{10}" title="10 digit phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Email" hint="Your email is your login and can't be changed."><input className="input bg-surface text-slate-500" value={user.email} disabled /></Field>
        <button className="btn-primary" disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : 'Save changes'}</button>
      </form>
    </>
  );
}
