import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'AboutSections';

const aboutApi = {
  getAll: () => listRows(TABLE, { orderBy: 'SortOrder', ascending: true }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, payload),
  update: (id, payload) => updateRow(TABLE, id, payload),
  delete: (id) => deleteRow(TABLE, id)
};

export default aboutApi;