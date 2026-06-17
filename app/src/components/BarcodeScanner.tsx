import { useEffect, useRef, useState } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { closeOutline, imageOutline } from 'ionicons/icons';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import './BarcodeScanner.css';

// Scanner de código de barras (EAN/UPC etc.) — câmera ao vivo OU ler de uma foto da galeria.
// Tudo no aparelho (@zxing). O código lido alimenta o offBarcode() (Open Food Facts).
const BarcodeScanner: React.FC<{ open: boolean; onClose: () => void; onCode: (code: string) => void }> = ({ open, onClose, onCode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controls = useRef<IScannerControls | null>(null);
  const [msg, setMsg] = useState('');
  const getReader = () => (readerRef.current ??= new BrowserMultiFormatReader());

  const stop = () => { try { controls.current?.stop(); } catch { /* ok */ } controls.current = null; };
  const hit = (code: string) => { try { navigator.vibrate?.(80); } catch { /* ok */ } stop(); onCode(code); onClose(); };

  // câmera ao vivo (prefere a traseira) enquanto o modal está aberto
  useEffect(() => {
    if (!open) return;
    let done = false;
    setMsg('Aponte a câmera pro código de barras…');
    (async () => {
      try {
        controls.current = await getReader().decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          (result) => { if (result && !done) { done = true; hit(result.getText()); } },
        );
      } catch {
        setMsg('Sem acesso à câmera. Leia de uma foto da galeria. 👇');
      }
    })();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ler o código a partir de uma foto da galeria (não precisa de câmera)
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('Lendo o código na foto…');
    const url = URL.createObjectURL(file);
    try {
      const result = await getReader().decodeFromImageUrl(url);
      hit(result.getText());
    } catch {
      setMsg('Não achei código de barras nessa foto. Tente uma mais nítida/próxima.');
    } finally { URL.revokeObjectURL(url); e.target.value = ''; }
  };

  return (
    <IonModal isOpen={open} onDidDismiss={() => { stop(); onClose(); }} breakpoints={[0, 0.9]} initialBreakpoint={0.9} handle>
      <div className="bsc">
        <div className="bsc-top">
          <h2 className="bsc-h">Escanear código de barras</h2>
          <button className="bsc-close" onClick={() => { stop(); onClose(); }} aria-label="Fechar"><IonIcon icon={closeOutline} /></button>
        </div>
        <div className="bsc-video-wrap">
          <video ref={videoRef} className="bsc-video" autoPlay muted playsInline />
          <div className="bsc-frame" />
        </div>
        {msg && <p className="bsc-msg">{msg}</p>}
        <button className="ds-btn ds-btn--ghost bsc-gallery" onClick={() => fileRef.current?.click()}>
          <IonIcon icon={imageOutline} /> Ler de uma foto da galeria
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <p className="bsc-note">A imagem não sai do seu aparelho. Mesmo sem achar pelo código, dá pra completar na busca.</p>
      </div>
    </IonModal>
  );
};

export default BarcodeScanner;
