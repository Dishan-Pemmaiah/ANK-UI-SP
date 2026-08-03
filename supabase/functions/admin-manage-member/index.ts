import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});

const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const authorization = request.headers.get('Authorization') || '';

    if (!url || !anonKey || !serviceRoleKey || !authorization) {
      return json({ error: 'Function configuration or authorization is missing.' }, 401);
    }

    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } }
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    const callerEmail = normalizeEmail(callerData.user?.email);
    if (callerError || !callerEmail) {
      return json({ error: 'You must be signed in to manage members.' }, 401);
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: callerProfile, error: profileError } = await adminClient
      .from('AppUsers')
      .select('Role')
      .ilike('Email', callerEmail)
      .maybeSingle();
    if (profileError || String(callerProfile?.Role || '').trim().toLowerCase() !== 'admin') {
      return json({ error: 'Only administrators can manage member login accounts.' }, 403);
    }

    const input = await request.json();
    const action = input.action;
    const memberId = input.memberId;
    const email = normalizeEmail(input.email);
    const password = String(input.password || '');
    const fullName = String(input.fullName || '').trim();
    if (!['create', 'update'].includes(action) || !email || !fullName) {
      return json({ error: 'A name, email, and valid action are required.' }, 400);
    }
    if (action === 'create' && password.length < 6) {
      return json({ error: 'New members need a password of at least 6 characters.' }, 400);
    }

    let existingMember = null;
    if (action === 'update') {
      const result = await adminClient.from('AppUsers').select('*').eq('Id', memberId).maybeSingle();
      if (result.error || !result.data) return json({ error: 'Member not found.' }, 404);
      existingMember = result.data;
    }

    const { data: emailOwner, error: emailOwnerError } = await adminClient
      .from('AppUsers')
      .select('Id')
      .ilike('Email', email)
      .maybeSingle();
    if (emailOwnerError) throw emailOwnerError;
    if (emailOwner && String(emailOwner.Id) !== String(memberId || '')) {
      return json({ error: 'Another member already uses this email address.' }, 409);
    }

    const authLookupEmail = normalizeEmail(existingMember?.Email || email);
    const { data: usersPage, error: usersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw usersError;
    let authUser = usersPage.users.find((user) => normalizeEmail(user.email) === authLookupEmail);
    let createdAuthUserId = '';

    if (authUser) {
      const attributes: { email?: string; password?: string; user_metadata: { fullName: string } } = {
        user_metadata: { fullName }
      };
      if (email !== authLookupEmail) attributes.email = email;
      if (password) attributes.password = password;
      const { data, error } = await adminClient.auth.admin.updateUserById(authUser.id, attributes);
      if (error) throw error;
      authUser = data.user;
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { fullName }
      });
      if (error) throw error;
      authUser = data.user;
      createdAuthUserId = authUser.id;
    }

    const memberPayload = {
      FullName: fullName,
      Email: email,
      PasswordHash: '',
      Role: input.role || 'General Public',
      MembershipStatus: input.membershipStatus || 'Active',
      MembershipExpires: input.membershipExpires
    };
    const memberResponse = action === 'create'
      ? await adminClient.from('AppUsers').insert(memberPayload).select('*').single()
      : await adminClient.from('AppUsers').update(memberPayload).eq('Id', memberId).select('*').single();

    if (memberResponse.error) {
      if (createdAuthUserId) await adminClient.auth.admin.deleteUser(createdAuthUserId);
      throw memberResponse.error;
    }

    const row = memberResponse.data;
    return json({ member: Object.fromEntries(Object.entries(row).map(([key, value]) => [key.charAt(0).toLowerCase() + key.slice(1), value])) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to manage the member.' }, 500);
  }
});
