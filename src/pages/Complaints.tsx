import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetReportsQuery } from '../features/api/reportsApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle2, User, UserCheck, ArrowRight } from 'lucide-react';

export function Complaints() {
  const { data: rawData, isLoading } = useGetReportsQuery();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const data = Array.isArray(rawData) ? rawData : (rawData as any)?.data || [];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading complaints...</p>
        </div>
      </div>
    );
  }

  const openCount = data.filter((r: any) => r.status === 'OPEN').length;
  const resolvedCount = data.filter((r: any) => r.status === 'RESOLVED').length;

  const filteredData = data.filter((r: any) => activeTab === 'ALL' || r.status === activeTab);

  return (
    <div className="space-y-6 animate-slide-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Complaints & Reports
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage and resolve user feedback</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 space-x-1 overflow-x-auto shadow-inner w-full md:w-auto">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-300 flex-1 md:flex-none ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm scale-100' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-95'
              }`}
            >
              {tab} 
              {tab === 'OPEN' && openCount > 0 && <span className="ml-1.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-bold">{openCount}</span>}
              {tab === 'RESOLVED' && resolvedCount > 0 && <span className="ml-1.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-xs font-bold">{resolvedCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredData.map((report) => (
          <Card key={report.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between border-0 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:ring-gray-200 transition-all group space-y-4 md:space-y-0 animate-slide-down">
            <div className="flex items-start space-x-4 md:space-x-6 w-full md:w-3/4">
              <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border text-sm font-bold shadow-sm transition-transform group-hover:scale-105 ${
                report.reporterType === 'STUDENT' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700'
              }`}>
                {report.reporterType === 'STUDENT' ? <User className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{report.subject}</h4>
                  <Badge variant={report.status === 'OPEN' ? 'danger' : 'success'}>
                    <span className="flex items-center text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${report.status === 'OPEN' ? 'animate-pulse' : 'opacity-75'}`}></span>
                      {report.status}
                    </span>
                  </Badge>
                  {report.reporter && (
                    <span className="text-sm font-medium text-gray-600">{report.reporter.firstName} {report.reporter.lastName}</span>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200 uppercase tracking-wide">{report.reporterType}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{report.message}</p>
                {report.targetType === 'ITEM' && report.itemCategory && (
                  <div className="mb-3 text-[10px]">
                    <Badge variant="neutral">TARGET: {report.itemCategory}</Badge>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2 font-medium">
                  Reported on {new Date(report.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end w-full md:w-auto h-full">
              <Button 
                variant={report.status === 'OPEN' ? 'primary' : 'outline'}
                onClick={() => navigate(`/complaints/${report.id}`)}
                className="flex items-center shadow-sm w-full md:w-auto justify-center transition-all"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No {activeTab.toLowerCase()} complaints</h3>
            <p className="text-gray-500 mt-1">Everything looks good in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
