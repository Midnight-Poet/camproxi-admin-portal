import { useState } from 'react';
import { 
  useGetSchoolsQuery, 
  useCreateSchoolMutation, 
  useUpdateSchoolMutation, 
  useDeleteSchoolMutation,
  type School
} from '../features/api/schoolApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Building2, Plus, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';

export function Regions() {
  const { data, isLoading } = useGetSchoolsQuery();
  const [createSchool, { isLoading: isCreating }] = useCreateSchoolMutation();
  const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation();
  const [deleteSchool, { isLoading: isDeleting }] = useDeleteSchoolMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    campuses: [
      { name: '', latitude: '', longitude: '' }
    ]
  });

  const handleAddCampus = () => {
    setFormData(prev => ({
      ...prev,
      campuses: [...prev.campuses, { name: '', latitude: '', longitude: '' }]
    }));
  };

  const handleRemoveCampus = (index: number) => {
    if (formData.campuses.length === 1) return;
    setFormData(prev => ({
      ...prev,
      campuses: prev.campuses.filter((_, i) => i !== index)
    }));
  };

  const updateCampus = (index: number, field: keyof typeof formData.campuses[0], value: string) => {
    const newCampuses = [...formData.campuses];
    newCampuses[index][field] = value;
    setFormData(prev => ({ ...prev, campuses: newCampuses }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedSchoolId(null);
    setFormData({ 
      name: '', 
      code: '', 
      campuses: [{ name: '', latitude: '', longitude: '' }] 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (school: School) => {
    setIsEditMode(true);
    setSelectedSchoolId(school.id);
    setFormData({
      name: school.name,
      code: school.code,
      campuses: school.campus.length > 0 ? school.campus.map(c => ({
        name: c.name,
        latitude: c.location.latitude.toString(),
        longitude: c.location.longitude.toString()
      })) : [{ name: '', latitude: '', longitude: '' }]
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (school: School) => {
    setSelectedSchoolId(school.id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      code: formData.code,
      campus: formData.campuses.map(c => ({
        name: c.name,
        location: {
          latitude: parseFloat(c.latitude) || 0,
          longitude: parseFloat(c.longitude) || 0
        }
      }))
    };
    
    try {
      if (isEditMode && selectedSchoolId) {
        await updateSchool({ id: selectedSchoolId, body: payload }).unwrap();
      } else {
        await createSchool(payload as Partial<School>).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save region:', err);
      alert('Failed to save region. Please check the console for details.');
    }
  };

  const handleDelete = async () => {
    if (!selectedSchoolId) return;
    try {
      await deleteSchool(selectedSchoolId).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedSchoolId(null);
    } catch (err: any) {
      console.error('Failed to delete region:', err);
      alert(err?.data?.message || 'Failed to delete region. Ensure no active agents or students are registered to this school.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/favicon.svg" alt="Loading..." className="w-12 h-12 object-contain animate-pulse mb-4" />
          <p className="text-gray-500 font-medium">Loading regions...</p>
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
              Region Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">{data.length} active universities/regions</p>
          </div>
          
          <Button variant="primary" className="shadow-md flex items-center shadow-[var(--color-primary)]/20" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Region
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">University</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campuses</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Added On</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((school, idx) => (
                  <tr key={school.id} className="hover:bg-blue-50/50 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{school.name}</div>
                        <div className="text-sm text-gray-500">{school.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {school.campus && school.campus.length > 0 ? (
                          school.campus.map((camp, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 w-fit">
                              <Building2 className="w-3 h-3 mr-1.5 opacity-70" />
                              {camp.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">No campuses assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(school.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(school)}
                        className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit Region"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(school)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Region"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No regions found. Click "Add Region" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[99] transition-all duration-300" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <div className="w-full max-w-lg pointer-events-auto animate-slide-down max-h-[90vh] flex flex-col">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-full">
                {/* Modal Header */}
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] p-6 md:p-8 text-white">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{isEditMode ? 'Edit Region' : 'Add New Region'}</h3>
                      <p className="text-white/80 text-sm mt-1">{isEditMode ? 'Update university and campus details.' : 'Register a new university and its campuses.'}</p>
                    </div>
                  </div>
                </div>

                {/* Modal Form */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  <form id="regionForm" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">University Information</h4>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">University Name</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. University of Ibadan"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm font-medium placeholder-gray-400"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Code (Abbreviation)</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. UI, OAU"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm font-bold uppercase placeholder-gray-400 tracking-wide"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          Campuses
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddCampus}
                          className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Campus
                        </button>
                      </div>
                      
                      {formData.campuses.map((campus, index) => (
                        <div key={index} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4 relative group">
                          {formData.campuses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCampus(index)}
                              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove campus"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[var(--color-primary)] transition-colors">Campus Name</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Main Campus"
                              value={campus.name}
                              onChange={(e) => updateCampus(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm font-medium placeholder-gray-400"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[var(--color-primary)] transition-colors">Latitude</label>
                              <input
                                required
                                type="number"
                                step="any"
                                placeholder="e.g. 9.6538"
                                value={campus.latitude}
                                onChange={(e) => updateCampus(index, 'latitude', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm font-medium placeholder-gray-400"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1.5 group-focus-within:text-[var(--color-primary)] transition-colors">Longitude</label>
                              <input
                                required
                                type="number"
                                step="any"
                                placeholder="e.g. 6.5259"
                                value={campus.longitude}
                                onChange={(e) => updateCampus(index, 'longitude', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all text-sm font-medium placeholder-gray-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </form>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center justify-end space-x-4 p-6 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="regionForm"
                    disabled={isCreating || isUpdating}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:hover:transform-none"
                  >
                    {isCreating || isUpdating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Saving...' : 'Adding...'}
                      </span>
                    ) : (
                      isEditMode ? 'Save Changes' : 'Register Region'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsDeleteDialogOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up mx-4 border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Delete Region
              </h3>
              <button onClick={() => setIsDeleteDialogOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this region? This action cannot be undone. 
                <br /><br />
                <strong className="text-red-500">Note:</strong> The deletion will fail if there are any active agents or students registered to this school to prevent orphaned data.
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="min-w-[100px]"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
