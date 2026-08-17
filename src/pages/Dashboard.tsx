import { useState } from 'react';
import { useGetDashboardMetricsQuery } from '../features/api/dashboardApi';
import { Card } from '../components/ui/Card';
import { Users, Shield, FileText, AlertCircle, Home, ShoppingBag, Wrench, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [startDate] = useState('');
  const [endDate] = useState('');
  
  const { data, isLoading } = useGetDashboardMetricsQuery(
    (startDate || endDate) ? { startDate: startDate || undefined, endDate: endDate || undefined } : undefined
  );

  if (isLoading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const metrics: any = (data as any)?.data?.data || (data as any)?.data || data || {};

  const totalPending = Number(metrics.pendingContent?.total) || 0;

  return (
    <div className="space-y-8 animate-slide-down pb-12">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={(Number(metrics.users?.students) || 0).toLocaleString()}
          subtitle="Registered across campuses"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          gradient="from-blue-500/10 to-blue-500/5"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Agents"
          value={(Number(metrics.users?.agents) || 0).toLocaleString()}
          subtitle="Verified service providers"
          icon={<Shield className="w-6 h-6 text-purple-600" />}
          gradient="from-purple-500/10 to-purple-500/5"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Pending Approvals"
          value={totalPending.toLocaleString()}
          subtitle="Awaiting moderation"
          icon={<FileText className="w-6 h-6 text-amber-600" />}
          gradient="from-amber-500/10 to-amber-500/5"
          iconBg="bg-amber-100"
          alert={totalPending > 0}
        />
        <StatCard
          title="Open Reports"
          value={(Number(metrics.support?.openReports) || 0).toLocaleString()}
          subtitle="Requires attention"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          gradient="from-red-500/10 to-red-500/5"
          iconBg="bg-red-100"
          alert={Number(metrics.support?.openReports) > 0}
        />
      </div>

      {/* Secondary Grid: Moderation Queue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moderation Queue */}
        <Card className="p-0 lg:col-span-2 overflow-hidden border-0 shadow-lg ring-1 ring-black/5 flex flex-col">
          <div className="p-6 md:p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex-1">
            <h3 className="text-xl font-bold mb-1">Content Moderation Queue</h3>
            <p className="text-gray-400 text-sm mb-8">Breakdown of listings awaiting your approval.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QueueCard 
                title="Properties" 
                count={Number(metrics.pendingContent?.properties) || 0} 
                icon={<Home className="w-5 h-5" />} 
                color="bg-emerald-500" 
                link="/approvals"
              />
              <QueueCard 
                title="Products" 
                count={Number(metrics.pendingContent?.products) || 0} 
                icon={<ShoppingBag className="w-5 h-5" />} 
                color="bg-blue-500" 
                link="/approvals"
              />
              <QueueCard 
                title="Services" 
                count={Number(metrics.pendingContent?.services) || 0} 
                icon={<Wrench className="w-5 h-5" />} 
                color="bg-purple-500" 
                link="/approvals"
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-white/60 backdrop-blur-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionLink to="/users" icon={<Users className="w-5 h-5 text-blue-600" />} title="Manage Students" desc="Suspend or verify accounts" />
            <QuickActionLink to="/users" icon={<Shield className="w-5 h-5 text-purple-600" />} title="Manage Agents" desc="Review agent credentials" />
            <QuickActionLink to="/complaints" icon={<AlertCircle className="w-5 h-5 text-red-600" />} title="Resolve Reports" desc="Reply to open support tickets" />
            <QuickActionLink to="/regions" icon={<Plus className="w-5 h-5 text-emerald-600" />} title="Add New School" desc="Expand platform reach" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, gradient, iconBg, alert = false }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode; gradient: string; iconBg: string; alert?: boolean }) {
  return (
    <Card className={`p-6 relative overflow-hidden group border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-br ${gradient} bg-opacity-10 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${iconBg} bg-opacity-50 shadow-sm`}>
            {icon}
          </div>
          {alert && (
            <span className="flex h-3 w-3 relative mt-1 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
        <div>
          <div className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">{value}</div>
          <h3 className="text-sm font-bold text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}

function QueueCard({ title, count, icon, color, link }: { title: string; count: number; icon: React.ReactNode; color: string; link: string }) {
  return (
    <Link to={link} className="block group">
      <div className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-white`}>
            {icon}
          </div>
          <div className="text-2xl font-bold text-white">{count}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{title}</span>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function QuickActionLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-primary)] transition-all group-hover:translate-x-1" />
    </Link>
  );
}
