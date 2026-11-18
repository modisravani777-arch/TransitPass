import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import api, { errMsg, fmtDate } from '../../api';
import PassCard from '../../components/PassCard';
import { Empty, ErrorText, PageHeader, Skeleton, StatusBadge } from '../../components/ui';

export default function MyPass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/passes').then(({ data }) => {
      setList(data);
      const pick = id ? Number(id) : (data.find((p) => p.status === 'Active') || data[0])?.id;
      if (pick) return api.get(`/passes/${pick}`).then((r) => setPass(r.data));
    }).catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!list) return <Skeleton className="h-80" />;
  if (list.length === 0) return (
    <>
      <PageHeader title="My pass" />
      <div className="card"><Empty title="No pass issued yet" text="Your digital pass appears here once your application is approved and paid."><Link to="/app/applications" className="btn-primary">View applications</Link></Empty></div>
    </>
  );

  return (
    <>
      <PageHeader title="My digital pass" subtitle="Show the QR code when you board.">
        <button className="btn-primary" onClick={() => window.print()}><Printer size={16} />Download / Print Pass</button>
      </PageHeader>
      <div className="mx-auto max-w-3xl">
        {pass ? <div id="print-area"><PassCard pass={pass} /></div> : <Skeleton className="h-80" />}
        <p className="mt-4 text-center text-sm text-slate-500">Tip: choose “Save as PDF” in the print dialog to download your pass.</p>
      </div>

      {list.length > 1 && (
        <div className="mx-auto mt-10 max-w-3xl">
          <h2 className="mb-3 text-lg font-semibold">All your passes</h2>
          <div className="card divide-y divide-brand-100/70">
            {list.map((p) => (
              <button key={p.id} onClick={() => navigate(`/app/pass/${p.id}`)} className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-brand-50/60 ${pass?.id === p.id ? 'bg-brand-50/60' : ''}`}>
                <div className="min-w-0"><p className="truncate font-semibold">{p.pass_number}</p><p className="truncate text-sm text-slate-500">{p.route_name} · until {fmtDate(p.valid_until)}</p></div>
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
