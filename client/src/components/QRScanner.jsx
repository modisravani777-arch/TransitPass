import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, Flashlight, ImageUp, Loader2, SwitchCamera } from 'lucide-react';

const REGION_ID = 'qr-scanner-region';
const LAST_CAM_KEY = 'tp_last_camera';

// Pull the pass number (e.g. TP-2026-100001) out of whatever the QR contains (plain number or URL/text containing it)
export function extractPassNumber(text) {
  const t = String(text || '').trim();
  const m = t.match(/TP-\d{4}-\d+/i);
  return (m ? m[0] : t).toUpperCase();
}

function cameraError(err) {
  const msg = String(err?.message || err || '');
  if (!window.isSecureContext) return 'Camera needs HTTPS (or localhost). Use "Upload QR image" instead, or open the site over HTTPS.';
  if (/NotAllowed|Permission/i.test(msg)) return 'Camera permission was denied. Allow camera access in your browser and try again.';
  if (/NotFound|Devices not found|no camera/i.test(msg)) return 'No camera found on this device. Use "Upload QR image" instead.';
  if (/NotReadable|in use/i.test(msg)) return 'Camera is busy in another app or tab. Close it and try again.';
  return 'Could not start the camera. You can upload a QR image instead.';
}

const lsGet = () => { try { return localStorage.getItem(LAST_CAM_KEY) || ''; } catch { return ''; } };
const lsSet = (v) => { try { localStorage.setItem(LAST_CAM_KEY, v); } catch { /* ignore */ } };

// Cameras whose label suggests a rear lens, ordered so the main lens comes first (ultra-wide / tele / depth last)
function sortCameras(list) {
  const score = (c) => {
    const l = (c.label || '').toLowerCase();
    let s = 0;
    if (/back|rear|environment/.test(l)) s -= 10;
    if (/front|user|face/.test(l)) s += 10;
    if (/ultra|wide|tele|depth|macro/.test(l)) s += 3;
    return s;
  };
  return [...list].sort((a, b) => score(a) - score(b));
}

/**
 * Camera + image-file QR scanner that works with any lens (front/back/ultra-wide/webcam).
 * onScan(text) is called once per successful decode; the camera stops automatically afterwards.
 */
export default function QRScanner({ onScan, disabled, autoStart = false }) {
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const fileRef = useRef(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [camId, setCamId] = useState('');
  const [caps, setCaps] = useState({ zoom: null, torch: false });
  const [zoom, setZoom] = useState(1);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  const stop = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try { if (s.isScanning) await s.stop(); } catch { /* already stopped */ }
      try { s.clear(); } catch { /* ignore */ }
    }
    setActive(false); setTorchOn(false); setZoom(1); setCaps({ zoom: null, torch: false });
  };

  // Always release the camera when leaving the page
  useEffect(() => () => { stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const makeScanner = (id) => new Html5Qrcode(id, {
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    experimentalFeatures: { useBarCodeDetectorIfSupported: true }, // native, faster & more tolerant decoder when the browser has it
    verbose: false,
  });

  const scanConfig = {
    fps: 15,
    // no qrbox: the whole frame is scanned, so the QR can be at any distance/position
    disableFlip: false,
    videoConstraints: {
      width: { ideal: 1920 }, height: { ideal: 1080 },
      advanced: [{ focusMode: 'continuous' }],
    },
  };

  const readCaps = (scanner) => {
    try {
      const c = scanner.getRunningTrackCapabilities?.() || {};
      setCaps({ zoom: c.zoom ? { min: c.zoom.min, max: c.zoom.max, step: c.zoom.step || 0.1 } : null, torch: !!c.torch });
      if (c.zoom) setZoom(c.zoom.min ?? 1);
    } catch { /* unsupported */ }
  };

  // Try a list of camera "sources" in order until one starts: chosen id → facingMode environment → any camera
  const startWith = async (preferredId) => {
    const onDecode = (text) => { stop(); onScanRef.current?.(text); };
    const sources = [];
    if (preferredId) sources.push({ deviceId: { exact: preferredId } });
    sources.push({ facingMode: 'environment' }, { facingMode: 'user' }, true);
    let lastErr;
    for (const src of sources) {
      const scanner = makeScanner(REGION_ID);
      scannerRef.current = scanner;
      try {
        await scanner.start(src === true ? { facingMode: { ideal: 'environment' } } : src, scanConfig, onDecode, () => {});
        readCaps(scanner);
        return;
      } catch (err) {
        lastErr = err;
        try { scanner.clear(); } catch { /* ignore */ }
        scannerRef.current = null;
        if (/NotAllowed|Permission/i.test(String(err?.message || err))) break; // no point retrying
      }
    }
    throw lastErr;
  };

  const start = async (preferredId = camId || lsGet()) => {
    setError(''); setStarting(true); setActive(true);
    await stop().catch(() => {});
    setActive(true);
    await new Promise((r) => setTimeout(r, 60)); // let the target <div> mount
    try {
      await startWith(preferredId);
      // After permission is granted, device labels are available → build the lens list
      try {
        const list = sortCameras(await Html5Qrcode.getCameras());
        setCameras(list);
        const trackId = scannerRef.current?.getRunningTrackSettings?.().deviceId;
        const chosen = list.find((c) => c.id === trackId)?.id || list.find((c) => c.id === preferredId)?.id || list[0]?.id || '';
        setCamId(chosen);
        if (chosen) lsSet(chosen);
      } catch { /* listing is optional */ }
    } catch (err) {
      scannerRef.current = null;
      setActive(false);
      setError(cameraError(err));
    }
    setStarting(false);
  };

  // "Scan next pass" from the result page reopens the camera straight away
  useEffect(() => {
    if (!autoStart) return undefined;
    const t = setTimeout(() => { start(); }, 150);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchCamera = async (id) => { setCamId(id); lsSet(id); await start(id); };
  const nextCamera = () => {
    if (cameras.length < 2) return;
    const i = cameras.findIndex((c) => c.id === camId);
    switchCamera(cameras[(i + 1) % cameras.length].id);
  };

  const applyZoom = async (val) => {
    setZoom(val);
    try { await scannerRef.current?.applyVideoConstraints({ advanced: [{ zoom: val }] }); } catch { /* ignore */ }
  };
  const toggleTorch = async () => {
    const next = !torchOn;
    try { await scannerRef.current?.applyVideoConstraints({ advanced: [{ torch: next }] }); setTorchOn(next); } catch { /* ignore */ }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    await stop();
    // scanFile needs a mounted element id, even if hidden
    const scanner = makeScanner('qr-file-region');
    try {
      const text = await scanner.scanFile(file, false);
      onScanRef.current?.(text);
    } catch {
      setError('No QR code found in that image. Try a clearer, closer photo.');
    }
    try { scanner.clear(); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {active
          ? <button type="button" className="btn-ghost" onClick={stop}><CameraOff size={18} />Stop camera</button>
          : <button type="button" className="btn-accent" onClick={() => start()} disabled={disabled || starting}>
              {starting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}Scan QR with camera
            </button>}
        <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={disabled}><ImageUp size={18} />Upload QR image</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      {active && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-brand-100 bg-brand-950">
          <div id={REGION_ID} className="w-full" />
          <div className="flex flex-col gap-3 px-4 py-3 text-white/80">
            <p className="text-center text-xs text-white/70">Point any camera at the QR code — hold steady, it scans automatically</p>

            {cameras.length > 1 && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={nextCamera} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20" title="Switch camera"><SwitchCamera size={18} /></button>
                <select value={camId} onChange={(e) => switchCamera(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-brand-900 px-3 py-2 text-xs text-white outline-none">
                  {cameras.map((c, i) => <option key={c.id} value={c.id}>{c.label || `Camera ${i + 1}`}</option>)}
                </select>
              </div>
            )}

            {(caps.zoom || caps.torch) && (
              <div className="flex items-center gap-3">
                {caps.zoom && (
                  <label className="flex min-w-0 flex-1 items-center gap-2 text-xs">Zoom
                    <input type="range" className="min-w-0 flex-1 accent-teal-400" min={caps.zoom.min} max={caps.zoom.max} step={caps.zoom.step} value={zoom} onChange={(e) => applyZoom(Number(e.target.value))} />
                  </label>
                )}
                {caps.torch && (
                  <button type="button" onClick={toggleTorch} className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${torchOn ? 'bg-amber-400 text-brand-950' : 'bg-white/10 hover:bg-white/20'}`} title="Torch"><Flashlight size={18} /></button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div id="qr-file-region" className="hidden" />
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">{error}</p>}
    </div>
  );
}