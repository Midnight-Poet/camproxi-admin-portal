import { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Menu, X, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useNotifications } from '../../hooks/useNotifications';

import { useLogoutMutation } from '../../features/api/authApi';
import { useLazyGlobalSearchQuery } from '../../features/api/searchApi';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/approvals': 'Approvals',
  '/users': 'Users',
  '/complaints': 'Complaints',
  '/regions': 'Regions',
  '/settings': 'Settings',
  '/audit-logs': 'Audit Logs',
};

export function TopBar({ setMobileMenuOpen }: { setMobileMenuOpen: (o: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const title = routeTitles[location.pathname] || 'Dashboard';
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [logoutApi] = useLogoutMutation();
  const [triggerSearch, { data: searchResults, isFetching: isSearching }] = useLazyGlobalSearchQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        triggerSearch(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, triggerSearch]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error('Failed to call logout API', e);
    }
    dispatch(logout());
    navigate('/login');
  };

  const handleResultClick = (type: string, id: string) => {
    setSearchTerm('');
    setSearchOpen(false);
    switch(type) {
      case 'STUDENT':
        navigate(`/users/students/${id}`);
        break;
      case 'AGENT':
        navigate(`/users/agents/${id}`);
        break;
      case 'SCHOOL':
        navigate('/regions');
        break;
      default:
        navigate('/content'); // fallback for properties/products/services to new content page
    }
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0 transition-all">
      <div className="flex items-center space-x-3">
        <button className="md:hidden p-2 -ml-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <h2 className={`text-xl md:text-2xl font-bold text-gray-900 tracking-tight transition-opacity ${searchOpen ? 'opacity-0 md:opacity-100 hidden md:block' : 'opacity-100 block'}`}>{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Mobile Search Toggle */}
        <button 
          className="md:hidden p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-gray-100"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>

        {/* Search */}
        <div className={`absolute left-0 top-20 w-full px-4 md:relative md:top-auto md:px-0 md:w-auto md:block ${searchOpen ? 'block animate-slide-down' : 'hidden'}`}>
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings, users, regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  setSearchOpen(false);
                  setSearchTerm('');
                }, 150);
              }}
              className="pl-10 pr-4 py-2 w-full md:w-80 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white hover:bg-gray-100/50 transition-all shadow-sm"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)] animate-spin" />
            )}
            
            {/* Search Dropdown */}
            {searchTerm.trim().length >= 2 && searchResults && (
              <div className="absolute top-full mt-2 left-0 w-full md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No results found for "{searchTerm}"</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        onClick={() => handleResultClick(result.type, result.id)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-900 text-sm truncate pr-4">
                          {result.name || (`${(result as any).firstName || ''} ${(result as any).lastName || ''}`).trim() || 'Unknown'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-500 uppercase tracking-wider shrink-0">
                          {result.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-500 hover:text-[var(--color-primary)] bg-gray-50 hover:bg-blue-50/50 rounded-full transition-all active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-[var(--color-primary)]/5 border border-gray-100 overflow-hidden animate-slide-down z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur-sm">
                  <h3 className="font-bold text-gray-900 tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors bg-white px-2 py-1 rounded-md shadow-sm">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-300" />
                      </div>
                      <span className="font-medium">No new notifications</span>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>{n.message}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5 ml-2"></span>}
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 md:pl-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
            {user?.name ? (user.name.trim().split(' ').length >= 2 ? (user.name.trim().split(' ')[0][0] + user.name.trim().split(' ')[1][0]).toUpperCase() : user.name.substring(0, 2).toUpperCase()) : 'AD'}
          </div>
          <div className="hidden md:block mr-2 lg:mr-4">
            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 font-medium">
              <span className="capitalize">{user?.role?.replace('_', ' ').toLowerCase() || 'Admin'}</span>
              {user?.campusName && <span className="mx-1.5 opacity-50">•</span>}
              {user?.campusName && <span>{user.campusName}</span>}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-[var(--color-danger)] bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors active:scale-95"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
