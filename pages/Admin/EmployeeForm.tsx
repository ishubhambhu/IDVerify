import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash, Save, Crop } from 'lucide-react';
import { Employee } from '../../types';
import { addEmployee, updateEmployee } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DateInput } from '../../components/ui/DateInput';
import { ImageCropper } from '../../components/ui/ImageCropper';
import { resizeImage } from '../../utils/image';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Employee;
  onSave: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    empNumber: '',
    designation: '',
    department: '',
    validTill: '',
    photo: '',
    customFields: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        empNumber: '',
        designation: '',
        department: '',
        validTill: '',
        photo: '',
        customFields: []
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, validTill: value }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            // Resize to a reasonable max width to avoid huge payloads, 
            // but keep it large enough for cropping (e.g., 800px)
            const resized = await resizeImage(file, 800);
            setFormData(prev => ({ ...prev, photo: resized }));
        } catch (err) {
            console.error("Image processing error", err);
        }
    }
    e.target.value = '';
  };

  const openCropper = () => {
    if (formData.photo) {
        setCropImageSrc(formData.photo);
    }
  };

  const handleCropComplete = (croppedBase64: string) => {
      setFormData(prev => ({ ...prev, photo: croppedBase64 }));
      setCropImageSrc(null);
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { id: crypto.randomUUID(), label: '', value: '' }]
    }));
  };

  const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.map(field => field.id === id ? { ...field, [key]: val } : field)
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.filter(field => field.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const employeeData = {
        ...formData,
        id: initialData?.id || crypto.randomUUID(),
        createdAt: initialData?.createdAt || Date.now(),
        validTill: formData.validTill || new Date().toISOString().split('T')[0] // Fallback
      } as Employee;

      if (initialData) {
        updateEmployee(employeeData);
      } else {
        addEmployee(employeeData);
      }
      
      setIsLoading(false);
      onSave();
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Centered Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Profile' : 'Add New Employee'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center">
               <div className="relative w-32 h-32 mb-3">
                  <div className="group relative w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-lg bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 cursor-pointer">
                     {formData.photo ? (
                       <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                       <div className="flex flex-col items-center text-gray-400">
                         <div className="bg-gray-200 p-3 rounded-full mb-1">
                            <Upload size={20} />
                         </div>
                         <span className="text-[10px] font-medium uppercase tracking-wide">Upload</span>
                       </div>
                     )}
                     
                     {/* Overlay for upload */}
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                         <span className="text-white font-medium text-xs flex items-center gap-1">
                            <Upload size={14} /> Change
                         </span>
                     </div>
                     <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handlePhotoSelect}
                     />
                  </div>

                  {/* Manual Crop Button - Only visible if photo exists */}
                  {formData.photo && (
                    <button 
                        type="button"
                        onClick={openCropper}
                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-20 border-2 border-white"
                        title="Crop Image"
                    >
                        <Crop size={16} />
                    </button>
                  )}
               </div>
               <p className="text-xs text-gray-400 font-medium">Supported formats: JPG, PNG</p>
            </div>

            <div className="space-y-5">
               <Input 
                 label="Full Name" 
                 name="name" 
                 required 
                 value={formData.name} 
                 onChange={handleInputChange} 
                 placeholder="e.g. Sarah Connor"
               />
               
               <div className="grid grid-cols-2 gap-5">
                 <Input 
                   label="Employee ID" 
                   name="empNumber" 
                   required 
                   value={formData.empNumber} 
                   onChange={handleInputChange} 
                   placeholder="e.g. ID-800"
                 />
                 <DateInput 
                   label="Valid Till" 
                   name="validTill"
                   required
                   value={formData.validTill || ''}
                   onChange={handleDateChange}
                 />
               </div>

               <Input 
                 label="Department" 
                 name="department" 
                 required 
                 value={formData.department} 
                 onChange={handleInputChange} 
                 placeholder="e.g. Security"
               />

               <Input 
                 label="Designation" 
                 name="designation" 
                 required 
                 value={formData.designation} 
                 onChange={handleInputChange} 
                 placeholder="e.g. Head of Operations"
               />
            </div>

            {/* Custom Fields */}
            {formData.customFields && formData.customFields.length > 0 && (
                <div className="pt-2">
                   <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h3>
                   <div className="space-y-3">
                     {formData.customFields.map((field) => (
                        <div key={field.id} className="flex gap-2 items-start p-1">
                           <div className="flex-1 grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                placeholder="Label" 
                                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                value={field.label}
                                onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                              />
                              <input 
                                type="text" 
                                placeholder="Value" 
                                className="w-full text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                              />
                           </div>
                           <button 
                             type="button" 
                             onClick={() => removeCustomField(field.id)}
                             className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                           >
                             <Trash size={16} />
                           </button>
                        </div>
                     ))}
                   </div>
                </div>
            )}
            
            <button type="button" onClick={addCustomField} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center py-1">
               <Plus size={16} className="mr-1.5" /> Add Custom Field
            </button>

          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">Cancel</Button>
            <Button className="flex-1" type="submit" form="employee-form" isLoading={isLoading} icon={<Save size={18} />}>
               Save Employee
            </Button>
        </div>
      </div>
    </div>

    {/* Cropper Modal */}
    {cropImageSrc && (
        <ImageCropper 
            imageSrc={cropImageSrc} 
            onCancel={() => setCropImageSrc(null)}
            onCrop={handleCropComplete}
        />
    )}
    </>
  );
};

export default EmployeeForm;