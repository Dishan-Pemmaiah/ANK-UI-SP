import apiClient from './apiClient';
import authApi from './authService';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const toProfilePayload = (payload) => ({
  fullName: payload.fullName,
  email: normalizeEmail(payload.email),
  role: payload.role,
  membershipStatus: payload.membershipStatus,
  membershipExpires: payload.membershipExpires,
  password: payload.password
});

const isAlreadyRegisteredError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('already') || message.includes('exists');
};

const memberApi = {
  getAll: async () => {
    const response = await apiClient.get('/Members/all');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Members/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const normalized = toProfilePayload(payload);

    if (normalized.password) {
      try {
        await authApi.register({
          fullName: normalized.fullName,
          email: normalized.email,
          password: normalized.password,
          requestAdminApproval: false
        });
      } catch (error) {
        if (!isAlreadyRegisteredError(error)) {
          throw error;
        }
      }
    }

    const existingMembers = await memberApi.getAll();
    const existing = Array.isArray(existingMembers)
      ? existingMembers.find((member) => normalizeEmail(member.email) === normalized.email)
      : null;

    if (existing?.id) {
      const updateResponse = await apiClient.put(`/Members/${existing.id}`, normalized);
      return updateResponse.data;
    }

    const response = await apiClient.post('/Members', normalized);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Members/${id}`, toProfilePayload(payload));
    return response.data;
  },
  approveAdmin: async (id) => {
    const response = await apiClient.post(`/Members/${id}/approve-admin`);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Members/${id}`);
    return response.data;
  }
};

export default memberApi;
