import { listRows } from './supabaseDb';

const TABLE = 'Villages';

const villageApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Name', ascending: true })
};

export default villageApi;
