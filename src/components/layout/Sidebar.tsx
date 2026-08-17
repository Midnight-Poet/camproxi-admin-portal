import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { LayoutDashboard, CheckSquare, Users, Shield, Flag, Map, Settings, ChevronLeft, ChevronRight, Activity, FileText } from 'lucide-react';

import { useGetPendingContentQuery } from '../../features/api/contentApi';
import { useGetReportsQuery } from '../../features/api/reportsApi';

const allNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare },
  { name: 'Content', path: '/content', icon: FileText },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Complaints', path: '/complaints', icon: Flag },
  { name: 'Regions', path: '/regions', icon: Map },
  { name: 'Admins', path: '/admins', icon: Shield, superAdminOnly: true },
  { name: 'Audit Logs', path: '/audit-logs', icon: Activity, superAdminOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings, superAdminOnly: true },
];

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (o: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: pendingContent } = useGetPendingContentQuery();
  const { data: reports } = useGetReportsQuery();
  
  const pendingCount = pendingContent?.length || 0;
  const reportsArray = Array.isArray(reports) ? reports : (reports as any)?.data || [];
  const openReportsCount = reportsArray.filter((r: any) => r.status === 'OPEN').length || 0;
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const navItems = allNavItems.filter(item => !item.superAdminOnly || isSuperAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div
        className={`fixed md:relative z-50 h-screen bg-gradient-to-b from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white/80 transition-all duration-300 flex flex-col border-r border-white/10 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
      {/* Logo */}
      <div className="flex items-center h-20 px-6 shrink-0">
        <img src="/favicon.svg" alt="Camproxi Admin" className="w-8 h-8 object-contain shrink-0" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="text-white font-semibold text-lg leading-tight">Camproxi</h1>
            <p className="text-[10px] tracking-wider font-medium text-white/50 uppercase">Admin Console</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="w-5 h-5 shrink-0 group-hover:text-white transition-colors" />
              {!collapsed && (
                <span className="ml-3 font-medium flex-1 whitespace-nowrap group-hover:text-white transition-colors">{item.name}</span>
              )}
              {!collapsed && item.name === 'Approvals' && pendingCount > 0 && (
                <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm animate-slide-in-right">
                  {pendingCount}
                </span>
              )}
              {!collapsed && item.name === 'Complaints' && openReportsCount > 0 && (
                <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm animate-slide-in-right">
                  {openReportsCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Collapse */}
      <div className="p-4 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center w-full px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
          {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">Collapse</span>}
        </button>
      </div>
      </div>
    </>
  );
}
