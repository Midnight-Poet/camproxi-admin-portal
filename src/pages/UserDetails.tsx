import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery, useSuspendUserMutation } from '../features/api/usersApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Building, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export function UserDetails() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  // Ensure type matches the API literal
  const apiType = type === 'agents' ? 'agents' : 'students';
  
  const { data: user, isLoading } = useGetUserByIdQuery({ id: id as string, type: apiType }, { skip: !id || !type });
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();

  if (isLoading || !user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
        <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
        <p className="text-gray-500 font-medium">Loading user profile...</p>
      </div>
    );
  }

  const handleToggleSuspend = async () => {
    if (window.confirm(`Are you sure you want to ${user.isSuspended ? 'unsuspend' : 'suspend'} this user?`)) {
      await suspendUser({ id: user.id, type: apiType, suspend: !user.isSuspended });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-down pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">{type?.slice(0, -1)} Profile</h2>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2 p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

          <div className="flex items-start space-x-6 relative z-10">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-sm ${
              type === 'agents' 
                ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300' 
                : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 border border-indigo-300'
            }`}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                <Badge variant={user.isSuspended ? 'danger' : 'success'}>
                  {user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-[var(--color-primary)] font-medium mt-1">@{user.username}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {user.isverified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 capitalize">
                  <UserIcon className="w-3 h-3 mr-1" /> {type?.slice(0, -1)}
                </span>
                {user.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize">
                    {user.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <a href={`mailto:${user.email}`} className="text-gray-900 hover:text-[var(--color-primary)] font-medium truncate">{user.email}</a>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-900 font-medium">{user.phone || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Building className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-900 font-medium truncate" title={user.campusName}>{user.campusName || 'Unknown Campus'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-gray-900 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-b from-gray-50 to-white">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-indigo-500" />
              Administrative Actions
            </h4>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {user.isSuspended 
                  ? 'This account is currently suspended and cannot access the platform.' 
                  : 'Suspending this user will immediately revoke their access to the platform.'}
              </p>
              
              <Button 
                variant={user.isSuspended ? 'primary' : 'danger'} 
                className="w-full flex items-center justify-center shadow-sm"
                onClick={handleToggleSuspend}
                disabled={isSuspending}
              >
                {isSuspending ? 'Processing...' : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {user.isSuspended ? 'Restore Access' : 'Suspend Account'}
                  </>
                )}
              </Button>
            </div>
          </Card>
          
          {user.companyName && (
            <Card className="p-6 border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-b from-gray-50 to-white">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center">
                <Building className="w-4 h-4 mr-2 text-emerald-500" />
                Business Details
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{user.companyName}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
