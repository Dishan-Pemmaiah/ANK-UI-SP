import { createRow, deleteRow, listRows, updateRow } from './supabaseDb';

const TABLE = 'LiveUpdates';

const ORDER_FALLBACKS = [
  { orderBy: 'CreatedOn', ascending: false },
  { orderBy: 'CreatedAt', ascending: false },
  { orderBy: 'Id', ascending: false },
  { orderBy: null }
];

const normalizeYouTubeUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (text.includes('youtube.com/embed/')) {
    return text;
  }

  const fromYouTubePath = text.match(/youtube\.com\/(?:live|shorts)\/([a-zA-Z0-9_-]+)/i);
  if (fromYouTubePath) {
    return `https://www.youtube.com/embed/${fromYouTubePath[1]}`;
  }

  const watchMatch = text.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = text.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  if (/^[a-zA-Z0-9_-]{8,}$/.test(text)) {
    return `https://www.youtube.com/embed/${text}`;
  }

  return text;
};

const getErrorText = (error) => String(error?.message || '').toLowerCase();

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

const createWithColumnFallback = async (payload) => {
  let nextPayload = { ...payload };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await createRow(TABLE, nextPayload);
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const missingColumn = extractMissingColumn(error);
      const stripped = removePayloadColumn(nextPayload, missingColumn);
      if (Object.keys(stripped).length === Object.keys(nextPayload).length) {
        throw error;
      }
      nextPayload = stripped;
    }
  }

  return createRow(TABLE, nextPayload);
};

const updateWithColumnFallback = async (id, payload) => {
  let nextPayload = { ...payload };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await updateRow(TABLE, id, nextPayload);
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const missingColumn = extractMissingColumn(error);
      const stripped = removePayloadColumn(nextPayload, missingColumn);
      if (Object.keys(stripped).length === Object.keys(nextPayload).length) {
        throw error;
      }
      nextPayload = stripped;
    }
  }

  return updateRow(TABLE, id, nextPayload);
};

const listLiveWithFallbacks = async (limit) => {
  for (const option of ORDER_FALLBACKS) {
    try {
      return await listRows(TABLE, { ...option, limit });
    } catch {
      // Try next sort fallback when a timestamp column is not available.
    }
  }

  return [];
};

const normalizePayload = (payload) => {
  const isTextPayload = typeof payload === 'string';
  const source = isTextPayload ? { message: payload } : (payload || {});
  const now = new Date().toISOString();
  const message = String(source.message || source.description || '').trim();
  const rawLink = String(source.streamUrl || source.youtubeUrl || source.streamLink || '').trim();
  const streamUrl = normalizeYouTubeUrl(rawLink);
  const hasUrlInMessage = /https?:\/\/[^\s]+/i.test(message);
  const messageWithLink = streamUrl && !hasUrlInMessage
    ? [message, rawLink || streamUrl].filter(Boolean).join(' ').trim()
    : message;
  const description = String(source.description || messageWithLink || '').trim();
  const hasUrlInDescription = /https?:\/\/[^\s]+/i.test(description);
  const descriptionWithLink = streamUrl && !hasUrlInDescription
    ? [description, rawLink || streamUrl].filter(Boolean).join(' ').trim()
    : description;

  return {
    message: messageWithLink,
    description: descriptionWithLink,
    streamUrl,
    youtubeUrl: source.youtubeUrl || streamUrl,
    createdOn: source.createdOn || now,
    createdAt: source.createdAt || now
  };
};

const liveApi = {
  getCurrent: async () => {
    const history = await listLiveWithFallbacks(1);
    return history[0] || null;
  },
  getHistory: () => listLiveWithFallbacks(20),
  getStatus: async () => {
    const current = await liveApi.getCurrent();
    return current;
  },
  broadcast: (payload) => createWithColumnFallback(normalizePayload(payload)),
  update: (id, payload) => updateWithColumnFallback(id, normalizePayload(payload)),
  delete: (id) => deleteRow(TABLE, id)
};

export default liveApi;
