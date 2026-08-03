import aboutApi from './aboutService';

export const SITE_CONTENT_KEYS = {
  homeHeroTitle: 'HOME_HERO_TITLE',
  homeHeroSubtitle: 'HOME_HERO_SUBTITLE',
  homePrimaryCtaLabel: 'HOME_PRIMARY_CTA_LABEL',
  homePrimaryCtaPath: 'HOME_PRIMARY_CTA_PATH',
  homeSecondaryCtaLabel: 'HOME_SECONDARY_CTA_LABEL',
  homeSecondaryCtaPath: 'HOME_SECONDARY_CTA_PATH',
  homeContactBanner: 'HOME_CONTACT_BANNER',
  contactIntro: 'CONTACT_INTRO',
  contactEmail: 'CONTACT_EMAIL',
  contactPhone: 'CONTACT_PHONE',
  contactAddress: 'CONTACT_ADDRESS',
  contactInstagramUrl: 'CONTACT_INSTAGRAM_URL',
  footerTagline: 'FOOTER_TAGLINE'
};

const CMS_SORT_BASE = 9000;
const CMS_KEY_SET = new Set(Object.values(SITE_CONTENT_KEYS));

const normalize = (value) => String(value || '').trim();

const getAllSections = async () => {
  const sections = await aboutApi.getAll();
  return Array.isArray(sections) ? sections : [];
};

const getSectionByKey = (sections, key) => {
  const normalizedKey = normalize(key);
  return sections.find((item) => normalize(item.title) === normalizedKey);
};

const upsertByKey = async (sections, key, value, sortOrderOffset = 0) => {
  const existing = getSectionByKey(sections, key);
  const payload = {
    title: key,
    body: normalize(value),
    sortOrder: CMS_SORT_BASE + sortOrderOffset,
    isActive: true
  };

  if (existing?.id) {
    return aboutApi.update(existing.id, payload);
  }

  return aboutApi.create(payload);
};

const siteContentService = {
  getAll: async () => {
    const sections = await getAllSections();
    return sections.reduce((acc, item) => {
      const key = normalize(item.title);
      if (key) {
        acc[key] = item.body || '';
      }
      return acc;
    }, {});
  },

  getPublicAboutSections: async () => {
    const sections = await getAllSections();
    return sections.filter((item) => !CMS_KEY_SET.has(normalize(item.title)));
  },

  saveHomeContent: async (payload) => {
    const sections = await getAllSections();
    const entries = [
      [SITE_CONTENT_KEYS.homeHeroTitle, payload.homeHeroTitle, 1],
      [SITE_CONTENT_KEYS.homeHeroSubtitle, payload.homeHeroSubtitle, 2],
      [SITE_CONTENT_KEYS.homePrimaryCtaLabel, payload.homePrimaryCtaLabel, 3],
      [SITE_CONTENT_KEYS.homePrimaryCtaPath, payload.homePrimaryCtaPath, 4],
      [SITE_CONTENT_KEYS.homeSecondaryCtaLabel, payload.homeSecondaryCtaLabel, 5],
      [SITE_CONTENT_KEYS.homeSecondaryCtaPath, payload.homeSecondaryCtaPath, 6],
      [SITE_CONTENT_KEYS.homeContactBanner, payload.homeContactBanner, 7]
    ];

    for (const [key, value, offset] of entries) {
      await upsertByKey(sections, key, value, offset);
    }
  },

  saveContactFooterContent: async (payload) => {
    const sections = await getAllSections();
    const entries = [
      [SITE_CONTENT_KEYS.contactIntro, payload.contactIntro, 21],
      [SITE_CONTENT_KEYS.contactEmail, payload.contactEmail, 22],
      [SITE_CONTENT_KEYS.contactPhone, payload.contactPhone, 23],
      [SITE_CONTENT_KEYS.contactAddress, payload.contactAddress, 24],
      [SITE_CONTENT_KEYS.contactInstagramUrl, payload.contactInstagramUrl, 25],
      [SITE_CONTENT_KEYS.footerTagline, payload.footerTagline, 26]
    ];

    for (const [key, value, offset] of entries) {
      await upsertByKey(sections, key, value, offset);
    }
  }
};

export default siteContentService;