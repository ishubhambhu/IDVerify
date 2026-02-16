import React, { useState } from 'react';
import { Save, Lock, UserCog, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getAdminSettings, saveAdminSettings } from '../../utils/firestore';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', passwordHash: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await getAdminSettings();
      setFormData(settings);
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await saveAdminSettings(formData);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500">Update your access credentials</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
             <UserCog size={24} />
           </div>
           <div>
             <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
             <p className="text-sm text-gray-500">Manage your login details</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="space-y-4">
              <Input
                label="Admin Username"
                value={formData.username}
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                required
              />
              <div className="relative">
                 <Input
                   label="New Password"
                   type={showPassword ? 'text' : 'password'}
                   value={formData.passwordHash}
                   onChange={(e) => setFormData(p => ({ ...p, passwordHash: e.target.value }))}
                   required
                 />
                 <div className="absolute right-3 top-9 text-gray-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </div>
              </div>
           </div>

           {message && (
             <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
               {message}
             </div>
           )}

           <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isLoading} icon={<Save size={18} />}>
                Save Changes
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
