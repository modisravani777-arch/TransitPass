import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import QRScanner, { extractPassNumber } from '../../components/QRScanner';

export default function VerifyPass() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [number, setNumber] = useState('');

  // Both a QR scan and a typed number open the pass-details page
  const go = (text) => {
    const num = extractPassNumber(text);
    if (num) navigate(`/verify/${encodeURIComponent(num)}`);
  };
  const verify = (e) => { e.preventDefault(); go(number); };

  return (
    <>
      <PageHeader title="Verify bus pass" subtitle="Scan the QR code on the pass, or enter the pass number manually." />
      <div className="card mb-4 max-w-2xl p-5"><QRScanner onScan={go} autoStart={!!state?.autoStart} /></div>
      <form onSubmit={verify} className="card mb-6 flex max-w-2xl flex-col gap-3 p-5 sm:flex-row">
        <input className="input flex-1 font-semibold uppercase tracking-wide" required placeholder="TP-2026-100001" value={number} onChange={(e) => setNumber(e.target.value)} />
        <button className="btn-primary"><ShieldCheck size={18} />Verify</button>
      </form>
    </>
  );
}