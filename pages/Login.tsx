import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getAdminSettings, setAuthStatus } from '../utils/storage';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for effect
    setTimeout(() => {
      const settings = getAdminSettings();
      if (username === settings.username && password === settings.passwordHash) {
        setAuthStatus(true);
        navigate('/admin');
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-white p-3 rounded-full inline-flex items-center justify-center mb-4">
            <img 
              src="/bhu.png" 
              alt="BHU Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-gray-600">Please sign in to manage IDs</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
             <Input
                id="username"
                label="Username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
             />
             <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
             />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center">
               <Lock className="w-4 h-4 mr-2" />
               {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-indigo-200" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
        
        <div className="text-center text-xs text-gray-400">
          Managed by Central Library, B.H.U.
        </div>
      </div>
    </div>
  );
};

export default Login;
