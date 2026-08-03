import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const CATEGORY_TABLE = 'SportCategories';
const LEGACY_TOURNAMENT_TABLE = 'SportTournamentRecords';
const TOURNAMENT_TABLE = 'SportsTournaments';

const getErrorText = (error) => String(error?.message || '').toLowerCase();

const isMissingTableError = (error, tableName) => {
  const text = getErrorText(error);
  return text.includes('could not find the table')
    && text.includes((tableName || '').toLowerCase())
    && text.includes('schema cache');
};

const mapLegacyTournamentPayload = (payload) => ({
  tournamentName: payload.tournamentName,
  sportName: payload.sportName || payload.sport || 'Other',
  tournamentType: payload.tournamentType,
  hostedBy: payload.hostedBy,
  year: Number(payload.year) || new Date().getFullYear(),
  venue: payload.venue,
  description: payload.description,
  result: payload.result,
  images: Array.isArray(payload.images) ? payload.images : [],
  currentTournament: payload.currentTournament,
  fixtureLabel: payload.fixtureLabel || '',
  teamA: payload.teamA || '',
  teamB: payload.teamB || '',
  playing11: payload.playing11 || '',
  hostedFixtures: payload.hostedFixtures || '',
  pointsTable: payload.pointsTable || '',
  otherStats: payload.otherStats || '',
  matchSchedule: payload.matchSchedule,
  teamDetails: payload.teamDetails,
  status: payload.status,
  sortOrder: Number(payload.sortOrder) || 0
});

const mapTournamentPayload = (payload) => ({
  ...mapLegacyTournamentPayload(payload),
  registrationLink: payload.registrationLink || '',
  liveLink: payload.liveLink || ''
});

const isMissingColumnError = (error) => {
  const text = getErrorText(error);
  return text.includes('could not find the') && text.includes('column');
};

const extractMissingColumn = (error) => {
  const message = String(error?.message || '');
  const singleQuoteMatch = message.match(/'([^']+)'\s+column/i);
  if (singleQuoteMatch?.[1]) {
    return singleQuoteMatch[1];
  }

  const genericMatch = message.match(/column\s+"?([A-Za-z0-9_]+)"?/i);
  return genericMatch?.[1] || '';
};

const removePayloadColumn = (payload, columnName) => {
  const normalizedColumn = String(columnName || '').toLowerCase();
  if (!normalizedColumn) {
    return payload;
  }

  const next = { ...payload };
  Object.keys(next).forEach((key) => {
    const camel = key.toLowerCase();
    const pascal = (key.charAt(0).toUpperCase() + key.slice(1)).toLowerCase();
    if (camel === normalizedColumn || pascal === normalizedColumn) {
      delete next[key];
    }
  });

  return next;
};

const createWithFallback = async (table, payload) => {
  let nextPayload = { ...payload };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await createRow(table, nextPayload);
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const missingColumn = extractMissingColumn(error);
      const stripped = removePayloadColumn(nextPayload, missingColumn);
      if (Object.keys(stripped).length === Object.keys(nextPayload).length) {
        return createRow(table, mapLegacyTournamentPayload(payload));
      }
      nextPayload = stripped;
    }
  }

  return createRow(table, mapLegacyTournamentPayload(payload));
};

const updateWithFallback = async (table, id, payload) => {
  let nextPayload = { ...payload };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await updateRow(table, id, nextPayload);
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const missingColumn = extractMissingColumn(error);
      const stripped = removePayloadColumn(nextPayload, missingColumn);
      if (Object.keys(stripped).length === Object.keys(nextPayload).length) {
        return updateRow(table, id, mapLegacyTournamentPayload(payload));
      }
      nextPayload = stripped;
    }
  }

  return updateRow(table, id, mapLegacyTournamentPayload(payload));
};

const listTournamentsWithFallback = async () => {
  try {
    return await listRows(TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true });
  } catch (error) {
    if (!isMissingTableError(error, TOURNAMENT_TABLE)) {
      throw error;
    }
    return listRows(LEGACY_TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true });
  }
};

const getTournamentByIdWithFallback = async (id) => {
  try {
    return await getRowById(TOURNAMENT_TABLE, id);
  } catch (error) {
    if (!isMissingTableError(error, TOURNAMENT_TABLE)) {
      throw error;
    }
    return getRowById(LEGACY_TOURNAMENT_TABLE, id);
  }
};

const createTournamentWithFallback = async (payload) => {
  const mapped = mapTournamentPayload(payload);
  try {
    return await createWithFallback(TOURNAMENT_TABLE, mapped);
  } catch (error) {
    if (!isMissingTableError(error, TOURNAMENT_TABLE)) {
      throw error;
    }
    return createWithFallback(LEGACY_TOURNAMENT_TABLE, mapLegacyTournamentPayload(mapped));
  }
};

const updateTournamentWithFallback = async (id, payload) => {
  const mapped = mapTournamentPayload(payload);
  try {
    return await updateWithFallback(TOURNAMENT_TABLE, id, mapped);
  } catch (error) {
    if (!isMissingTableError(error, TOURNAMENT_TABLE)) {
      throw error;
    }
    return updateWithFallback(LEGACY_TOURNAMENT_TABLE, id, mapLegacyTournamentPayload(mapped));
  }
};

const deleteTournamentWithFallback = async (id) => {
  try {
    return await deleteRow(TOURNAMENT_TABLE, id);
  } catch (error) {
    if (!isMissingTableError(error, TOURNAMENT_TABLE)) {
      throw error;
    }
    return deleteRow(LEGACY_TOURNAMENT_TABLE, id);
  }
};

const sportsApi = {
  getCategories: () => listRows(CATEGORY_TABLE, { orderBy: 'Id', ascending: true }),
  getCategoryById: (id) => getRowById(CATEGORY_TABLE, id),
  createCategory: (payload) => createRow(CATEGORY_TABLE, payload),
  updateCategory: (id, payload) => updateRow(CATEGORY_TABLE, id, payload),
  deleteCategory: (id) => deleteRow(CATEGORY_TABLE, id),
  getLegacyTournaments: () => listRows(LEGACY_TOURNAMENT_TABLE, { orderBy: 'SortOrder', ascending: true }),
  getTournaments: () => listTournamentsWithFallback(),
  getTournamentById: (id) => getTournamentByIdWithFallback(id),
  createTournament: (payload) => createTournamentWithFallback(payload),
  updateTournament: (id, payload) => updateTournamentWithFallback(id, payload),
  deleteTournament: (id) => deleteTournamentWithFallback(id)
};

export default sportsApi;