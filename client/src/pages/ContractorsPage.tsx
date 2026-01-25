import { useState, useEffect } from 'react';
import { contractorsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/ui/BackButton';
import type { BuildingContractor, CreateContractorRequest } from '../types/auth';

export default function ContractorsPage() {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<BuildingContractor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateContractorRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    website: '',
    specialization: '',
    notes: '',
  });

  // Fetch contractors
  const fetchContractors = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await contractorsAPI.getAll({ search: searchTerm });
      setContractors(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contractors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await contractorsAPI.update(editingId, formData);
      } else {
        await contractorsAPI.create(formData);
      }

      resetForm();
      fetchContractors();
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Failed to save contractor';

      if (errorData?.error) {
        errorMessage = errorData.error;

        // If there are validation details, append them
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors = errorData.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          errorMessage = `${errorData.error} - ${fieldErrors}`;
        }
      }

      setError(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;

    try {
      await contractorsAPI.delete(id);
      fetchContractors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete contractor');
    }
  };

  // Handle edit
  const handleEdit = (contractor: BuildingContractor) => {
    setFormData({
      name: contractor.name,
      email: contractor.email || '',
      phone: contractor.phone || '',
      address: contractor.address || '',
      city: contractor.city || '',
      postcode: contractor.postcode || '',
      country: contractor.country || 'United Kingdom',
      website: contractor.website || '',
      specialization: contractor.specialization || '',
      notes: contractor.notes || '',
    });
    setEditingId(contractor.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
      website: '',
      specialization: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Render star rating
  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
    const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`${sizeClass} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-khc-primary">Building Contractors</h1>
          <p className="text-gray-600 mt-1">Manage your contractor network and specializations</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-khc-primary hover:bg-khc-secondary text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          + Add Contractor
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search contractors by name, email, specialty, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Contractor' : 'New Contractor'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contractor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g., Electrical, Plumbing, Carpentry"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode || ''}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country || 'United Kingdom'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-khc-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-khc-primary hover:bg-khc-secondary text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                {editingId ? 'Update Contractor' : 'Add Contractor'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contractors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading contractors...</div>
        ) : contractors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contractors found. {!showForm && <a href="#" onClick={() => setShowForm(true)} className="text-khc-primary font-semibold">Add one now</a>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((contractor) => (
                  <tr key={contractor.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{contractor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contractor.specialization || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contractor.city || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <StarRating rating={Math.round(contractor.rating)} />
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(contractor)}
                        className="text-khc-primary hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contractor.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
