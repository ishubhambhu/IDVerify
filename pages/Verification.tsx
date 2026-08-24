import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Briefcase, LayoutGrid, ArrowDownToLine, Calendar, Check, AlertCircle, FileText } from 'lucide-react';
import { getEmployeeById } from '../utils/firestore';
import { Employee } from '../types';

const cleanIdString = (val: string): string => {
  if (!val) return '';
  let cleaned = decodeURIComponent(val).trim();
  // Strip trailing query parameters or hash segments
  cleaned = cleaned.split('?')[0].split('#')[0];
  // Strip .netlify.app if present
  cleaned = cleaned.replace(/\.netlify\.app.*$/i, '');
  // Strip userinfo prefix if @ exists
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@').pop() || '';
  }
  // Strip any leading slashes or path segments
  cleaned = cleaned.replace(/^.*\/+/, '').replace(/^\/+|\/+$/g, '').trim();
  return cleaned;
};

const Verification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        let extractedId = '';

        // 1. From route params
        if (id && id !== '*' && id !== 'verify') {
          extractedId = cleanIdString(id);
        }

        // 2. From search query parameters
        if (!extractedId) {
          const searchParams = new URLSearchParams(window.location.search || location.search);
          const qId = searchParams.get('id') || searchParams.get('verify') || searchParams.get('emp') || searchParams.get('key');
          if (qId) {
            extractedId = cleanIdString(qId);
          }
        }

        // 3. From window.location.hash
        if (!extractedId) {
          const hash = window.location.hash || '';
          if (hash.includes('/verify/')) {
            const hashParts = hash.split('/verify/');
            if (hashParts[1]) extractedId = cleanIdString(hashParts[1]);
          }
        }

        // 4. From window.location.pathname
        if (!extractedId) {
          const pathname = window.location.pathname || location.pathname || '';
          if (pathname.includes('/verify/')) {
            const pathParts = pathname.split('/verify/');
            if (pathParts[1]) extractedId = cleanIdString(pathParts[1]);
          }
        }

        // 5. From full URL
        if (!extractedId) {
          const href = window.location.href;
          if (href.includes('/verify/')) {
            const hrefParts = href.split('/verify/');
            if (hrefParts[1]) extractedId = cleanIdString(hrefParts[1]);
          }
        }

        if (extractedId) {
          let found = await getEmployeeById(extractedId);
          if (found) {
            setEmployee(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, location]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: 'radial-gradient(circle at 50% 35%, #cdb58a 0%, #a6895b 40%, #5d4320 80%, #30200c 100%)'
        }}
      >
        <div className="bg-[#faf5ea] rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full border border-[#ede5d0]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#780909] border-t-transparent mb-4"></div>
          <p className="text-[#561414] font-semibold text-center">Verifying Employee Record...</p>
        </div>
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
        style={{
          background: 'radial-gradient(circle at 50% 35%, #cdb58a 0%, #a6895b 40%, #5d4320 80%, #30200c 100%)'
        }}
      >
        <div className="bg-[#faf5ea] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl max-w-md w-full border border-[#ede5d0] text-center">
          {/* Header BHU Logo */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8dfcb] px-5 py-3 mx-auto max-w-[280px] mb-6 flex flex-col items-center justify-center">
            <img 
              src="/bhulogo.png" 
              alt="Banaras Hindu University" 
              className="h-12 w-auto object-contain"
            />
            <div className="text-[7.5px] font-bold tracking-wider text-gray-700 uppercase text-center mt-1">
              AN INSTITUTION OF NATIONAL IMPORTANCE ESTABLISHED BY AN ACT OF PARLIAMENT
            </div>
          </div>

          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle size={36} />
          </div>
          <h1 className="text-2xl font-bold text-[#561414] mb-2">Record Not Found</h1>
          <p className="text-[#7a604f] text-sm leading-relaxed">
            The employee ID or QR code scanned does not match any active verified records in the Banaras Hindu University database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-6 px-3 sm:px-6 md:py-12 md:px-8 flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at 50% 35%, #cbb58c 0%, #a48759 40%, #583f1d 80%, #2b1c09 100%)'
      }}
    >
      {/* Main Ivory Container Card */}
      <div className="bg-[#fbf7ed] rounded-[2.2rem] sm:rounded-[2.75rem] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-[#ede3cd] w-full max-w-[440px] md:max-w-4xl p-5 sm:p-8 md:p-10 transition-all">
        
        {/* Top BHU Logo Box */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-[#e8dfcb] px-5 py-2.5 max-w-[310px] w-full flex flex-col items-center justify-center">
            <img 
              src="/bhulogo.png" 
              alt="काशी हिन्दू विश्वविद्यालय / BANARAS HINDU UNIVERSITY" 
              className="h-11 sm:h-13 w-auto object-contain"
            />
            <div className="text-[7px] sm:text-[7.5px] font-bold tracking-wider text-gray-700 uppercase text-center mt-1 leading-tight">
              AN INSTITUTION OF NATIONAL IMPORTANCE ESTABLISHED BY AN ACT OF PARLIAMENT
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-[#541515] text-center mt-4 sm:mt-5 mb-5 sm:mb-8 tracking-tight font-serif sm:font-sans">
          Employee Verification
        </h1>

        {/* Responsive Content Grid: Mobile (stacked) / Desktop (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-stretch">
          
          {/* LEFT / TOP: Maroon Profile Card */}
          <div className="md:col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#7a0909] via-[#520404] to-[#7c1a05] rounded-[1.75rem] p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
            
            {/* Photo Box */}
            <div className="bg-[#fff9ef] rounded-2xl p-2.5 flex flex-col items-center justify-center aspect-[1.18/1] w-full max-w-[240px] mx-auto overflow-hidden shadow-inner">
              {employee.photo ? (
                <img 
                  src={employee.photo} 
                  alt={employee.name} 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-4 w-full h-full">
                  {/* Peach / tan circle badge */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f6caa0] shadow-sm mb-3"></div>
                  {/* NO DATA FOUND Text */}
                  <span className="text-[11px] sm:text-[12px] font-extrabold tracking-wider text-[#632415] uppercase font-serif">
                    NO DATA FOUND
                  </span>
                </div>
              )}
            </div>

            {/* Employee Name & Designation */}
            <div className="text-center mt-4 sm:mt-5">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide leading-snug">
                {employee.name}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#e5ad42] mt-1 tracking-wide">
                {employee.designation}
              </p>
            </div>

            {/* Bottom Dark Pill for Employee Number */}
            <div className="bg-[#380404]/75 border border-white/10 rounded-2xl py-3 px-4 mt-4 sm:mt-5 text-center shadow-inner">
              <p className="text-[10px] sm:text-[11px] font-bold text-[#e5ad42] tracking-widest uppercase">
                EMPLOYEE NUMBER
              </p>
              <p className="text-base sm:text-xl font-bold text-white tracking-wider mt-0.5">
                {employee.empNumber}
              </p>
            </div>
          </div>

          {/* RIGHT / BOTTOM: Details Section */}
          <div className="md:col-span-7 flex flex-col justify-between gap-3.5 sm:gap-4">
            
            {/* 2x2 Grid of Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              
              {/* Item 1: Employee Number */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#ede7d8]/90 flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#faf2e3] flex items-center justify-center shrink-0 text-[#966023]">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#88909e] uppercase truncate">
                    EMPLOYEE NUMBER
                  </p>
                  <p className="text-sm sm:text-[15px] font-bold text-[#1f2937] leading-snug mt-0.5 truncate">
                    {employee.empNumber}
                  </p>
                </div>
              </div>

              {/* Item 2: Department */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#ede7d8]/90 flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#faf2e3] flex items-center justify-center shrink-0 text-[#966023]">
                  <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#88909e] uppercase truncate">
                    DEPARTMENT
                  </p>
                  <p className="text-sm sm:text-[15px] font-bold text-[#1f2937] leading-snug mt-0.5 truncate">
                    {employee.department}
                  </p>
                </div>
              </div>

              {/* Item 3: Designation */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#ede7d8]/90 flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#faf2e3] flex items-center justify-center shrink-0 text-[#966023]">
                  <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#88909e] uppercase truncate">
                    DESIGNATION
                  </p>
                  <p className="text-sm sm:text-[15px] font-bold text-[#1f2937] leading-snug mt-0.5 truncate">
                    {employee.designation}
                  </p>
                </div>
              </div>

              {/* Item 4: Date of Superannuation */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#ede7d8]/90 flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#faf2e3] flex items-center justify-center shrink-0 text-[#966023]">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#88909e] uppercase truncate">
                    DATE OF SUPERANNUATION
                  </p>
                  <p className="text-sm sm:text-[15px] font-bold text-[#1f2937] leading-snug mt-0.5 truncate">
                    {employee.validTill}
                  </p>
                </div>
              </div>

              {/* Custom fields if present */}
              {employee.customFields && employee.customFields.map((field) => (
                <div key={field.id} className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#ede7d8]/90 flex items-center gap-3.5">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#faf2e3] flex items-center justify-center shrink-0 text-[#966023]">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#88909e] uppercase truncate">
                      {field.label}
                    </p>
                    <p className="text-sm sm:text-[15px] font-bold text-[#1f2937] leading-snug mt-0.5 truncate">
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}

            </div>

            {/* Bottom Verification Status Banner */}
            <div className="bg-[#fcf7e8] border border-[#f2e2b8] rounded-2xl p-4 sm:p-4.5 flex items-center gap-3.5 sm:gap-4 shadow-sm mt-1 sm:mt-2">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f7e6bd] flex items-center justify-center shrink-0 text-[#541515]">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-[17px] font-bold text-[#541515] leading-tight">
                  Verified Employee Record
                </h3>
                <p className="text-xs sm:text-[13px] text-[#7a604f] mt-0.5 leading-snug">
                  This employee record has been successfully verified.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Verification;
