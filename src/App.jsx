import { useState, useEffect } from 'react'
import './App.css'

const NOTE_COLORS = [
  '#FFE066', '#A7F3D0', '#FCA5A5', '#C4B5FD',
  '#93C5FD', '#FDE68A', '#FBCFE8', '#A5F3FC',
  '#FED7AA', '#D9F99D',
]

const PIN_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#c0392b',
]

const API_URL = 'https://69a993de32e2d46caf46b6f4.mockapi.io/api/v1/user'

function formatBirthDate(dateStr) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateForInput(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // Try to handle formats like "03-02-2003"
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [m, d, y] = dateStr.split('-')
      return `${y}-${m}-${d}`
    }
    return dateStr
  }
  return date.toISOString().split('T')[0]
}

/* ===== View Modal ===== */
function ViewModal({ profile, onClose }) {
  if (!profile) return null

  const initials = `${(profile.firstname?.[0] || '').toUpperCase()}${(profile.lastname?.[0] || '').toUpperCase()}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="view-modal-header">
          <div className="view-avatar">
            <span className="view-avatar-initials">{initials}</span>
          </div>
          <h2 className="view-name">{profile.firstname} {profile.lastname}</h2>
        </div>

        <div className="view-modal-body">
          <div className="view-detail-card">
            <div className="view-detail-item">
              <span className="view-label">✉️ Email</span>
              <span className="view-value">{profile.email}</span>
            </div>
            <div className="view-detail-item">
              <span className="view-label">🎂 Birth Date</span>
              <span className="view-value">{formatBirthDate(profile.birthDate)}</span>
            </div>
            <div className="view-detail-item">
              <span className="view-label">🆔 User ID</span>
              <span className="view-value">{profile.id}</span>
            </div>
            <div className="view-detail-item">
              <span className="view-label">📅 Created At</span>
              <span className="view-value">{formatBirthDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Edit Modal ===== */
function EditModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    firstname: profile.firstname || '',
    lastname: profile.lastname || '',
    email: profile.email || '',
    birthDate: formatDateForInput(profile.birthDate),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      const updated = await res.json()
      onSave(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h2 className="edit-modal-title">✏️ Edit Profile</h2>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              value={form.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              value={form.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
            />
          </div>

          {error && <p className="form-error">⚠️ {error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ===== Create Modal ===== */
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    birthDate: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create user')
      const newUser = await res.json()
      onCreate(newUser)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container create-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h2 className="edit-modal-title">➕ Create New User</h2>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="create-firstname">First Name</label>
            <input
              id="create-firstname"
              name="firstname"
              type="text"
              value={form.firstname}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-lastname">Last Name</label>
            <input
              id="create-lastname"
              name="lastname"
              type="text"
              value={form.lastname}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-email">Email</label>
            <input
              id="create-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-birthDate">Birth Date</label>
            <input
              id="create-birthDate"
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
            />
          </div>

          {error && <p className="form-error">⚠️ {error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-save btn-create" disabled={saving}>
              {saving ? 'Creating...' : '🚀 Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ===== Sticky Note ===== */
function StickyNote({ profile, index, onView, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false)

  const color = NOTE_COLORS[index % NOTE_COLORS.length]
  const pinColor = PIN_COLORS[index % PIN_COLORS.length]
  const rotation = ((index % 7) - 3) * 1.5

  const initials = `${(profile.firstname?.[0] || '').toUpperCase()}${(profile.lastname?.[0] || '').toUpperCase()}`

  return (
    <div
      className={`sticky-note ${isHovered ? 'hovered' : ''}`}
      style={{
        '--note-color': color,
        '--note-rotation': `${rotation}deg`,
        '--pin-color': pinColor,
        animationDelay: `${index * 0.08}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pin"></div>
      <div className="tape"></div>

      <div className="note-content">
        <div className="avatar-circle">
          <span className="avatar-initials">{initials}</span>
        </div>

        <h3 className="profile-name">
          {profile.firstname} {profile.lastname}
        </h3>

        <div className="divider"></div>

        <div className="details">
          <div className="detail-row">
            <span className="detail-icon">✉️</span>
            <span className="detail-text">{profile.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">🎂</span>
            <span className="detail-text">{formatBirthDate(profile.birthDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">🆔</span>
            <span className="detail-text">ID: {profile.id}</span>
          </div>
        </div>
      </div>

      <div className="note-actions">
        <button className="action-btn view-btn" onClick={() => onView(profile)} title="View Details">
          👁️ View
        </button>
        <button className="action-btn edit-btn" onClick={() => onEdit(profile)} title="Edit Profile">
          ✏️ Edit
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(profile)} title="Delete Profile">
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

/* ===== App ===== */
function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSave = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    )
    setEditUser(null)
  }

  const handleDelete = async (profile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${profile.firstname} ${profile.lastname}?`
    )
    if (!confirmed) return

    try {
      const res = await fetch(`${API_URL}/${profile.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setUsers((prev) => prev.filter((u) => u.id !== profile.id))
    } catch (err) {
      alert('Error deleting user: ' + err.message)
    }
  }

  const handleCreate = (newUser) => {
    setUsers((prev) => [...prev, newUser])
    setShowCreate(false)
  }

  return (
    <div className="app-container">
      <div className="cork-board">
        <div className="board-header">
          <div>
            <h1 className="board-title">
              <span className="title-icon">📌</span> Team Board
            </h1>
            <p className="board-subtitle">Our amazing team members</p>
          </div>
          <button className="create-user-btn" onClick={() => setShowCreate(true)} title="Create User">
            ➕
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <p className="loading-text">Pinning notes to the board...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p className="error-text">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="notes-grid">
            {users.map((user, index) => (
              <StickyNote
                key={user.id}
                profile={user}
                index={index}
                onView={setViewUser}
                onEdit={setEditUser}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {viewUser && (
        <ViewModal profile={viewUser} onClose={() => setViewUser(null)} />
      )}

      {editUser && (
        <EditModal
          profile={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSave}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

export default App
