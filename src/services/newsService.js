import { createRow, deleteRow, getRowById, listRows, updateRow } from './supabaseDb';

const TABLE = 'NewsItems';

const ORDER_FALLBACKS = [
  { orderBy: 'PublishedOn', ascending: false },
  { orderBy: 'CreatedOn', ascending: false },
  { orderBy: 'Id', ascending: false },
  { orderBy: null }
];

async function listNewsWithFallbacks() {
  for (const option of ORDER_FALLBACKS) {
    try {
      return await listRows(TABLE, option);
    } catch {
      // Try the next fallback order when a column is not available in this environment.
    }
  }

  return [];
}

function withRequiredNewsFields(payload = {}) {
  const hasIsFeatured = Object.prototype.hasOwnProperty.call(payload, 'isFeatured');

  return {
    ...payload,
    publishedOn: payload.publishedOn || new Date().toISOString(),
    isFeatured: hasIsFeatured ? Boolean(payload.isFeatured) : false
  };
}

const newsApi = {
  getAll: listNewsWithFallbacks,
  getById: (id) => getRowById(TABLE, id),
  create: (payload) => createRow(TABLE, withRequiredNewsFields(payload)),
  update: (id, payload) => updateRow(TABLE, id, withRequiredNewsFields(payload)),
  delete: (id) => deleteRow(TABLE, id)
};

export default newsApi;
