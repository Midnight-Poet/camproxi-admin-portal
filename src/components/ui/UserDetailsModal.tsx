import { useGetUserByIdQuery, useSuspendUserMutation } from '../../features/api/usersApi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  X, User as UserIcon, Mail, Phone, Calendar,
  Building, ShieldAlert, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';

interface UserDetailsModalProps {
  id: string;
  type: 'students' | 'agents';
  onClose: () => void;
}

export function UserDetailsModal({ id, type, onClose }: UserDetailsModalProps) {
  const { data: user, isLoading } = useGetUserByIdQuery({ id, type }, { skip: !id });
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();

  const handleToggleSuspend = async () => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to ${user.isSuspended ? 'unsuspend' : 'suspend'} this user?`)) {
      await suspendUser({ id: user.id, type, suspend: !user.isSuspended });
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || user.companyName?.[0] || '?'}${user.lastName?.[0] || ''}`
    : '?';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up mx-4 border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-sm ${
              type === 'agents'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            }`}>
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight capitalize">
                {type === 'agents' ? 'Agent' : 'Student'} Profile
              </h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">ID: {id.substring(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading || !user ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Avatar + Name */}
              <div className="flex items-start gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm shrink-0 ${
                  type === 'agents'
                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300'
                    : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 border border-indigo-300'
                }`}>
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.companyName || `${user.firstName} ${user.lastName}`}
                    </h3>
                    <Badge variant={user.isSuspended ? 'danger' : 'success'}>
                      {user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </Badge>
                  </div>
                  {user.username && <p className="text-[var(--color-primary)] font-medium mt-1">@{user.username}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.isverified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 capitalize">
                      <UserIcon className="w-3 h-3 mr-1" /> {type.slice(0, -1)}
                    </span>
                    {user.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {user.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Contact & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email">
                  <a href={`mailto:${user.email}`} className="text-[var(--color-primary)] hover:underline font-medium truncate">
                    {user.email}
                  </a>
                </InfoRow>
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">
                  {user.phone || 'Not provided'}
                </InfoRow>
                <InfoRow icon={<Building className="w-4 h-4" />} label="Campus">
                  {user.campusName || 'Unknown Campus'}
                </InfoRow>
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined">
                  {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </InfoRow>
                {user.companyName && (
                  <InfoRow icon={<Building className="w-4 h-4" />} label="Company">
                    {user.companyName}
                  </InfoRow>
                )}
              </div>

              {/* Admin Action */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" /> Administrative Actions
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {user.isSuspended
                    ? 'This account is currently suspended and cannot access the platform.'
                    : 'Suspending this user will immediately revoke their access to the platform.'}
                </p>
                <Button
                  variant={user.isSuspended ? 'primary' : 'danger'}
                  className="flex items-center gap-2"
                  onClick={handleToggleSuspend}
                  disabled={isSuspending}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isSuspending ? 'Processing...' : user.isSuspended ? 'Restore Access' : 'Suspend Account'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="min-w-[100px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="p-2 rounded-lg bg-gray-100 text-gray-500 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-900 truncate">{children}</div>
      </div>
    </div>
  );
}
