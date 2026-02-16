import React, { useState, useEffect } from 'react';
import { Plus, Search, FileJson, Download, Trash2, Edit2, QrCode, X, ExternalLink, CheckSquare, Square } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui/Button';
import { Employee } from '../../types';
import { getEmployees, deleteEmployee, addEmployee, updateEmployee } from '../../utils/firestore';
import EmployeeForm from './EmployeeForm';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [viewQr, setViewQr] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const employeesData = await getEmployees();
    setEmployees(employeesData);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEmployee(id);
    refreshData();
  };

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleMultipleDelete = async () => {
    for (const id of selectedEmployees) {
      await deleteEmployee(id);
    }
    setSelectedEmployees([]);
    refreshData();
    setShowDeleteModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Handle different JSON formats
      let employees = [];
      
      if (Array.isArray(jsonData)) {
        // Direct array of employees
        employees = jsonData.map((item: any) => ({
          name: item.name || item.Name || 'Unknown',
          empNumber: item.empNumber || item.employeeId || item.id || `EMP${Math.floor(Math.random() * 10000)}`,
          designation: item.designation || item.Designation || item.role || item.Role || 'Staff',
          department: item.department || item.Department || 'General',
          validTill: item.validTill || item.validUntil || item.expiry || item.validTill || '2025-12-31',
          photo: '',
          customFields: []
        }));
      } else if (jsonData.employees && Array.isArray(jsonData.employees)) {
        // Nested structure with employees array
        employees = jsonData.employees.map((item: any) => ({
          name: item.name || item.Name || 'Unknown',
          empNumber: item.empNumber || item.employeeId || item.id || `EMP${Math.floor(Math.random() * 10000)}`,
          designation: item.designation || item.Designation || item.role || item.Role || 'Staff',
          department: item.department || item.Department || 'General',
          validTill: item.validTill || item.validUntil || item.expiry || item.validTill || '2025-12-31',
          photo: '',
          customFields: []
        }));
      } else {
        alert('Invalid JSON format. Please provide an array of employees or an object with an "employees" array.');
        return;
      }
      
      if (employees.length === 0) {
        alert('No employee data found in JSON file.');
        return;
      }

      // Add each employee to Firestore
      for (const employee of employees) {
        await addEmployee(employee);
      }
      
      refreshData();
      alert(`Successfully imported ${employees.length} employees from JSON.`);
    } catch (error) {
      console.error('Error processing JSON:', error);
      alert('Error processing JSON. Please ensure it contains valid employee data in JSON format.');
    }
    
    e.target.value = '';
  };

  const extractEmployeeDataFromPDF = (lines: string[]) => {
    const employees = [];
    let currentEmployee: any = {};
    
    // Skip header lines and look for employee data
    let employeeStarted = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip headers and empty lines
      if (line.includes('Name') && line.includes('Designation') && line.includes('Department')) {
        employeeStarted = true;
        continue;
      }
      
      if (!employeeStarted || line === '' || line === '---' || line.includes('Total')) {
        continue;
      }
      
      // Parse employee data in tabular format
      // Expected format: "Name Designation Department Valid Till"
      const parts = line.split(/\s{2,}/); // Split by 2+ spaces
      
      if (parts.length >= 3) {
        // Extract name (first part until we find what looks like a designation)
        let name = parts[0];
        let designation = '';
        let department = '';
        let validTill = '';
        
        // Try to identify the parts based on common patterns
        if (parts.length === 4) {
          // Format: Name | Designation | Department | Valid Till
          name = parts[0];
          designation = parts[1];
          department = parts[2];
          validTill = parts[3];
        } else if (parts.length === 3) {
          // Format: Name | Designation | Department (Valid Till might be missing)
          name = parts[0];
          designation = parts[1];
          department = parts[2];
          validTill = '2025-12-31'; // Default
        } else {
          // Try to parse more complex format
          // Look for date pattern (YYYY-MM-DD or DD-MM-YYYY)
          const datePattern = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/;
          let dateIndex = -1;
          
          for (let j = 0; j < parts.length; j++) {
            if (datePattern.test(parts[j])) {
              dateIndex = j;
              break;
            }
          }
          
          if (dateIndex > 0) {
            validTill = parts[dateIndex];
            department = parts[dateIndex - 1] || 'General';
            designation = parts[1] || 'Staff';
            name = parts[0];
          } else {
            // Fallback: assume first 3 parts are name, designation, department
            name = parts[0] || 'Unknown';
            designation = parts[1] || 'Staff';
            department = parts[2] || 'General';
            validTill = '2025-12-31';
          }
        }
        
        // Clean up the data
        name = name.replace(/^\d+\s*/, '').trim(); // Remove leading numbers
        designation = designation.trim();
        department = department.trim();
        validTill = validTill.trim();
        
        // Generate employee ID if not present
        const empNumber = `EMP${Math.floor(Math.random() * 10000)}`;
        
        employees.push({
          name: name || 'Unknown',
          empNumber: empNumber,
          designation: designation || 'Staff',
          department: department || 'General',
          validTill: validTill || '2025-12-31',
          photo: '',
          customFields: []
        });
      }
    }
    
    return employees;
  };

  const createEmployeeFromData = (data: any) => {
    return {
      name: data.name || 'Unknown',
      empNumber: data.empNumber || `EMP${Math.floor(Math.random() * 10000)}`,
      designation: data.designation || 'Staff',
      department: data.department || 'General',
      validTill: data.validTill || '2025-12-31',
      photo: '',
      customFields: []
    };
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
           {selectedEmployees.length > 0 && (
             <Button 
               variant="destructive" 
               onClick={() => setShowDeleteModal(true)}
               className="bg-red-600 hover:bg-red-700"
             >
               Delete Selected ({selectedEmployees.length})
             </Button>
           )}
           <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <Button variant="secondary" icon={<FileJson size={16} />}>Import JSON</Button>
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
                     <th className="px-6 py-4 w-12">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                     </th>
                     <th className="px-6 py-4">Employee</th>
                     <th className="px-6 py-4">Employee Number</th>
                     <th className="px-6 py-4">Department</th>
                     <th className="px-6 py-4">Valid Until</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No employees found. Add one or import from JSON.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  checked={selectedEmployees.includes(emp.id)}
                                  onChange={() => handleSelectEmployee(emp.id)}
                                />
                              </div>
                            </td>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Selected Employees</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleMultipleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete {selectedEmployees.length} {selectedEmployees.length > 1 ? 'Employees' : 'Employee'}
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
