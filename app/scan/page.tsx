"use client";

import { useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle } from "lucide-react";

export default function QRScannerPage() {
  const [scannedResult, setScannedResult] = useState<string>("");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    try {
      // Solicitar permisos de la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Detener la cámara hasta que inicie el escáner

      setCameraActive(true);
      setPermissionDenied(false);

      if (!scanner && scannerRef.current) {
        const qrScanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
          },
          false
        );

        qrScanner.render(
          (decodedText: string) => {
            setScannedResult(decodedText);
            // No detiene el escáner automáticamente para permitir escaneos múltiples
          },
          (errorMessage: string) => {
            console.warn("QR Error:", errorMessage);
          }
        );

        setScanner(qrScanner);
      }
    } catch (error) {
      console.warn("No se pudo acceder a la cámara:", error);
      setPermissionDenied(true);
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setCameraActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-center">Escáner de Código QR</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-4">
          {cameraActive ? (
            <>
              <div id="qr-reader" ref={scannerRef} className="w-full max-w-sm rounded-lg overflow-hidden"></div>
              <Button onClick={stopScanner} variant="destructive" className="w-full mt-2">
                Detener Cámara
              </Button>
            </>
          ) : (
            <Button onClick={startScanner} className="w-full bg-blue-500 hover:bg-blue-600">
              <Camera className="h-5 w-5 mr-2" /> Iniciar Cámara
            </Button>
          )}

          {permissionDenied && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm w-full">
              Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración de tu navegador.
            </div>
          )}

          {scannedResult && (
            <div className="mt-4 w-full">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <span className="font-semibold text-lg">¡Código escaneado!</span>
              </div>
              <Card className="w-full bg-green-50 border border-green-200">
                <CardContent className="p-3">
                  <p className="text-center break-words">{scannedResult}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}