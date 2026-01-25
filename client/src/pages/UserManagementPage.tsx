import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import BackButton from '../components/ui/BackButton'

interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'estimator' | 'viewer'
  is_active: boolean
  created_at: string
}

interface EditingUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'estimator' | 'viewer'
  is_active: boolean
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<EditingUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Check if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700">Only administrators can access user management.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authAPI.getAllUsers()
      setUsers(response.data.users)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (user: User) => {
    setEditingId(user.id)
    setEditingData({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveChanges = async () => {
    if (!editingData) return

    try {
      setIsSaving(true)
      const updateData: any = {}

      // Only include changed fields
      const original = users.find((u) => u.id === editingData.id)
      if (!original) return

      if (editingData.username !== original.username) updateData.username = editingData.username
      if (editingData.email !== original.email) updateData.email = editingData.email
      if (editingData.role !== original.role) updateData.role = editingData.role
      if (editingData.is_active !== original.is_active) updateData.is_active = editingData.is_active

      if (Object.keys(updateData).length === 0) {
        cancelEditing()
        return
      }

      await authAPI.updateUser(editingData.id, updateData)

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === editingData.id
            ? {
                ...u,
                username: editingData.username,
                email: editingData.email,
                role: editingData.role,
                is_active: editingData.is_active,
              }
            : u
        )
      )

      cancelEditing()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-khc-primary">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage all users in the system</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-600">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {editingId === user.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData?.username || ''}
                            onChange={(e) =>
                              setEditingData({ ...editingData!, username: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="email"
                            value={editingData?.email || ''}
                            onChange={(e) =>
                              setEditingData({ ...editingData!, email: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editingData?.role || ''}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                role: e.target.value as 'admin' | 'estimator' | 'viewer',
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="estimator">Estimator</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingData?.is_active || false}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData!,
                                  is_active: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-khc-primary"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {editingData?.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={saveChanges}
                              disabled={isSaving}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:bg-gray-400"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded disabled:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => startEditing(user)}
                            className="px-3 py-1 bg-khc-primary hover:bg-khc-secondary text-white text-sm rounded"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
