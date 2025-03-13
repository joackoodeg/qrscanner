'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QrScanner  from 'qr-scanner';

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  let qrScanner: QrScanner | null = null;

  useEffect(() => {
    if (videoRef.current && scanning) {
      qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setQrResult(result.data);
          setScanning(false);
          qrScanner?.stop();
        },
        { returnDetailedScanResult: true }
      );
      qrScanner.start();
    }
    return () => qrScanner?.stop();
  }, [scanning]);

  return (
    <Card className="p-4 flex flex-col items-center">
      <CardContent className="flex flex-col items-center w-full">
        {qrResult ? (
          <div className="text-xl font-bold text-green-600">{qrResult}</div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-auto rounded-lg" autoPlay muted />
            <Button className="mt-4" onClick={() => setScanning(true)} disabled={scanning}>
              {scanning ? 'Escaneando...' : 'Iniciar Escaneo'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}