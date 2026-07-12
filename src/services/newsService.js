import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'NewsItems';

const newsApi = {
  getAll: () => listRows(TABLE, { orderBy: 'PublishedOn', ascending: false }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, payload),
  update: (id, payload) => updateRow(TABLE, id, payload),
  delete: (id) => deleteRow(TABLE, id)
};

export default newsApi;
