import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetReportByIdQuery, useReplyToReportMutation } from '../features/api/reportsApi';
import { useGetUserByIdQuery } from '../features/api/usersApi';
import { useGetContentByIdQuery } from '../features/api/contentApi';
import { ContentDetailsModal } from '../components/content/ContentDetailsModal';
import { UserDetailsModal } from '../components/ui/UserDetailsModal';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, User, Package, MessageSquare, CheckCircle2, MapPin, Tag, DollarSign, Calendar, ExternalLink } from 'lucide-react';

// Maps report targetType → content API type
const CONTENT_TYPE_MAP: Record<string, 'properties' | 'products' | 'services'> = {
  PROPERTY: 'properties',
  PRODUCT: 'products',
  SERVICE: 'services',
  // itemCategory variants
  LODGING: 'properties',
  ITEM: 'products',
};

const USER_TARGET_TYPES = ['USER', 'STUDENT', 'AGENT'];
const ITEM_TARGET_TYPES = ['ITEM', 'PROPERTY', 'PRODUCT', 'SERVICE', 'LODGING'];

function getImageUrl(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  return img.url || img.path || img.uri || '';
}

export function ComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useGetReportByIdQuery(id as string, { skip: !id });

  // --- Reporter ---
  const reporterUserType = report?.reporterType?.toUpperCase() === 'AGENT' ? 'agents' : 'students';
  const skipReporter = !report?.reporterId || !!report?.reporter;
  const { data: fetchedReporter, isLoading: reporterLoading } = useGetUserByIdQuery(
    { id: report?.reporterId || '', type: reporterUserType as any },
    { skip: skipReporter }
  );

  // --- Target: Item (PROPERTY / PRODUCT / SERVICE) ---
  // Use itemCategory first, fall back to targetType itself
  const rawContentKey = report?.itemCategory || report?.targetType || '';
  const contentApiType = CONTENT_TYPE_MAP[rawContentKey.toUpperCase()] as 'properties' | 'products' | 'services' | undefined;
  const isItemReport = ITEM_TARGET_TYPES.includes(report?.targetType?.toUpperCase() || '');
  const skipItem = !report?.targetId || !isItemReport || !contentApiType;
  const { data: fetchedItem, isLoading: itemLoading } = useGetContentByIdQuery(
    { id: report?.targetId || '', type: contentApiType! },
    { skip: skipItem }
  );

  // --- Target: User (STUDENT / AGENT) ---
  const targetUserType = report?.targetType?.toUpperCase() === 'AGENT' ? 'agents' : 'students';
  const isUserReport = USER_TARGET_TYPES.includes(report?.targetType?.toUpperCase() || '');
  const skipUser = !report?.targetId || !isUserReport || !!report?.target;
  const { data: fetchedTargetUser, isLoading: userTargetLoading } = useGetUserByIdQuery(
    { id: report?.targetId || '', type: targetUserType as any },
    { skip: skipUser }
  );

  // Resolve final values (embedded in report OR separately fetched)
  const reporter = report?.reporter || fetchedReporter;
  const targetItem = fetchedItem?.data || fetchedItem;
  const targetUser = report?.target || fetchedTargetUser;

  const [replyToReport, { isLoading: isReplying }] = useReplyToReportMutation();
  const [replyText, setReplyText] = useState('');
  const [showListingModal, setShowListingModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  if (isLoading || !report) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
        <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
        <p className="text-gray-500 font-medium">Loading report details...</p>
      </div>
    );
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && replyText.trim()) {
      await replyToReport({ id, reply: replyText });
      setReplyText('');
    }
  };

  const images: any[] = targetItem?.images || [];

  // Map report targetType to ContentDetailsModal type prop
  const modalTypeMap: Record<string, 'Lodge' | 'Business' | 'Service'> = {
    PROPERTY: 'Lodge',
    PRODUCT: 'Business',
    SERVICE: 'Service',
  };
  const modalType = modalTypeMap[report?.targetType?.toUpperCase() || ''] || 'Lodge';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-down pb-12">
      {showListingModal && report?.targetId && (
        <ContentDetailsModal
          id={report.targetId}
          type={modalType}
          showTakedown
          onClose={() => setShowListingModal(false)}
        />
      )}
      {showUserModal && report?.targetId && (
        <UserDetailsModal
          id={report.targetId}
          type={targetUserType}
          onClose={() => setShowUserModal(false)}
        />
      )}
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/complaints')}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Report Details</h2>
          <p className="text-sm text-gray-500">ID: {report.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Report Body */}
          <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-white">
            <div className="flex items-start justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{report.subject}</h3>
                <div className="flex items-center space-x-3">
                  <Badge variant={report.status === 'OPEN' ? 'danger' : 'success'}>
                    <span className="flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current ${report.status === 'OPEN' ? 'animate-pulse' : 'opacity-75'}`}></span>
                      {report.status}
                    </span>
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
              "{report.message}"
            </div>

            {report.reply && (
              <div className="mt-6 bg-gradient-to-r from-[var(--color-primary-light)]/10 to-transparent border-l-4 border-[var(--color-primary)] p-4 rounded-r-xl">
                <div className="flex items-center space-x-2 text-[var(--color-primary)] font-bold text-sm mb-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Admin Resolution</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.reply}</p>
              </div>
            )}
          </Card>

          {/* Reported Item Detail Card (full-width for items) */}
          {isItemReport && (
            <Card className="border-0 shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Package className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Reported Item</h3>
                </div>
                <Badge variant="neutral">{report.itemCategory || report.targetType}</Badge>
              </div>

              {itemLoading ? (
                <div className="p-8 flex items-center justify-center animate-pulse">
                  <p className="text-gray-500">Loading item details...</p>
                </div>
              ) : targetItem ? (
                <div>
                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 h-48">
                      {images.slice(0, 3).map((img: any, i: number) => (
                        <div
                          key={i}
                          className="relative overflow-hidden bg-gray-200"
                          style={{
                            backgroundImage: `url(${getImageUrl(img)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {i === 2 && images.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                              +{images.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item Details Grid */}
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Item Name</p>
                      <p className="text-lg font-bold text-gray-900">{targetItem.name || targetItem.title || 'Unnamed'}</p>
                    </div>

                    {targetItem.price && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Price
                        </p>
                        <p className="text-base font-bold text-emerald-600">
                          ₦{Number(targetItem.price).toLocaleString()}
                          {targetItem.pricePer && <span className="text-xs text-gray-400 font-normal ml-1">/ {targetItem.pricePer}</span>}
                        </p>
                      </div>
                    )}

                    {targetItem.status && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                        <Badge variant={
                          targetItem.status === 'verified' ? 'success' :
                          targetItem.status === 'pending' ? 'warning' : 'danger'
                        }>
                          {targetItem.status}
                        </Badge>
                      </div>
                    )}

                    {(targetItem.businessCategory || targetItem.category) && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Sub-category
                        </p>
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {(targetItem.businessCategory || targetItem.category).toLowerCase().replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}

                    {(targetItem.location || targetItem.address) && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Location
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {typeof targetItem.location === 'string'
                            ? targetItem.location
                            : typeof targetItem.location === 'object' && targetItem.location !== null
                            ? `${targetItem.location.lat ?? ''}, ${targetItem.location.lng ?? ''}`
                            : targetItem.address}
                        </p>
                      </div>
                    )}

                    {targetItem.createdAt && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Posted
                        </p>
                        <p className="text-sm text-gray-700">
                          {new Date(targetItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {targetItem.agentName && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Posted By</p>
                        <p className="text-sm font-semibold text-gray-900">{targetItem.agentName}</p>
                      </div>
                    )}

                    {targetItem.description && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {targetItem.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="px-6 pb-5 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowListingModal(true)}
                      className="flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Listing
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 italic text-sm">Item data unavailable</div>
              )}
            </Card>
          )}

          {/* Resolution Form */}
          {report.status === 'OPEN' && (
            <Card className="p-6 md:p-8 border-0 shadow-lg ring-1 ring-black/5 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                Resolve Ticket
              </h3>
              <form onSubmit={handleReplySubmit}>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official resolution message to the user..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm resize-none mb-4 shadow-sm"
                />
                <div className="flex justify-end">
                  <Button type="submit" className="px-8 shadow-md" disabled={isReplying}>
                    {isReplying ? 'Resolving...' : 'Send Resolution & Close'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card className="p-5 border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-b from-gray-50 to-white">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-indigo-500" />
              Reporter
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{report.reporterType.toLowerCase()}</p>
              </div>
              {reporterLoading ? (
                <div className="text-sm text-gray-500 italic animate-pulse">Loading profile...</div>
              ) : reporter ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {reporter.companyName || `${reporter.firstName || reporter.name || ''} ${reporter.lastName || ''}`.trim() || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${reporter.email}`} className="text-sm font-medium text-[var(--color-primary)] hover:underline truncate block">
                      {reporter.email}
                    </a>
                  </div>
                  {reporter.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{reporter.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">Profile data unavailable</div>
              )}
            </div>
          </Card>

          {/* Reported Person Info */}
          {isUserReport && (
            <Card className="p-5 border-0 shadow-md ring-1 ring-black/5 bg-gradient-to-b from-red-50 to-white">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-red-500" />
                Reported Person
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{report.targetType?.toLowerCase()}</p>
                </div>
                {userTargetLoading ? (
                  <div className="text-sm text-gray-500 italic animate-pulse">Loading profile...</div>
                ) : targetUser ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Name / Company</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {targetUser.companyName || `${targetUser.firstName || (targetUser as any).name || ''} ${targetUser.lastName || ''}`.trim() || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a href={`mailto:${targetUser.email}`} className="text-sm font-medium text-[var(--color-primary)] hover:underline truncate block">
                        {targetUser.email || 'N/A'}
                      </a>
                    </div>
                    {targetUser.phone && (
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{targetUser.phone}</p>
                      </div>
                    )}
                    {targetUser.campusName && (
                      <div>
                        <p className="text-xs text-gray-500">Campus</p>
                        <p className="text-sm text-gray-700">{targetUser.campusName}</p>
                      </div>
                    )}
                    {targetUser.isSuspended !== undefined && (
                      <div>
                        <p className="text-xs text-gray-500">Account Status</p>
                        <Badge variant={targetUser.isSuspended ? 'danger' : 'success'}>
                          {targetUser.isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowUserModal(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Profile
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">Person data unavailable</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
