import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsersQuery, useSuspendUserMutation } from '../features/api/usersApi';
import { useGetSchoolsQuery } from '../features/api/schoolApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, MoreVertical, ShieldAlert, UserCheck } from 'lucide-react';

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function Users() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Student' | 'Agent'>('Student');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetUsersQuery({ type: activeTab, page });
  const { data: schoolsData, isLoading: isSchoolsLoading } = useGetSchoolsQuery();
  const [suspendUser] = useSuspendUserMutation();

  const handleSuspend = async (id: string, currentlySuspended: boolean) => {
    await suspendUser({ id, type: activeTab === 'Student' ? 'students' : 'agents', suspend: !currentlySuspended });
  };

  const getSchoolCode = (schoolId?: string) => {
    if (!schoolId || !schoolsData) return '';
    return schoolsData.find(s => s.id === schoolId)?.code || '';
  };

  if (isLoading || isSchoolsLoading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-down">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            User Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Verify, suspend, and manage platform accounts</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-100 transition-all">
             <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner max-w-fit">
          <button
            onClick={() => { setActiveTab('Student'); setPage(1); }}
            className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
              activeTab === 'Student' ? 'bg-white shadow-sm text-gray-900 scale-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-95'
            }`}
          >
            Students {activeTab === 'Student' && data?.meta?.total !== undefined ? <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{data.meta.total}</span> : ''}
          </button>
          <button
            onClick={() => { setActiveTab('Agent'); setPage(1); }}
            className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${
              activeTab === 'Agent' ? 'bg-white shadow-sm text-gray-900 scale-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-95'
            }`}
          >
            Agents {activeTab === 'Agent' && data?.meta?.total !== undefined ? <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{data.meta.total}</span> : ''}
          </button>
        </div>

        <div className="flex-1 max-w-md relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
          <input
            type="text"
            placeholder="Search name or email..."
            className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] hover:border-gray-300 transition-all shadow-sm"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campus</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(data?.data || []).map((user, idx) => {
                const isSuspended = user.isSuspended;
                const fullName = `${user.firstName} ${user.lastName}`;
                const schoolCode = getSchoolCode(user.schoolId);
                return (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white transform group-hover:scale-105 transition-transform ${
                          idx % 5 === 0 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                          idx % 5 === 1 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          idx % 5 === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          idx % 5 === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                          'bg-gradient-to-br from-rose-500 to-rose-600'
                        }`}>
                          {getInitials(fullName)}
                        </div>
                        <div className="ml-4">
                          <div className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{fullName}</div>
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">{user.companyName ? user.companyName : user.category ? user.category : activeTab}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={isSuspended ? 'danger' : user.isverified ? 'success' : 'warning'}>
                        <span className="flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${isSuspended ? 'animate-pulse' : 'opacity-75'}`}></span>
                          {isSuspended ? 'Suspended' : user.isverified ? 'Verified' : 'Pending'}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                      {schoolCode ? `${schoolCode} - ${user.campusName || 'Main Campus'}` : (user.campusName || 'No Campus')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                         <button onClick={() => handleSuspend(user.id, isSuspended)} className={`p-2 rounded-lg transition-colors flex items-center justify-center border border-transparent ${
                           isSuspended ? 'text-green-600 hover:bg-green-50 hover:border-green-100' : 'text-amber-600 hover:bg-amber-50 hover:border-amber-100'
                         }`} title={isSuspended ? "Unsuspend User" : "Suspend User"}>
                           {isSuspended ? <UserCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                         </button>
                         <button 
                           onClick={() => navigate(`/users/${activeTab.toLowerCase()}s/${user.id}`)}
                           className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                           title="View Details"
                         >
                           <MoreVertical className="w-5 h-5 hidden" />
                           <span className="text-sm font-semibold px-2">View</span>
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(data?.data || []).length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                     No users found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Showing page <span className="text-gray-900 font-bold">{data?.meta?.page || 1}</span> of <span className="text-gray-900 font-bold">{data?.meta?.lastPage || 1}</span>
              <span className="mx-2">•</span> {data?.meta?.total || 0} total users
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={(data?.meta?.page || 1) <= 1}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all shadow-sm active:scale-95"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(data?.meta?.lastPage || 1, p + 1))}
              disabled={(data?.meta?.page || 1) >= (data?.meta?.lastPage || 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all shadow-sm active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
