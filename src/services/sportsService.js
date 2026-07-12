import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const CATEGORY_TABLE = 'SportCategories';
const TOURNAMENT_TABLE = 'SportTournamentRecords';

const sportsApi = {
  getCategories: () => listRows(CATEGORY_TABLE, { orderBy: 'Id', ascending: true }),
  getCategoryById: (id) => getRowById(CATEGORY_TABLE, id),
  createCategory: (payload) => createRow(CATEGORY_TABLE, payload),
  updateCategory: (id, payload) => updateRow(CATEGORY_TABLE, id, payload),
  deleteCategory: (id) => deleteRow(CATEGORY_TABLE, id),
  getTournaments: () => listRows(TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true }),
  getTournamentById: (id) => getRowById(TOURNAMENT_TABLE, id),
  createTournament: (payload) => createRow(TOURNAMENT_TABLE, payload),
  updateTournament: (id, payload) => updateRow(TOURNAMENT_TABLE, id, payload),
  deleteTournament: (id) => deleteRow(TOURNAMENT_TABLE, id)
};

export default sportsApi;