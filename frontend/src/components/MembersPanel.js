import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { createMember, updateMember, deleteMember } from '../api';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6',
  '#10b981', '#f59e0b', '#ef4444', '#14b8a6',
];

export default function MembersPanel({ members, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setEditingId(null);
    setForm({ name: '', color: '#6366f1' });
    setAdding(true);
  };

  const startEdit = (m) => {
    setAdding(false);
    setEditingId(m.id);
    setForm({ name: m.name, color: m.color });
  };

  const cancel = () => { setAdding(false); setEditingId(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateMember(editingId, form);
      } else {
        await createMember(form);
      }
      cancel();
      onChanged();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this family member? Their events will become unassigned.')) return;
    try {
      await deleteMember(id);
      onChanged();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Family Members</h2>
        {!adding && (
          <button onClick={startAdd} style={addBtnStyle}>
            <Plus size={16} /> Add Member
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <MemberForm
          form={form}
          onChange={setForm}
          onSave={save}
          onCancel={cancel}
          saving={saving}
          label="New Member"
        />
      )}

      {/* Member list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {members.map(m => (
          <div key={m.id}>
            {editingId === m.id ? (
              <MemberForm
                form={form}
                onChange={setForm}
                onSave={save}
                onCancel={cancel}
                saving={saving}
                label="Edit Member"
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 16px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  flexShrink: 0,
                }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{m.color}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <IconBtn onClick={() => startEdit(m)} title="Edit"><Pencil size={15} /></IconBtn>
                  <IconBtn onClick={() => remove(m.id)} title="Remove" danger><Trash2 size={15} /></IconBtn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <p>No family members yet.</p>
          <button onClick={startAdd} style={addBtnStyle}>+ Add first member</button>
        </div>
      )}
    </div>
  );
}

function MemberForm({ form, onChange, onSave, onCancel, saving, label }) {
  return (
    <div style={{
      background: '#f8fafc',
      border: '2px solid #6366f1',
      borderRadius: 10,
      padding: 16,
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          autoFocus
          value={form.name}
          onChange={e => onChange(f => ({ ...f, name: e.target.value }))}
          placeholder="Name"
          style={{ ...inputStyle, flex: '1 1 140px' }}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onChange(f => ({ ...f, color: c }))}
              title={c}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: c, border: form.color === c ? '2px solid #1e293b' : '2px solid transparent',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onSave} disabled={saving} style={saveBtnStyle} title="Save">
            <Check size={15} />
          </button>
          <button onClick={onCancel} style={cancelBtnStyle} title="Cancel">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ onClick, children, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'none', border: '1px solid #e2e8f0', borderRadius: 6,
      padding: '5px 7px', cursor: 'pointer',
      color: danger ? '#ef4444' : '#64748b',
      display: 'flex', alignItems: 'center',
    }}>
      {children}
    </button>
  );
}

const inputStyle = {
  border: '1px solid #e2e8f0', borderRadius: 8,
  padding: '8px 10px', fontSize: 13, outline: 'none',
  background: '#fff', color: '#1e293b',
};

const addBtnStyle = {
  background: '#6366f1', color: '#fff', border: 'none',
  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
  fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
};

const saveBtnStyle = {
  background: '#6366f1', color: '#fff', border: 'none',
  borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
  display: 'flex', alignItems: 'center',
};

const cancelBtnStyle = {
  background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
  display: 'flex', alignItems: 'center',
};
