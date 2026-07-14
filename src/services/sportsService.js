import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const CATEGORY_TABLE = 'SportCategories';
const LEGACY_TOURNAMENT_TABLE = 'SportTournamentRecords';
const TOURNAMENT_TABLE = 'SportsTournaments';

const mapTournamentPayload = (payload) => ({
  tournamentName: payload.tournamentName,
  tournamentType: payload.tournamentType,
  hostedBy: payload.hostedBy,
  year: Number(payload.year) || new Date().getFullYear(),
  venue: payload.venue,
  description: payload.description,
  result: payload.result,
  images: Array.isArray(payload.images) ? payload.images : [],
  currentTournament: payload.currentTournament,
  matchSchedule: payload.matchSchedule,
  teamDetails: payload.teamDetails,
  status: payload.status,
  sortOrder: Number(payload.sortOrder) || 0
});

const sportsApi = {
  getCategories: () => listRows(CATEGORY_TABLE, { orderBy: 'Id', ascending: true }),
  getCategoryById: (id) => getRowById(CATEGORY_TABLE, id),
  createCategory: (payload) => createRow(CATEGORY_TABLE, payload),
  updateCategory: (id, payload) => updateRow(CATEGORY_TABLE, id, payload),
  deleteCategory: (id) => deleteRow(CATEGORY_TABLE, id),
  getLegacyTournaments: () => listRows(LEGACY_TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true }),
  getTournaments: () => listRows(TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true }),
  getTournamentById: (id) => getRowById(TOURNAMENT_TABLE, id),
  createTournament: (payload) => createRow(TOURNAMENT_TABLE, mapTournamentPayload(payload)),
  updateTournament: (id, payload) => updateRow(TOURNAMENT_TABLE, id, mapTournamentPayload(payload)),
  deleteTournament: (id) => deleteRow(TOURNAMENT_TABLE, id)
};

export default sportsApi;