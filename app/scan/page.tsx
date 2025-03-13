"use client";

import { useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Camera, Settings } from "lucide-react";

export default function ScanAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [scannedUser, setScannedUser] = useState<{ name: string; status: string } | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

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
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        qrScanner.render(
          (decodedText) => {
            setLoading(true);
            setTimeout(() => {
              setScannedUser({ name: decodedText, status: "Asistencia Confirmada" });
              setLoading(false);
              qrScanner.clear();
              setCameraActive(false);
            }, 2000);
          },
          (errorMessage) => {
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

  const openAppSettings = () => {
    if (typeof window !== "undefined" && window.navigator) {
      window.location.href = "app-settings:";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-4 bg-white rounded-lg flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">Procesando...</p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Escanear Asistencia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {cameraActive ? (
            <div id="qr-reader" ref={scannerRef} className="w-full h-60 bg-gray-300 rounded-lg"></div>
          ) : (
            <>
              <Button onClick={startScanner} className="w-full">
                <Camera className="h-5 w-5 mr-2" /> Activar Cámara
              </Button>
              {permissionDenied && (
                <Button onClick={openAppSettings} variant="outline" className="w-full">
                  <Settings className="h-5 w-5 mr-2" /> Habilitar Permisos
                </Button>
              )}
            </>
          )}

          {scannedUser ? (
            <div className="flex flex-col items-center gap-2 text-center">
              {scannedUser.status === "Asistencia Confirmada" ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              <p className="text-lg font-semibold">{scannedUser.name}</p>
              <p className="text-sm text-gray-500">{scannedUser.status}</p>
            </div>
          ) : (
            cameraActive && <p className="text-gray-500 text-center">Apunta la cámara al código QR del asistente</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
