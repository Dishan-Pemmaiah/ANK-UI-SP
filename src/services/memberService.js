import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'AppUsers';

const toMemberPayload = (payload) => ({
  fullName: payload.fullName,
  email: payload.email,
  passwordHash: '',
  role: payload.role,
  membershipStatus: payload.membershipStatus,
  membershipExpires: payload.membershipExpires
});

const memberApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: false }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, toMemberPayload(payload)),
  update: (id, payload) => updateRow(TABLE, id, toMemberPayload(payload)),
  approveAdmin: async (id) => {
    return updateRow(TABLE, id, {
      role: 'Admin',
      membershipStatus: 'Active'
    });
  },
  delete: (id) => deleteRow(TABLE, id)
};

export default memberApi;
