import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';
import authApi from './authService';

const TABLE = 'AppUsers';

const toMemberPayload = (payload) => ({
  fullName: payload.fullName,
  email: payload.email,
  passwordHash: '',
  role: payload.role,
  membershipStatus: payload.membershipStatus,
  membershipExpires: payload.membershipExpires
});

const withMeta = (record, meta = {}) => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  return {
    ...record,
    __meta: meta
  };
};

const memberApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: false }),
  getById: (id) => getRowById(TABLE, id),
  create: async (payload) => {
    const authResult = await authApi.ensureAuthUser({
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName
    });

    const saved = await createRow(TABLE, toMemberPayload(payload));
    return withMeta(saved, { warning: authResult.warning || '' });
  },
  update: async (id, payload) => {
    let warning = '';

    if (payload.password) {
      const authResult = await authApi.ensureAuthUser({
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName
      });
      warning = authResult.warning || '';
    }

    const saved = await updateRow(TABLE, id, toMemberPayload(payload));
    return withMeta(saved, { warning });
  },
  approveAdmin: async (id) => {
    return updateRow(TABLE, id, {
      role: 'Admin',
      membershipStatus: 'Active'
    });
  },
  delete: (id) => deleteRow(TABLE, id)
};

export default memberApi;
