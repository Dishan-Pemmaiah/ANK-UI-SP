import { deleteRow, getRowById, listRows, updateRow } from './supabaseDb';
import { supabase } from './supabaseClient';

const TABLE = 'AppUsers';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const saveMemberWithAuth = async (action, payload, memberId) => {
  const response = await supabase.functions.invoke('admin-manage-member', {
    body: {
      action,
      memberId,
      fullName: String(payload.fullName || '').trim(),
      email: normalizeEmail(payload.email),
      password: payload.password || '',
      role: payload.role,
      membershipStatus: payload.membershipStatus,
      membershipExpires: payload.membershipExpires
    }
  });

  if (response.error) {
    throw new Error(response.error.message || 'Unable to save the member login account.');
  }

  if (!response.data?.member) {
    throw new Error(response.data?.error || 'The member was not saved.');
  }

  return response.data.member;
};

const memberApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: false }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => saveMemberWithAuth('create', payload),
  update: (id, payload) => saveMemberWithAuth('update', payload, id),
  approveAdmin: async (id) => {
    return updateRow(TABLE, id, {
      role: 'Admin',
      membershipStatus: 'Active'
    });
  },
  delete: (id) => deleteRow(TABLE, id)
};

export default memberApi;
