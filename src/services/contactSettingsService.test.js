import contactSettingsApi from './contactSettingsService';
import { listRows, createRow, updateRow } from './supabaseDb';

jest.mock('./supabaseDb', () => ({
  listRows: jest.fn(),
  createRow: jest.fn(),
  updateRow: jest.fn()
}));

describe('contactSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('returns default values when the contact settings table is missing', async () => {
    listRows.mockRejectedValue(new Error("Could not find the table 'public.ContactSettings' in the schema cache"));

    const result = await contactSettingsApi.get();

    expect(result.email).toBe('anjigerinaad@gmail.com');
    expect(result.footerTitle).toBe('Anjigeri Naada');
    expect(result.quickLinks[0].path).toBe('/');
  });
});
