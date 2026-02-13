import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Calendar, Building2, User, UserCheck, ShieldCheck } from 'lucide-react';
import { getEmployees } from '../utils/storage';
import { Employee } from '../types';

const Verification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      if (id) {
        const allEmployees = getEmployees();
        const found = allEmployees.find((e) => e.id === id);
        if (found) {
          setEmployee(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Verifying Credentials...</p>
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid ID</h1>
        <p className="text-center text-gray-600 max-w-md">
          The QR code scanned does not match any active employee records in our system.
        </p>
      </div>
    );
  }

  const isValid = new Date(employee.validTill) > new Date();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="flex justify-center mb-6">
        <img 
          src="bhulogo.png" 
          alt="BHU Logo" 
          className="w-48 h-48 object-contain"
        />
      </div>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all">
        {/* Status Banner */}
        <div className={`p-6 text-white text-center ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
           <div className="flex justify-center mb-2">
             {isValid ? <ShieldCheck className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
           </div>
           <h2 className="text-2xl font-bold tracking-wide">
             {isValid ? 'VERIFIED' : 'EXPIRED'}
           </h2>
           <p className="text-white/80 text-sm mt-1" style={{ fontSize: '0.875rem', lineHeight: '4.25rem', marginTop: '-1.75rem' }}>
             {isValid ? 'Identity Confirmed' : 'Identity No Longer Valid'}
           </p>
        </div>

        <div className="relative -mt-10 flex justify-center">
            <div className="p-4 bg-white rounded-full shadow-lg">
                <img 
                    src={employee.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=200`} 
                    alt={employee.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white bg-gray-200"
                />
            </div>
        </div>

        <div className="px-8 pb-8 pt-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-indigo-600 font-medium">{employee.designation}</p>
            
            <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <UserCheck className="text-indigo-500 w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Employee ID</p>
                        <p className="font-semibold text-gray-900">{employee.empNumber}</p>
                    </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <Building2 className="text-indigo-500 w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Department</p>
                        <p className="font-semibold text-gray-900">{employee.department}</p>
                    </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <Calendar className="text-indigo-500 w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Valid Until</p>
                        <p className="font-semibold text-gray-900">{new Date(employee.validTill).toLocaleDateString('en-GB')}</p>
                    </div>
                </div>

                {employee.customFields.map((field) => (
                    <div key={field.id} className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                            <User className="text-indigo-500 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{field.label}</p>
                            <p className="font-semibold text-gray-900">{field.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Verified by IDVerify Pro System.
                    <br />
                    Scan date: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
