import { supabase } from './supabaseClient';
import { ensureSupabaseConfigured } from './supabaseDb';

const USERS_TABLE = 'AppUsers';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeRole = (value) => String(value || '').trim().toLowerCase();

const mapAuthError = (message) => {
  const text = String(message || '').toLowerCase();

  if (text.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (text.includes('email not confirmed')) {
    return 'Your email is not confirmed yet. Please verify your inbox before logging in.';
  }

  if (text.includes('user already registered')) {
    return 'This email is already registered. Please use login instead.';
  }

  return message || 'Authentication failed.';
};

const mapProfile = (row) => ({
  id: row.Id,
  fullName: row.FullName,
  email: row.Email,
  role: row.Role,
  membershipStatus: row.MembershipStatus,
  membershipExpires: row.MembershipExpires
});

const fetchAppUserByEmail = async (email) => {
  const response = await supabase.from(USERS_TABLE).select('*').ilike('Email', normalizeEmail(email)).maybeSingle();
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
};

const upsertAppUser = async (payload) => {
  const existing = await fetchAppUserByEmail(payload.Email);

  if (existing) {
    const updateResponse = await supabase
      .from(USERS_TABLE)
      .update(payload)
      .eq('Id', existing.Id)
      .select('*')
      .single();

    if (updateResponse.error) {
      throw new Error(updateResponse.error.message);
    }

    return updateResponse.data;
  }

  const insertResponse = await supabase
    .from(USERS_TABLE)
    .insert(payload)
    .select('*')
    .single();

  if (insertResponse.error) {
    throw new Error(insertResponse.error.message);
  }

  return insertResponse.data;
};

const authApi = {
  getActiveSession: async () => {
    ensureSupabaseConfigured();
    const response = await supabase.auth.getSession();
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data.session || null;
  },
  ensureAuthUser: async ({ email, password, fullName }) => {
    ensureSupabaseConfigured();

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return { created: false, warning: 'Email and password are required to create a login account.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          fullName: fullName || ''
        }
      }
    });

    if (error) {
      const mapped = mapAuthError(error.message);
      if (mapped.toLowerCase().includes('already registered')) {
        return { created: false, warning: mapped };
      }
      throw new Error(mapped);
    }

    return { created: Boolean(data?.user?.id), warning: '' };
  },
  register: async (payload) => {
    ensureSupabaseConfigured();

    const normalizedEmail = normalizeEmail(payload.email);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: payload.password,
      options: {
        data: {
          fullName: payload.fullName
        }
      }
    });

    if (signUpError) {
      throw new Error(mapAuthError(signUpError.message));
    }

    const membershipStatus = payload.requestAdminApproval ? 'Pending Admin Approval' : 'Active';
    const role = 'General Public';

    const profile = await upsertAppUser({
      FullName: payload.fullName,
      Email: normalizedEmail,
      PasswordHash: '',
      Role: role,
      MembershipStatus: membershipStatus,
      MembershipExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    let session = signUpData.session;
    if (!session) {
      const loginResult = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: payload.password });
      if (!loginResult.error) {
        session = loginResult.data.session;
      }
    }

    return {
      token: session?.access_token || '',
      role: profile.Role,
      fullName: profile.FullName
    };
  },
  login: async (payload) => {
    ensureSupabaseConfigured();

    const normalizedEmail = normalizeEmail(payload.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: payload.password
    });

    if (error) {
      throw new Error(mapAuthError(error.message));
    }

    const profile = await fetchAppUserByEmail(normalizedEmail);
    if (!profile) {
      throw new Error('Profile not found for this account.');
    }

    return {
      token: data.session?.access_token || '',
      role: profile.Role,
      fullName: profile.FullName
    };
  },
  getProfile: async () => {
    ensureSupabaseConfigured();

    const sessionResult = await supabase.auth.getSession();
    const email = sessionResult.data.session?.user?.email;
    if (!email) {
      throw new Error('Not authenticated.');
    }

    const profile = await fetchAppUserByEmail(normalizeEmail(email));
    if (!profile) {
      throw new Error('Profile not found.');
    }

    return mapProfile(profile);
  },
  updateProfile: async (payload) => {
    ensureSupabaseConfigured();

    const sessionResult = await supabase.auth.getSession();
    const email = sessionResult.data.session?.user?.email;
    if (!email) {
      throw new Error('Not authenticated.');
    }

    const current = await fetchAppUserByEmail(normalizeEmail(email));
    if (!current) {
      throw new Error('Profile not found.');
    }

    const updated = await upsertAppUser({
      ...current,
      FullName: payload.fullName || current.FullName
    });

    return mapProfile(updated);
  },
  isAdminRole: (role) => normalizeRole(role) === 'admin',
  logout: async () => {
    await supabase.auth.signOut();
  }
};

export default authApi;
