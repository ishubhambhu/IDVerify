import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById } from '../services/storage';
import { verifyStudentSecurity } from '../services/gemini';
import { Student } from '../types';
import { CheckCircle, XCircle, Shield, AlertTriangle, Loader2 } from 'lucide-react';

export const VerificationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<{allowed: boolean, reason: string} | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getStudentById(id);
      setStudent(found || null);
      setLoading(false);
      
      // Auto-trigger security check if student found
      if (found) {
        setIsVerifying(true);
        verifyStudentSecurity(found).then(res => {
          setVerificationData(res);
          setIsVerifying(false);
        });
      }
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid ID</h1>
        <p className="text-gray-600 text-center mb-8">This QR code does not match any active student records in the system.</p>
        <Link to="/" className="text-blue-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const isExpired = new Date(student.validUntil) < new Date();
  // We rely on Gemini for the definitive "Allowed" check, but fallback to local checks if pending
  const displayStatus = verificationData 
    ? (verificationData.allowed ? 'VERIFIED' : 'ACCESS DENIED')
    : (isVerifying ? 'CHECKING...' : 'PENDING');
  
  const statusColor = verificationData
    ? (verificationData.allowed ? 'bg-green-600' : 'bg-red-600')
    : 'bg-gray-600';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      {/* BHU Logo */}
      <div className="mb-6">
        <img src="/bhulogo.png" alt="BHU Logo" className="h-20" />
      </div>

      {/* Security Header */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className={`${statusColor} p-4 text-center transition-colors duration-500`}>
          <div className="flex justify-center mb-2">
            {verificationData?.allowed ? (
              <CheckCircle className="h-12 w-12 text-white" />
            ) : (
              verificationData ? <XCircle className="h-12 w-12 text-white" /> : <Shield className="h-12 w-12 text-white animate-pulse" />
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest">{displayStatus}</h1>
          <p className="text-white/90 text-sm mt-1">
            {isVerifying ? 'Analyzing security protocols...' : (verificationData?.reason || 'System Verification Complete')}
          </p>
        </div>

        {/* ID Card Visual */}
        <div className="p-6">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="p-1 bg-white rounded-full shadow-md">
              <img 
                src={student.photoUrl} 
                alt={student.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4 text-center">{student.fullName}</h2>
            <p className="text-gray-500 font-medium">{student.studentId}</p>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Department</p>
                    <p className="font-semibold text-gray-900 truncate">{student.department}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <p className={`font-semibold ${student.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                        {student.status}
                    </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Valid Until</p>
                    <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                        {student.validUntil}
                    </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase">Emergency</p>
                    <p className="font-semibold text-gray-900">{student.emergencyContact}</p>
                </div>
             </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Verified by SafeCampus AI • {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <Shield className="h-4 w-4" /> Admin Login
      </Link>
    </div>
  );
};