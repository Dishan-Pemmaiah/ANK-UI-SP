import { createRow, deleteRow, listRows, updateRow } from './supabaseDb';

const TABLE = 'LiveUpdates';

const liveApi = {
  getCurrent: async () => {
    const history = await listRows(TABLE, { orderBy: 'CreatedOn', ascending: false, limit: 1 });
    return history[0] || null;
  },
  getHistory: () => listRows(TABLE, { orderBy: 'CreatedOn', ascending: false, limit: 20 }),
  getStatus: async () => {
    const current = await liveApi.getCurrent();
    return current;
  },
  broadcast: async (message) => {
    return createRow(TABLE, {
      message,
      createdOn: new Date().toISOString()
    });
  },
  update: (id, message) => updateRow(TABLE, id, { message }),
  delete: (id) => deleteRow(TABLE, id)
};

export default liveApi;
