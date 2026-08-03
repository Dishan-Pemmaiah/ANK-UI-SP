import { createRow, listRows, updateRow } from './supabaseDb';

const TABLE = 'ContactSettings';

const isMissingTableError = (error) => {
  const message = error?.message || '';
  return /table/i.test(message) && /schema cache|does not exist|not found/i.test(message);
};

const defaultSettings = {
  email: 'anjigerinaad@gmail.com',
  phoneNumber: '',
  address: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  footerTitle: 'Anjigeri Naada',
  copyrightText: 'Copyright © Anjigeri Naad Koota',
  quickLinks: [
    { label: 'Home', path: '/' },
    { label: 'Villages', path: '/villages' },
    { label: 'Events', path: '/events' },
    { label: 'Sports', path: '/sports' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' }
  ]
};

const normalize = (row) => {
  if (!row) {
    return { ...defaultSettings };
  }

  return {
    ...defaultSettings,
    ...row,
    quickLinks: Array.isArray(row.quickLinks) && row.quickLinks.length ? row.quickLinks : defaultSettings.quickLinks
  };
};

const contactSettingsApi = {
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
        ...defaultSettings,
        ...payload,
        quickLinks: Array.isArray(payload?.quickLinks) && payload.quickLinks.length ? payload.quickLinks : defaultSettings.quickLinks
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
          ...defaultSettings,
          ...payload,
          quickLinks: Array.isArray(payload?.quickLinks) && payload.quickLinks.length ? payload.quickLinks : defaultSettings.quickLinks
        });
        return normalize(created);
      }
      throw error;
    }
  }
};

export default contactSettingsApi;
