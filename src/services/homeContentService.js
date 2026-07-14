import { createRow, listRows, updateRow } from './supabaseDb';

const TABLE = 'HomePageContents';

const defaultContent = {
  heroTitle: 'Anjigeri Naad Koota',
  heroSubtitle: 'Community. Sport. Heritage.',
  welcomeSection: 'Welcome to ANK. Stay connected with events, stories, and live updates.',
  aboutSection: 'A bold home for Kodava heritage, competitive sport, village unity, and club history.',
  featuredContent: 'Latest club highlights and announcements appear here.',
  homeImages: [],
  announcements: ''
};

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
    const rows = await listRows(TABLE, { orderBy: 'Id', ascending: true, limit: 1 });
    return normalize(rows[0]);
  },
  save: async (payload) => {
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
  }
};

export default homeContentApi;
