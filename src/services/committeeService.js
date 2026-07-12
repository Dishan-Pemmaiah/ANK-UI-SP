import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'CommitteeMembers';

const committeeApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: true }),
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, payload),
  update: (id, payload) => updateRow(TABLE, id, payload),
  delete: (id) => deleteRow(TABLE, id)
};

export default committeeApi;
