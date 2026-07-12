import { listRows } from './supabaseDb';

const TABLE = 'HallOfFameItems';

const hallOfFameApi = {
  getAll: () => listRows(TABLE, { orderBy: 'Id', ascending: false })
};

export default hallOfFameApi;
