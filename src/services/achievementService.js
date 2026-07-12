import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'Achievements';

const achievementApi = {
  getAll: () => listRows(TABLE, { orderBy: 'AwardedOn', ascending: false }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, payload),
  update: (id, payload) => updateRow(TABLE, id, payload),
  delete: (id) => deleteRow(TABLE, id)
};

export default achievementApi;
