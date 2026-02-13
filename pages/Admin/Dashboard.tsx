import React, { useState, useEffect } from 'react';
import { Plus, Search, FileSpreadsheet, Download, Trash2, Edit2, QrCode, X, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import { Button } from '../../components/ui/Button';
import { Employee } from '../../types';
import { getEmployees, deleteEmployee, saveEmployees } from '../../utils/storage';
import EmployeeForm from './EmployeeForm';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [viewQr, setViewQr] = useState<Employee | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEmployees(getEmployees());
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      refreshData();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const csvData = evt.target?.result;
      if (typeof csvData === 'string') {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;

            // Map CSV data to employee structure
            const newEmployees: Employee[] = data.map((row: any) => ({
              id: crypto.randomUUID(),
              name: row['Name'] || row['name'] || 'Unknown',
              empNumber: row['Employment Number'] || row['empNumber'] || String(Math.floor(Math.random() * 10000)),
              designation: row['Designation'] || row['designation'] || 'Staff',
              department: row['Department'] || row['department'] || 'General',
              validTill: row['Valid Till'] || row['validTill'] || '2025-12-31',
              photo: '', 
              customFields: [],
              createdAt: Date.now()
            }));

            const current = getEmployees();
            saveEmployees([...newEmployees, ...current]);
            refreshData();
            alert(`Successfully imported ${newEmployees.length} employees.`);
          }
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.empNumber.includes(searchTerm) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadQRCode = (id: string, name: string) => {
      const svg = document.getElementById(`qr-svg-${id}`);
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      // Use Blob to handle SVG data
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Set higher resolution for download
        const size = 1024;
        canvas.width = size;
        canvas.height = size;
        
        if (ctx) {
            // Fill white background (crucial for JPEG)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, size, size);
            
            // Draw SVG onto canvas
            ctx.drawImage(img, 0, 0, size, size);
            
            // Convert to JPEG
            const jpgUrl = canvas.toDataURL("image/jpeg", 0.9);
            
            const downloadLink = document.createElement("a");
            downloadLink.href = jpgUrl;
            downloadLink.download = `${name.replace(/\s+/g, '_')}_QR.jpg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(url);
        }
      };
      
      img.src = url;
  };

  const getVerificationUrl = (id: string) => {
    return `${window.location.origin}${window.location.pathname}#/verify/${id}`;
  };

  const openVerificationPage = (id: string) => {
    window.open(getVerificationUrl(id), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
           <p className="text-gray-500">Manage ID cards and verification details</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="relative">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button variant="secondary" icon={<FileSpreadsheet size={16} />}>Import Excel</Button>
           </div>
           <Button icon={<Plus size={16} />} onClick={() => { setEditingEmployee(undefined); setIsFormOpen(true); }}>
             Add Employee
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="Search by name, ID, or department..." 
                 className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
               Showing {filteredEmployees.length} records
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                     <th className="px-6 py-4">Employee</th>
                     <th className="px-6 py-4">ID Number</th>
                     <th className="px-6 py-4">Department</th>
                     <th className="px-6 py-4">Valid Until</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No employees found. Add one or import from Excel.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                               <div 
                                 onClick={() => openVerificationPage(emp.id)}
                                 className="flex items-center gap-3 cursor-pointer group"
                               >
                                  <img 
                                    src={emp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`} 
                                    className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-200 group-hover:ring-2 ring-indigo-400 transition-all" 
                                    alt="" 
                                  />
                                  <div>
                                     <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{emp.name}</div>
                                     <div className="text-xs text-gray-400">{emp.designation}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-700">{emp.empNumber}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                  {emp.department}
                                </span>
                            </td>
                            <td className="px-6 py-4">{emp.validTill}</td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => setViewQr(emp)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View QR">
                                     <QrCode size={18} />
                                  </button>
                                  <button onClick={() => handleEdit(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                     <Edit2 size={18} />
                                  </button>
                                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                        </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {isFormOpen && (
        <EmployeeForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          initialData={editingEmployee}
          onSave={refreshData}
        />
      )}

      {viewQr && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative transform transition-all scale-100">
                <button onClick={() => setViewQr(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                   <X size={24} />
                </button>
                <div className="text-center">
                   <h3 className="text-xl font-bold text-gray-900 mb-1">{viewQr.name}</h3>
                   <p className="text-sm text-gray-500 mb-6 font-mono">{viewQr.empNumber}</p>
                   
                   {/* Modern QR Container */}
                   <div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 inline-block mb-6 relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none"></div>
                      <QRCodeSVG 
                        id={`qr-svg-${viewQr.id}`}
                        value={getVerificationUrl(viewQr.id)} 
                        size={200} 
                        level="L" 
                        fgColor="#000000"
                        bgColor="#ffffff"
                        includeMargin={false}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" onClick={() => openVerificationPage(viewQr.id)} icon={<ExternalLink size={16} />}>
                        Open Page
                      </Button>
                      <Button onClick={() => downloadQRCode(viewQr.id, viewQr.name)} icon={<Download size={16}/>}>
                        Save JPEG
                      </Button>
                   </div>
                   <div className="mt-3">
                      <Button variant="ghost" className="w-full text-gray-400 hover:text-gray-600" onClick={() => setViewQr(null)}>
                        Close
                      </Button>
                   </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;