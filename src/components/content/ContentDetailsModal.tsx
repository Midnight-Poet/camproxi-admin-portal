import { useState } from 'react';
import { useGetContentByIdQuery, useTakedownContentMutation } from '../../features/api/contentApi';
import { useGetUserByIdQuery } from '../../features/api/usersApi';
import { X, MapPin, Tag, User, Calendar, Eye, Loader2, ChevronLeft, ChevronRight, AlertTriangle, ShieldOff } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { ReactNode } from 'react';
import { Button as UIButton } from '../ui/Button';

interface ContentDetailsModalProps {
  id: string;
  type: 'Lodge' | 'Business' | 'Service';
  onClose: () => void;
  /** If provided, shows a Takedown button in the footer */
  showTakedown?: boolean;
}

export function ContentDetailsModal({ id, type, onClose, showTakedown }: ContentDetailsModalProps) {
  const typeMap = {
    Lodge: 'properties',
    Business: 'products',
    Service: 'services',
  } as const;

  const apiType = typeMap[type];

  const { data: item, isLoading } = useGetContentByIdQuery({ id, type: apiType });
  const [takedownContent, { isLoading: isTakingDown }] = useTakedownContentMutation();
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownReason, setTakedownReason] = useState('');

  const handleTakedown = async () => {
    if (!takedownReason.trim()) return;
    await takedownContent({ id, type: apiType, reason: takedownReason });
    setShowTakedownModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up mx-4 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-md">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Listing Details</h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">ID: {id.substring(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading || !item ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Primary Info */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2 capitalize leading-tight">{item.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={type === 'Lodge' ? 'neutral' : type === 'Business' ? 'warning' : 'success'}>
                      {type}
                    </Badge>
                    <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'verified' ? 'success' : 'danger'}>
                      {item.status || 'pending'}
                    </Badge>
                    {item.university && (
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {item.university}
                      </span>
                    )}
                  </div>
                </div>
                {item.price !== undefined && (
                  <div className="bg-green-50 px-6 py-4 rounded-2xl border border-green-100 flex flex-col items-end md:shrink-0">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Price / Value</span>
                    <div className="text-2xl font-black text-green-700 flex items-center">
                      ₦{Number(item.price).toLocaleString()}
                      {item.pricePer && <span className="text-sm font-normal text-green-500 ml-1">/ {item.pricePer}</span>}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem icon={<Tag />} label="Category" value={item.category || item.businessCategory || 'N/A'} />
                <DetailItem icon={<User />} label="Lister (Agent)" value={<AgentName agentId={item.agentId} fallback={item.agentName} />} />
                <DetailItem icon={<Calendar />} label="Submitted On" value={new Date(item.createdAt || item.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                {item.location && (
                  <DetailItem
                    icon={<MapPin />}
                    label="Location"
                    value={
                      typeof item.location === 'string'
                        ? item.location
                        : typeof item.location === 'object' && item.location !== null
                        ? `${item.location.lat ?? ''}, ${item.location.lng ?? ''}`
                        : 'N/A'
                    }
                  />
                )}
                {/* Lodge-specific */}
                {type === 'Lodge' && item.bedrooms !== undefined && (
                  <DetailItem icon={<Tag />} label="Bedrooms" value={item.bedrooms} />
                )}
                {type === 'Lodge' && item.bathrooms !== undefined && (
                  <DetailItem icon={<Tag />} label="Bathrooms" value={item.bathrooms} />
                )}
              </div>

              {/* Description */}
              {item.description && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{item.description}</p>
                </div>
              )}

              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Media ({item.images.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {item.images.map((img: any, idx: number) => {
                      const url = typeof img === 'string' ? img : (img.url || img.path || '');
                      return (
                        <div
                          key={idx}
                          onClick={() => setSlideshowIndex(idx)}
                          className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 bg-cover bg-center hover:scale-105 transition-transform duration-500 shadow-sm cursor-pointer"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          {showTakedown && item && item.status !== 'rejected' ? (
            <UIButton
              variant="outline"
              onClick={() => setShowTakedownModal(true)}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <ShieldOff className="w-4 h-4" />
              Take Down Listing
            </UIButton>
          ) : <div />}
          <UIButton variant="secondary" onClick={onClose} className="min-w-[100px]">
            Close
          </UIButton>
        </div>
      </div>

      {/* Fullscreen Slideshow Overlay */}
      {slideshowIndex !== null && item?.images && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
          <button
            onClick={() => setSlideshowIndex(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[130]"
          >
            <X className="w-8 h-8" />
          </button>
          
          {item.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSlideshowIndex(prev => (prev === null ? null : (prev === 0 ? item.images.length - 1 : prev - 1)));
              }}
              className="absolute left-6 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[130]"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          <div className="relative w-full max-w-5xl max-h-[85vh] px-16 flex items-center justify-center">
            <img
              src={typeof item.images[slideshowIndex] === 'string' ? item.images[slideshowIndex] : (item.images[slideshowIndex].url || item.images[slideshowIndex].path || '')}
              alt={`Slide ${slideshowIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain select-none shadow-2xl rounded-lg"
            />
          </div>

          {item.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSlideshowIndex(prev => (prev === null ? null : (prev === item.images.length - 1 ? 0 : prev + 1)));
              }}
              className="absolute right-6 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[130]"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/80 font-medium text-sm">
              {slideshowIndex + 1} / {item.images.length}
            </div>
          </div>
        </div>
      )}

      {/* Takedown Reason Modal */}
      {showTakedownModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTakedownModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Take Down Listing</h3>
                <p className="text-sm text-gray-500">This will remove the listing from the platform.</p>
              </div>
            </div>
            <textarea
              rows={4}
              value={takedownReason}
              onChange={(e) => setTakedownReason(e.target.value)}
              placeholder="Provide a reason for taking down this listing..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <UIButton variant="outline" onClick={() => setShowTakedownModal(false)}>
                Cancel
              </UIButton>
              <UIButton
                onClick={handleTakedown}
                disabled={!takedownReason.trim() || isTakingDown}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {isTakingDown ? 'Taking Down...' : 'Confirm Takedown'}
              </UIButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: ReactNode, label: string, value: ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function AgentName({ agentId, fallback }: { agentId: string, fallback?: string }) {
  const { data: agent, isLoading } = useGetUserByIdQuery({ id: agentId, type: 'agents' }, { skip: !agentId });
  if (isLoading) return <span className="animate-pulse text-gray-400">Loading...</span>;
  return <span>{agent ? `${agent.firstName} ${agent.lastName}` : fallback || 'Unknown'}</span>;
}
