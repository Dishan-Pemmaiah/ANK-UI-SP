import { createRow, listRows } from './supabaseDb';

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
  }
};

export default liveApi;
