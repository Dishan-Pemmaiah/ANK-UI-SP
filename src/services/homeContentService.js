import { createRow, listRows, updateRow } from './supabaseDb';

const TABLE = 'HomePageContents';

const isMissingTableError = (error) => {
  const message = error?.message || '';
  return /table/i.test(message) && /schema cache|does not exist|not found/i.test(message);
};

const defaultContent = {
  heroTitle: 'Anjigeri Naad Koota',
  heroSubtitle: 'Community. Sport. Heritage.',
  welcomeSection: 'Welcome to ANK. Stay connected with events, stories, and live updates.',
  aboutSection: 'A bold home for Kodava heritage, competitive sport, village unity, and club history.',
  featuredContent: 'Latest club highlights and announcements appear here.',
  homeImages: [],
  announcements: ''
};

export const HOME_CONTENT_DEFAULTS = { ...defaultContent };

const normalize = (row) => {
  if (!row) {
    return { ...defaultContent };
  }

  return {
    ...defaultContent,
    ...row,
    homeImages: Array.isArray(row.homeImages) ? row.homeImages : []
  };
};

const homeContentApi = {
  get: async () => {
    try {
      const rows = await listRows(TABLE, { orderBy: 'Id', ascending: true, limit: 1 });
      return normalize(rows[0]);
    } catch (error) {
      if (isMissingTableError(error)) {
        return normalize(null);
      }
      throw error;
    }
  },
  save: async (payload) => {
    try {
      const rows = await listRows(TABLE, { orderBy: 'Id', ascending: true, limit: 1 });
      const existing = rows[0];

      const data = {
        ...defaultContent,
        ...payload,
        homeImages: Array.isArray(payload?.homeImages) ? payload.homeImages : []
      };

      if (!existing) {
        const created = await createRow(TABLE, data);
        return normalize(created);
      }

      const updated = await updateRow(TABLE, existing.id, data);
      return normalize(updated);
    } catch (error) {
      if (isMissingTableError(error)) {
        const created = await createRow(TABLE, {
          ...defaultContent,
          ...payload,
          homeImages: Array.isArray(payload?.homeImages) ? payload.homeImages : []
        });
        return normalize(created);
      }
      throw error;
    }
  }
};

export default homeContentApi;
