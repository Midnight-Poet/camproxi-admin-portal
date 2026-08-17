import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../features/api/adminsApi';
import { useGetSettingsQuery, useUpdateSettingMutation } from '../features/api/superAdminApi';
import { setCredentials } from '../features/auth/authSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, User, Lock, Save, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // System Settings State
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery(undefined, { skip: !isSuperAdmin });
  const [updateSetting, { isLoading: isUpdatingSetting }] = useUpdateSettingMutation();
  const [systemMessage, setSystemMessage] = useState('');
  
  const [localSettings, setLocalSettings] = useState<{ maintenance_mode: string; service_fee_percentage: string }>({
    maintenance_mode: 'false',
    service_fee_percentage: '0'
  });

  // Reset form when user loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        maintenance_mode: settings.maintenance_mode || 'false',
        service_fee_percentage: settings.service_fee_percentage || '0'
      });
    }
  }, [settings]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const updatedUser = await updateProfile({ name, email }).unwrap();
      dispatch(setCredentials({ user: { ...user, ...updatedUser } }));
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await changePassword({ oldPassword, newPassword }).unwrap();
      setPasswordMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err: any) {
      setPasswordError(err?.data?.message || 'Failed to change password. Please check your old password.');
    }
  };

  const handleSettingSave = async (key: string, value: string) => {
    try {
      await updateSetting({ key, value }).unwrap();
      setSystemMessage('Setting updated successfully!');
      setTimeout(() => setSystemMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update setting', err);
      alert('Failed to update setting.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-down pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your administrative account preferences and system configuration.</p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Profile & Security
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'system' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            System Preferences
          </button>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
          {/* Profile Details Card */}
          <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-white h-fit">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                />
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Administrative Role</label>
                <div className="px-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg text-sm flex items-center font-medium capitalize cursor-not-allowed select-none">
                  <Shield className="w-4 h-4 mr-2" />
                  {user?.role?.replace('_', ' ').toLowerCase() || 'Unknown'}
                  {user?.campusName && ` • ${user.campusName}`}
                </div>
                <p className="text-xs text-gray-400 mt-1">Your role cannot be changed manually.</p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="submit" className="shadow-md" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                {profileMessage && (
                  <span className="text-sm font-bold text-emerald-600 flex items-center animate-slide-in-right">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {profileMessage}
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Security & Password Card */}
          <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-gradient-to-b from-white to-gray-50 h-fit">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Security</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm shadow-sm"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 animate-shake">
                  {passwordError}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <Button type="submit" variant="primary" className="shadow-md" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Updating...' : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
                {passwordMessage && (
                  <span className="text-sm font-bold text-emerald-600 flex items-center animate-slide-in-right">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {passwordMessage}
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'system' && isSuperAdmin && (
        <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-white h-fit animate-slide-up">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">System Preferences</h3>
                <p className="text-sm text-gray-500">Global configurations for the platform.</p>
              </div>
            </div>
            {systemMessage && (
              <span className="text-sm font-bold text-emerald-600 flex items-center animate-slide-in-right">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {systemMessage}
              </span>
            )}
          </div>

          {isLoadingSettings ? (
            <div className="flex justify-center p-8">
              <img src="/favicon.svg" alt="Loading..." className="w-8 h-8 object-contain animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500">Temporarily disable access to the platform for all non-admin users.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={localSettings.maintenance_mode}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, maintenance_mode: e.target.value }))}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  >
                    <option value="false">Off</option>
                    <option value="true">On</option>
                  </select>
                  <Button 
                    variant="primary" 
                    disabled={isUpdatingSetting}
                    onClick={() => handleSettingSave('maintenance_mode', localSettings.maintenance_mode)}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Service Fee Percentage */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900">Service Fee Percentage</h4>
                  <p className="text-sm text-gray-500">Global service fee deduction for transactions on the platform.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={localSettings.service_fee_percentage}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, service_fee_percentage: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                  <Button 
                    variant="primary" 
                    disabled={isUpdatingSetting}
                    onClick={() => handleSettingSave('service_fee_percentage', localSettings.service_fee_percentage)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
