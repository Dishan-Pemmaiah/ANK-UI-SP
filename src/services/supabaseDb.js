import { supabase } from './supabaseClient';

const toCamelKey = (key) => key.charAt(0).toLowerCase() + key.slice(1);
const toPascalKey = (key) => key.charAt(0).toUpperCase() + key.slice(1);

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const fromDb = (value) => {
  if (Array.isArray(value)) {
    return value.map(fromDb);
  }

  if (!isObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((result, [key, itemValue]) => {
    result[toCamelKey(key)] = fromDb(itemValue);
    return result;
  }, {});
};

export const toDb = (value) => {
  if (Array.isArray(value)) {
    return value.map(toDb);
  }

  if (!isObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((result, [key, itemValue]) => {
    if (itemValue !== undefined) {
      result[toPascalKey(key)] = toDb(itemValue);
    }
    return result;
  }, {});
};

export const ensureSupabaseConfigured = () => {
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }
};

const unwrap = (response) => {
  if (response.error) {
    throw new Error(response.error.message);
  }

  return fromDb(response.data);
};

export const listRows = async (table, options = {}) => {
  ensureSupabaseConfigured();

  const {
    orderBy = 'Id',
    ascending = false,
    limit,
    eq = []
  } = options;

  let query = supabase.from(table).select('*');

  eq.forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  if (orderBy) {
    query = query.order(orderBy, { ascending });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const response = await query;
  return unwrap(response) || [];
};

export const getRowById = async (table, id) => {
  ensureSupabaseConfigured();
  const response = await supabase.from(table).select('*').eq('Id', id).maybeSingle();
  return unwrap(response);
};

export const createRow = async (table, payload) => {
  ensureSupabaseConfigured();
  const response = await supabase.from(table).insert(toDb(payload)).select('*').single();
  return unwrap(response);
};

export const updateRow = async (table, id, payload) => {
  ensureSupabaseConfigured();
  const response = await supabase.from(table).update(toDb(payload)).eq('Id', id).select('*').single();
  return unwrap(response);
};

export const deleteRow = async (table, id) => {
  ensureSupabaseConfigured();
  const response = await supabase.from(table).delete().eq('Id', id).select('*').maybeSingle();
  return unwrap(response);
};
