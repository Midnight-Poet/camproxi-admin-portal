import { useGetPendingContentQuery, useVerifyContentMutation, useRejectContentMutation } from '../features/api/contentApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, Search, AlertTriangle, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export function Approvals() {
  const { data, isLoading } = useGetPendingContentQuery();
  const [verifyContent] = useVerifyContentMutation();
  const [rejectContent] = useRejectContentMutation();
  const [activeTab, setActiveTab] = useState<'All' | 'Lodge' | 'Business' | 'Service'>('All');
  const [rejectItem, setRejectItem] = useState<{ id: string, type: 'Lodge' | 'Business' | 'Service' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    let filtered = [...data];
    if (activeTab !== 'All') {
      filtered = filtered.filter(item => item.type === activeTab);
    }
    // Sort from least recent to most recent
    return filtered.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [data, activeTab]);

  const handleApprove = async (id: string, uiType: 'Lodge' | 'Business' | 'Service') => {
    const typeMap = {
      Lodge: 'properties',
      Business: 'products',
      Service: 'services',
    } as const;
    await verifyContent({ id, type: typeMap[uiType] });
  };

  const handleReject = async () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setIsRejecting(true);
    const typeMap = {
      Lodge: 'properties',
      Business: 'products',
      Service: 'services',
    } as const;
    try {
      await rejectContent({ id: rejectItem.id, type: typeMap[rejectItem.type], reason: rejectReason }).unwrap();
      setRejectItem(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject content', err);
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading approval queue...</p>
        </div>
      </div>
    );
  }

  const [page, setPage] = useState(1);
  const limit = 10;
  const paginatedData = sortedData.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(sortedData.length / limit);

  return (
    <>
      <div className="space-y-6 animate-slide-down">
        {/* Header... */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-[var(--color-primary)]" />
              Listing Approval Queue
            </h2>
            <p className="text-sm text-gray-500 mt-1">{sortedData.length} total listings awaiting review</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner overflow-x-auto">
              {(['All', 'Lodge', 'Business', 'Service'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-white text-[var(--color-primary)] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden md:flex gap-2">
               <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors border border-transparent">
                 <Search className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent info</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 mb-1 capitalize">{item.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        {item.university}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge variant={item.type === 'Lodge' ? 'neutral' : item.type === 'Business' ? 'warning' : 'success'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-700">{item.agentName}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(item.submittedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-3 flex justify-end items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleApprove(item.id, item.type); }} className="px-5 py-2 shadow-sm">
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <button 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-red-100" 
                        onClick={(e) => { e.stopPropagation(); setRejectItem({ id: item.id, type: item.type }); setRejectReason(''); }}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-green-200 mb-3" />
                        <p className="font-medium text-lg text-gray-600">You're all caught up!</p>
                        <p className="text-sm">No pending approvals for {activeTab === 'All' ? 'any category' : activeTab.toLowerCase() + 's'}.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-gray-900 font-bold">{(page - 1) * limit + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(page * limit, sortedData.length)}</span> of <span className="text-gray-900 font-bold">{sortedData.length}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setRejectItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up mx-4 border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Reject Listing
              </h3>
              <button onClick={() => setRejectItem(null)} className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this {rejectItem.type.toLowerCase()}. This will be sent to the agent so they can fix the issue.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Inappropriate images, missing details, invalid price..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-32"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setRejectItem(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleReject} 
                disabled={!rejectReason.trim() || isRejecting}
                className="min-w-[100px]"
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
