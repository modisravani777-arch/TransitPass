import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import api, { errMsg, money } from '../../api';
import { useToast } from '../../context';
import { Empty, ErrorText, Field, Modal, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

// One reusable admin screen for both Routes and Pass types
function CatalogManager({ title, subtitle, noun, endpoint, fields, columns, blank, prepare }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null); // null = closed, object = form data
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => { api.get(`${endpoint}/admin/all`).then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, [endpoint]);
  useEffect(load, [load]);

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    const body = prepare({ ...edit, is_active: Number(edit.is_active) });
    try {
      if (edit.id) await api.put(`${endpoint}/${edit.id}`, body); else await api.post(endpoint, body);
      toast(`${noun} ${edit.id ? 'updated' : 'added'}`); setEdit(null); load();
    } catch (err) { setError(errMsg(err)); }
    setBusy(false);
  };

  const toggle = async (r) => {
    try {
      if (r.is_active) await api.delete(`${endpoint}/${r.id}`); else await api.put(`${endpoint}/${r.id}`, { is_active: 1 });
      toast(r.is_active ? `${noun} deactivated` : `${noun} activated`); load();
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}><button className="btn-primary" onClick={() => { setError(''); setEdit({ ...blank }); }}><Plus size={18} />Add {noun.toLowerCase()}</button></PageHeader>
      <div className="card overflow-hidden">
        {!rows && <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {rows?.length === 0 && <Empty title={`No ${noun.toLowerCase()}s yet`} text={`Add your first ${noun.toLowerCase()}.`} />}
        {rows?.length > 0 && (
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-brand-50/60"><tr>{[...columns.map((c) => c.label), 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-brand-100/70">
              {rows.map((r) => (
                <tr key={r.id} className={`transition hover:bg-brand-50/50 ${r.is_active ? '' : 'opacity-60'}`}>
                  {columns.map((c) => <td key={c.key} className="td">{c.render ? c.render(r) : r[c.key]}</td>)}
                  <td className="td"><StatusBadge status={r.is_active ? 'Active' : 'Inactive'} /></td>
                  <td className="td"><div className="flex gap-2">
                    <button className="btn-ghost btn-sm" onClick={() => { setError(''); setEdit({ ...r, is_active: String(r.is_active) }); }}><Pencil size={14} />Edit</button>
                    <button className={`btn-sm ${r.is_active ? 'btn-ghost text-red-600' : 'btn-accent'}`} onClick={() => toggle(r)}><Power size={14} />{r.is_active ? 'Deactivate' : 'Activate'}</button>
                  </div></td>
                </tr>
              ))}
            </tbody></table></div>
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}>
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <ErrorText>{error}</ErrorText>
            {fields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                <input className="input" type={f.type || 'text'} required={f.required !== false} min={f.type === 'number' ? 1 : undefined} step={f.type === 'number' ? 'any' : undefined}
                  placeholder={f.placeholder} value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />
              </Field>
            ))}
            <Field label="Status"><select className="input" value={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.value })}><option value="1">Active</option><option value="0">Inactive</option></select></Field>
            <div className="flex gap-3 pt-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button></div>
          </form>
        )}
      </Modal>
    </>
  );
}

export const AdminRoutes = () => (
  <CatalogManager title="Routes" subtitle="Bus routes students can choose when applying." noun="Route" endpoint="/routes"
    blank={{ name: '', source: '', destination: '', fare: '', is_active: '1' }}
    prepare={(b) => ({ ...b, name: b.name?.trim() || `${b.source} → ${b.destination}` })}
    fields={[
      { key: 'name', label: 'Route name', required: false, placeholder: 'Leave empty to use Source → Destination' },
      { key: 'source', label: 'Source', placeholder: 'Visakhapatnam' },
      { key: 'destination', label: 'Destination', placeholder: 'Madhurawada' },
      { key: 'fare', label: 'Single trip fare (₹)', type: 'number', placeholder: '30' },
    ]}
    columns={[{ key: 'name', label: 'Route name' }, { key: 'source', label: 'Source' }, { key: 'destination', label: 'Destination' }, { key: 'fare', label: 'Fare', render: (r) => money(r.fare) }]} />
);

export const AdminPassTypes = () => (
  <CatalogManager title="Pass types" subtitle="Durations and prices offered to students." noun="Pass type" endpoint="/pass-types"
    blank={{ name: '', duration_days: '', price: '', description: '', is_active: '1' }} prepare={(b) => b}
    fields={[
      { key: 'name', label: 'Name', placeholder: 'Student Monthly' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number', placeholder: '30' },
      { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '450' },
      { key: 'description', label: 'Description', required: false, placeholder: 'Who is this pass for?' },
    ]}
    columns={[{ key: 'name', label: 'Name' }, { key: 'duration_days', label: 'Duration', render: (r) => `${r.duration_days} days` }, { key: 'price', label: 'Price', render: (r) => money(r.price) }, { key: 'description', label: 'Description' }]} />
);
