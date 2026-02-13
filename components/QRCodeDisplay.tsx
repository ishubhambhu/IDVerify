import React from 'react';

interface QRCodeDisplayProps {
  studentId: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ studentId, size = 150 }) => {
  // Construct the verification URL based on current origin
  const baseUrl = window.location.origin + window.location.pathname;
  const verificationUrl = `${baseUrl}#/verify/${studentId}`;
  
  // Using a reliable public API for QR generation to avoid heavy dependencies in this simplified environment
  // In a real production app, we would use a library like 'qrcode.react'
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <img 
        src={qrApiUrl} 
        alt="Student QR Code" 
        className="block"
        style={{ width: size, height: size }}
        loading="lazy"
      />
      <p className="mt-2 text-xs text-gray-400 font-mono text-center break-all max-w-[200px]">
        ID: {studentId}
      </p>
    </div>
  );
};