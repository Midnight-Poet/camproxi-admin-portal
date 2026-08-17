import { useState } from 'react';
import { useGetAdminsQuery, useCreateAdminMutation } from '../features/api/adminsApi';
import { useGetSchoolsQuery } from '../features/api/schoolApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Mail, Building2, MoreVertical, Plus } from 'lucide-react';

export function Admins() {
  const { data: admins, isLoading } = useGetAdminsQuery();
  const { data: schools } = useGetSchoolsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    user: {
      name: string;
      username: string;
      email: string;
      password?: string;
      role: 'SUPER_ADMIN' | 'ADMIN' | 'OFFICIAL';
      schoolId: string;
      campusName: string;
    }
  }>({
    user: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'OFFICIAL',
      schoolId: '',
      campusName: '',
    }
  });

  const getSchoolName = (id: string) => {
    return schools?.find(s => s.id === id)?.name || id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData.user };
      if (payload.role !== 'OFFICIAL') {
        delete payload.schoolId;
        delete payload.campusName;
      } else if (!payload.campusName) {
        delete payload.campusName;
      }
      
      await createAdmin(payload).unwrap();
      setIsModalOpen(false);
      setFormData({ user: { name: '', username: '', email: '', password: '', role: 'OFFICIAL', schoolId: '', campusName: '' } });
    } catch (err) {
      console.error('Failed to create admin:', err);
      alert('Failed to create admin. Please check the console for details.');
    }
  };

  if (isLoading || !admins) return <div className="p-8">Loading admins...</div>;

  return (
    <>
      <div className="space-y-6 animate-slide-down">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Admin Personnel
            </h2>
            <p className="text-sm text-gray-500 mt-1">{admins.length} registered admins and officials</p>
          </div>
          
          <Button variant="primary" className="shadow-md flex items-center shadow-[var(--color-primary)]/20" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Admin
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Access</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned School</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Added On</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {admins.map((admin, idx) => (
                  <tr key={admin.id} className="hover:bg-blue-50/50 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors flex items-center">
                          {admin.role === 'SUPER_ADMIN' && <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-[var(--color-primary)]" />}
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1 opacity-50" />
                          {admin.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        admin.role === 'SUPER_ADMIN' ? 'danger' :
                        admin.role === 'ADMIN' ? 'warning' : 'neutral'
                      }>
                        <span className="flex items-center text-xs">
                          {admin.role.replace('_', ' ')}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {admin.schoolId ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 w-fit">
                          <Building2 className="w-3 h-3 mr-1.5 opacity-70" />
                          {getSchoolName(admin.schoolId)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Global Access</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(admin.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No admins found. Click "Create Admin" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99] transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <Card className="w-full max-w-2xl p-6 md:p-8 pointer-events-auto animate-slide-down shadow-2xl border-0 ring-1 ring-black/5 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight shrink-0">Create New Admin</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.user.name}
                      onChange={(e) => setFormData({ ...formData, user: { ...formData.user, name: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. johndoe"
                      value={formData.user.username}
                      onChange={(e) => setFormData({ ...formData, user: { ...formData.user, username: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm lowercase"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. admin@camproxi.com"
                      value={formData.user.email}
                      onChange={(e) => setFormData({ ...formData, user: { ...formData.user, email: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                    <input
                      required
                      type="password"
                      placeholder="Must be at least 8 characters"
                      value={formData.user.password}
                      onChange={(e) => setFormData({ ...formData, user: { ...formData.user, password: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Admin Role</label>
                    <select
                      value={formData.user.role}
                      onChange={(e) => setFormData({ ...formData, user: { ...formData.user, role: e.target.value as any } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                    >
                      <option value="OFFICIAL">University Official (Scoped)</option>
                      <option value="ADMIN">Admin (Global)</option>
                      <option value="SUPER_ADMIN">Super Admin (Global)</option>
                    </select>
                  </div>

                  {formData.user.role === 'OFFICIAL' && (
                    <>
                      <div className="col-span-1 md:col-span-2 pt-2 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5 text-gray-400" /> Scoped Access</h4>
                        <p className="text-xs text-gray-500 mb-4">Assign this official to a specific university to restrict their access.</p>
                      </div>
                      
                      <div className="col-span-1 animate-slide-down">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Assign to School</label>
                        <select
                          required
                          value={formData.user.schoolId}
                          onChange={(e) => setFormData({ ...formData, user: { ...formData.user, schoolId: e.target.value, campusName: '' } })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                        >
                          <option value="">Select a school...</option>
                          {schools?.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-1 animate-slide-down">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Assign to Campus (Optional)</label>
                        <select
                          value={formData.user.campusName}
                          onChange={(e) => setFormData({ ...formData, user: { ...formData.user, campusName: e.target.value } })}
                          disabled={!formData.user.schoolId}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">All Campuses</option>
                          {schools?.find(s => s.id === formData.user.schoolId)?.campus?.map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <Button type="button" variant="outline" className="px-6" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="px-6" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create Admin'}</Button>
                </div>
              </form>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
