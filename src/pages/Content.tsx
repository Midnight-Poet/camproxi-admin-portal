import { useGetAllContentQuery, useVerifyContentMutation, useRejectContentMutation, useResetContentMutation, useTakedownContentMutation } from '../features/api/contentApi';
import { useGetUserByIdQuery } from '../features/api/usersApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, Search, AlertTriangle, X, Filter, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ContentDetailsModal } from '../components/content/ContentDetailsModal';

export function Content() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PROPERTY' | 'PRODUCT' | 'SERVICE'>('ALL');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data: response, isLoading } = useGetAllContentQuery({ page, limit, status: activeStatus, category: activeCategory });
  
  const [verifyContent] = useVerifyContentMutation();
  const [rejectContent] = useRejectContentMutation();
  const [resetContent] = useResetContentMutation();
  const [takedownContent] = useTakedownContentMutation();
  
  const [viewItem, setViewItem] = useState<{ id: string, type: 'Lodge' | 'Business' | 'Service' } | null>(null);

  const [rejectItem, setRejectItem] = useState<{ id: string, type: 'Lodge' | 'Business' | 'Service' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [takedownItem, setTakedownItem] = useState<{ id: string, type: 'Lodge' | 'Business' | 'Service' } | null>(null);
  const [takedownReason, setTakedownReason] = useState('');
  const [isTakingDown, setIsTakingDown] = useState(false);

  const data = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, lastPage: 1 };

  const typeMap = {
    Lodge: 'properties',
    Business: 'products',
    Service: 'services',
  } as const;

  const handleApprove = async (id: string, uiType: 'Lodge' | 'Business' | 'Service') => {
    await verifyContent({ id, type: typeMap[uiType] });
  };

  const handleReset = async (id: string, uiType: 'Lodge' | 'Business' | 'Service') => {
    await resetContent({ id, type: typeMap[uiType] });
  };

  const handleReject = async () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setIsRejecting(true);
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

  const handleTakedown = async () => {
    if (!takedownItem || !takedownReason.trim()) return;
    setIsTakingDown(true);
    try {
      await takedownContent({ id: takedownItem.id, type: typeMap[takedownItem.type], reason: takedownReason }).unwrap();
      setTakedownItem(null);
      setTakedownReason('');
    } catch (err) {
      console.error('Failed to takedown content', err);
    } finally {
      setIsTakingDown(false);
    }
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-slide-down">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Filter className="w-8 h-8 text-[var(--color-primary)]" />
              Content Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">{meta.total} total items across the platform</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Status Filter */}
            <select
              value={activeStatus}
              onChange={(e) => { setActiveStatus(e.target.value as any); setPage(1); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm text-sm font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner overflow-x-auto">
              {(['ALL', 'PROPERTY', 'PRODUCT', 'SERVICE'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveCategory(tab); setPage(1); }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeCategory === tab 
                      ? 'bg-white text-[var(--color-primary)] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'PROPERTY' ? 'Properties' : tab === 'PRODUCT' ? 'Products' : 'Services'}
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

        <Card className="overflow-hidden border border-gray-100 shadow-lg shadow-gray-200/40 rounded-2xl bg-white/60 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80 backdrop-blur-md">
                <tr>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest rounded-tl-xl">Name</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest">Type</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest">Lister</th>
                  <th scope="col" className="px-6 py-5 text-right text-xs font-extrabold text-gray-500 uppercase tracking-widest rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {data.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 transition-all duration-300 group cursor-pointer" 
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => setViewItem({ id: item.id, type: item.type })}
                  >
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors capitalize">{item.name}</span>
                        <div className="text-xs text-gray-500 flex items-center mt-1 font-medium">
                          {item.university}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <Badge variant={item.type === 'Lodge' ? 'neutral' : item.type === 'Business' ? 'warning' : 'success'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'verified' ? 'success' : 'danger'}>
                        {item.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <AgentCell agentId={item.agentId} fallbackName={item.agentName} />
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {(!item.status || item.status === 'pending') && (
                        <>
                          <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleApprove(item.id, item.type); }} className="px-4 py-2 shadow-md shadow-[var(--color-primary)]/20 hover:-translate-y-0.5 transition-transform">
                            <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                          </Button>
                          <button 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-red-100 hover:-translate-y-0.5" 
                            onClick={(e) => { e.stopPropagation(); setRejectItem({ id: item.id, type: item.type }); setRejectReason(''); }}
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {item.status === 'verified' && (
                        <Button variant="danger" onClick={(e) => { e.stopPropagation(); setTakedownItem({ id: item.id, type: item.type }); setTakedownReason(''); }} className="px-4 py-2 hover:-translate-y-0.5 transition-transform">
                          <Trash2 className="w-4 h-4 mr-1.5" /> Takedown
                        </Button>
                      )}
                      {item.status === 'rejected' && (
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleReset(item.id, item.type); }} className="px-4 py-2 hover:-translate-y-0.5 transition-transform">
                          <RefreshCw className="w-4 h-4 mr-1.5 text-gray-500" /> Reset
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-xl text-gray-900 tracking-tight">No content found</p>
                          <p className="text-sm text-gray-500 mt-1 font-medium">Try adjusting your filters to find what you're looking for.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {data.length > 0 && (
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Showing page <span className="text-gray-900 font-bold">{meta.page}</span> of <span className="text-gray-900 font-bold">{meta.lastPage}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-gray-300 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                  disabled={meta.page >= meta.lastPage}
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

      {/* Takedown Modal */}
      {takedownItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setTakedownItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up mx-4 border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Takedown Listing
              </h3>
              <button onClick={() => setTakedownItem(null)} className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for taking down this verified {takedownItem.type.toLowerCase()}. This will be sent to the agent so they can fix the issue.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Takedown Reason</label>
                  <textarea
                    value={takedownReason}
                    onChange={(e) => setTakedownReason(e.target.value)}
                    placeholder="e.g., Listing reported as fake, inappropriate images..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-32"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setTakedownItem(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleTakedown} 
                disabled={!takedownReason.trim() || isTakingDown}
                className="min-w-[100px]"
              >
                {isTakingDown ? 'Taking down...' : 'Takedown'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {viewItem && (
        <ContentDetailsModal 
          id={viewItem.id} 
          type={viewItem.type} 
          onClose={() => setViewItem(null)} 
        />
      )}
    </>
  );
}

function AgentCell({ agentId, fallbackName }: { agentId: string, fallbackName?: string }) {
  const { data: agent, isLoading } = useGetUserByIdQuery({ id: agentId, type: 'agents' }, { skip: !agentId });

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0"></div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 bg-gray-100 animate-pulse rounded"></div>
          <div className="h-2 w-16 bg-gray-50 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const name = agent ? `${agent.firstName} ${agent.lastName}` : fallbackName || 'Unknown Agent';
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ring-2 ring-white">
        {name.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-extrabold text-gray-900 leading-tight">{name}</span>
        {agent && <span className="text-xs text-gray-500 font-medium">{agent.email}</span>}
      </div>
    </div>
  );
}
