import { supabase } from './supabaseClient';
import { ensureSupabaseConfigured } from './supabaseDb';

const USERS_TABLE = 'AppUsers';

const mapProfile = (row) => ({
  id: row.Id,
  fullName: row.FullName,
  email: row.Email,
  role: row.Role,
  membershipStatus: row.MembershipStatus,
  membershipExpires: row.MembershipExpires
});

const fetchAppUserByEmail = async (email) => {
  const response = await supabase.from(USERS_TABLE).select('*').eq('Email', email).maybeSingle();
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
  register: async (payload) => {
    ensureSupabaseConfigured();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          fullName: payload.fullName
        }
      }
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    const membershipStatus = payload.requestAdminApproval ? 'Pending Admin Approval' : 'Active';
    const role = 'General Public';

    const profile = await upsertAppUser({
      FullName: payload.fullName,
      Email: payload.email,
      PasswordHash: '',
      Role: role,
      MembershipStatus: membershipStatus,
      MembershipExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    let session = signUpData.session;
    if (!session) {
      const loginResult = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error) {
      throw new Error(error.message);
    }

    const profile = await fetchAppUserByEmail(payload.email);
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

    const profile = await fetchAppUserByEmail(email);
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

    const current = await fetchAppUserByEmail(email);
    if (!current) {
      throw new Error('Profile not found.');
    }

    const updated = await upsertAppUser({
      ...current,
      FullName: payload.fullName || current.FullName
    });

    return mapProfile(updated);
  },
  logout: async () => {
    await supabase.auth.signOut();
  }
};

export default authApi;
