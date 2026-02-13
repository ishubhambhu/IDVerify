import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentById, saveStudent } from '../services/storage';
import { Student, StudentStatus } from '../types';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Upload, Save, ArrowLeft, Camera, X } from 'lucide-react';

// Helper to resize images to avoid LocalStorage limits
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Return as JPEG with 0.8 quality for good compression
             resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
            resolve(e.target?.result as string); // Fallback
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const StudentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Student>({
    id: crypto.randomUUID(),
    fullName: '',
    designation: '',
    studentId: '',
    department: '',
    contactNo: '',
    emplNo: '',
    dob: '',
    validUntil: '',
    permanentAddress: '',
    email: '',
    photoUrl: 'https://picsum.photos/200/300', // Default placeholder
    status: StudentStatus.Active,
    emergencyContact: ''
  });

  

  useEffect(() => {
    if (id) {
      const existing = getStudentById(id);
      if (existing) {
        setFormData(existing);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Please upload a valid image file.");
            return;
        }
        
        try {
            const resized = await resizeImage(file, 300, 300);
            setFormData(prev => ({ ...prev, photoUrl: resized }));
        } catch (err) {
            console.error("Image processing failed", err);
            alert("Could not process image.");
        }
    }
  };

  // AI generation removed for simplified editor

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate save delay
    setTimeout(() => {
      const toSave: Student = {
        ...formData,
        studentId: (formData as any).emplNo || formData.studentId,
        fullName: formData.fullName || (formData as any).designation || (formData as any).emplNo || '',
      } as Student;
      saveStudent(toSave);
      setIsLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              {id ? 'Edit Student' : 'New Registration'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Lecturer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Number</label>
                  <input
                    type="text"
                    name="emplNo"
                    required
                    value={formData.emplNo || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. EMP12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Till</label>
                  <input
                    type="date"
                    name="validUntil"
                    required
                    value={formData.validUntil || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* AI helper removed for simplified editor */}

              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 flex items-center gap-2 disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview & Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Photo</h3>
            
            {/* Photo Upload Area */}
            <div 
                className="relative group w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-gray-100 shadow-inner bg-gray-50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
              <img 
                src={formData.photoUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all flex flex-col items-center justify-center text-white">
                <Camera className="h-8 w-8 mb-1 opacity-90" />
                <span className="text-xs font-medium opacity-90">Change Photo</span>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload New
                </button>
                {formData.photoUrl.includes('base64') && (
                     <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, photoUrl: 'https://picsum.photos/200/300'}))}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Reset to default"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            <p className="text-xs text-gray-400 mt-3 text-center">
                Supports JPG, PNG. Images are resized for optimization.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Digital Pass</h3>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs opacity-75 uppercase tracking-wider">Student ID</p>
                        <p className="font-mono font-bold">{formData.studentId || '#####'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xs font-bold">EDU</span>
                    </div>
                </div>
                <div className="flex gap-3 items-center mb-4">
                     <img src={formData.photoUrl} className="w-12 h-12 rounded-lg bg-gray-200 object-cover border border-white/30" alt="" />
                     <div>
                         <p className="font-bold text-sm leading-tight">{formData.fullName || 'Student Name'}</p>
                         <p className="text-xs opacity-80">{formData.department || 'Department'}</p>
                     </div>
                </div>
                <div className="bg-white p-2 rounded-lg flex justify-center">
                    {/* Placeholder for QR in preview */}
                    <div className="h-10 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        QR Code Generated on Save
                    </div>
                </div>
            </div>
            {id && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Live QR Code</h4>
                    <QRCodeDisplay studentId={formData.id} />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};