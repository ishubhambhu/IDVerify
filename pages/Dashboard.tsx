import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, deleteStudent, saveStudentsFromExcel } from '../services/storage';
import { Student } from '../types';
import { Search, UserPlus, Edit2, Trash2, Eye, Upload } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      deleteStudent(id);
      setStudents(getStudents());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleProcessFile = () => {
    if (!file) {
      alert('Please upload a file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        try {
          const rows = (content as string).split('\n').map(row => row.split(','));
          saveStudentsFromExcel(rows);
          setStudents(getStudents()); // Refresh the student list
          alert('Students added successfully!');
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Failed to process the file. Please ensure it is a valid CSV.');
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    s.studentId.toLowerCase().includes(filter.toLowerCase()) ||
    s.department.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to SafeCampus</h1>
          <p className="text-gray-600 mt-2">Manage and verify employee records efficiently.</p>
        </div>
        <Link 
          to="/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-md transition"
        >
          <UserPlus className="h-5 w-5" />
          Add New Employee
        </Link>
      </header>

      <section className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Employees</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, department, or employee number..."
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="p-5 flex items-center gap-4">
              <img 
                src={student.photoUrl} 
                alt={student.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{student.fullName}</h3>
                <p className="text-sm text-gray-500">{student.department}</p>
                <p className="text-sm text-gray-500">{student.emplNo}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.status}
              </span>
              <div className="flex gap-2">
                <Link to={`/verify/${student.id}`} className="text-blue-600 hover:underline text-sm">Verify</Link>
                <Link to={`/edit/${student.id}`} className="text-indigo-600 hover:underline text-sm">Edit</Link>
              </div>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No employees found matching your criteria.
          </div>
        )}
      </section>
    </div>
  );
};