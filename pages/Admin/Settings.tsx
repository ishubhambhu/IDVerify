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
               <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Verification URL & QR Schema</h3>
                  <p className="text-xs text-gray-500 mb-4">Configure the prefix and routing format used when generating employee QR codes</p>
                  
                  <div className="space-y-4">
                    <Input
                      label="Official URL Prefix"
                      value={formData.verificationPrefix ?? 'https://verify.bhu.ac.in/employee/verify/'}
                      onChange={(e) => setFormData(p => ({ ...p, verificationPrefix: e.target.value }))}
                      placeholder="https://verify.bhu.ac.in/employee/verify/"
                    />

                    <Input
                      label="Hosted App Domain / Netlify URL"
                      value={formData.hostingDomain ?? window.location.origin}
                      onChange={(e) => setFormData(p => ({ ...p, hostingDomain: e.target.value }))}
                      placeholder="e.g. https://idverify-bhu.netlify.app"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        QR Code URL Format
                      </label>
                      <select
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        value={formData.qrFormatMode || 'prefix-suffix'}
                        onChange={(e) => setFormData(p => ({ ...p, qrFormatMode: e.target.value as any }))}
                      >
                        <option value="prefix-suffix">Prefix + ID + Suffix (e.g. https://verify.bhu.ac.in/employee/verify/16985.netlify.app)</option>
                        <option value="redirect">Smart Scanner Redirect (starts with https://verify.bhu.ac.in/employee/verify/ and opens live app)</option>
                        <option value="prefix-id">Official Prefix + ID only (e.g. https://verify.bhu.ac.in/employee/verify/16985)</option>
                        <option value="direct">Direct App Link (e.g. https://your-domain/#/employee/verify/16985)</option>
                      </select>
                    </div>

                    <Input
                      label="URL Suffix (for Prefix + Suffix mode)"
                      value={formData.urlSuffix ?? '.netlify.app'}
                      onChange={(e) => setFormData(p => ({ ...p, urlSuffix: e.target.value }))}
                      placeholder=".netlify.app"
                    />

                    {/* Live Sample Preview */}
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/90">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Sample QR URL Output (for ID: 16985):
                      </p>
                      <p className="text-xs font-mono text-indigo-700 font-semibold break-all">
                        {(() => {
                          const prefix = (formData.verificationPrefix ?? 'https://verify.bhu.ac.in/employee/verify/').replace(/\/?$/, '/');
                          const host = (formData.hostingDomain ?? window.location.origin).replace(/^https?:\/\//, '').replace(/\/+$/, '');
                          const mode = formData.qrFormatMode || 'prefix-suffix';
                          if (mode === 'redirect') {
                            return `${prefix}@${host}/#/employee/verify/16985`;
                          }
                          if (mode === 'prefix-id') {
                            return `${prefix}16985`;
                          }
                          if (mode === 'direct') {
                            return `${formData.hostingDomain ?? window.location.origin}/#/employee/verify/16985`;
                          }
                          return `${prefix}16985${formData.urlSuffix ?? '.netlify.app'}`;
                        })()}
                      </p>
                    </div>
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
