import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'CommitteeMembers';

const removePhotoUrl = (payload = {}) => {
  const { photoUrl, ...rest } = payload;
  return rest;
};

const isMissingPhotoColumnError = (error) => {
  const message = String(error?.message || '');
  return message.includes("Could not find the 'PhotoUrl' column");
};

const createCommitteeRow = async (payload) => {
  try {
    return await createRow(TABLE, payload);
  } catch (error) {
    if (isMissingPhotoColumnError(error)) {
      return createRow(TABLE, removePhotoUrl(payload));
    }
    throw error;
  }
};

const updateCommitteeRow = async (id, payload) => {
  try {
    return await updateRow(TABLE, id, payload);
  } catch (error) {
    if (isMissingPhotoColumnError(error)) {
      return updateRow(TABLE, id, removePhotoUrl(payload));
    }
    throw error;
  }
};

const committeeApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: true }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createCommitteeRow(payload),
  update: (id, payload) => updateCommitteeRow(id, payload),
  delete: (id) => deleteRow(TABLE, id)
};

export default committeeApi;
