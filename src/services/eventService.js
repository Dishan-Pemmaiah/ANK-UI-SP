import { supabase } from './supabaseClient';
import { createRow, deleteRow, getRowById, listRows, updateRow, ensureSupabaseConfigured } from './supabaseDb';

const EVENTS_TABLE = 'Events';
const REG_TABLE = 'EventRegistrations';
const USERS_TABLE = 'AppUsers';

const eventApi = {
  getAll: () => listRows(EVENTS_TABLE, { orderBy: 'StartDate', ascending: true }),
  getById: (id) => getRowById(EVENTS_TABLE, id),
  create: (payload) => createRow(EVENTS_TABLE, payload),
  update: (id, payload) => updateRow(EVENTS_TABLE, id, payload),
  delete: (id) => deleteRow(EVENTS_TABLE, id),
  register: async (id, amountPaid) => {
    ensureSupabaseConfigured();

    const sessionResponse = await supabase.auth.getSession();
    const email = sessionResponse.data.session?.user?.email;
    if (!email) {
      throw new Error('Please login before registering for an event.');
    }

    const userResponse = await supabase.from(USERS_TABLE).select('Id').eq('Email', email).maybeSingle();
    if (userResponse.error || !userResponse.data) {
      throw new Error('Member profile not found. Please complete registration first.');
    }

    const paidValue = typeof amountPaid === 'number' ? amountPaid : Number(amountPaid?.amountPaid || 0);
    const registration = {
      EventId: id,
      AppUserId: userResponse.data.Id,
      RegisteredOn: new Date().toISOString(),
      PaymentStatus: paidValue > 0 ? 'Paid' : 'Pending',
      AmountPaid: Number.isFinite(paidValue) ? paidValue : 0
    };

    const insertResponse = await supabase.from(REG_TABLE).insert(registration).select('*').single();
    if (insertResponse.error) {
      throw new Error(insertResponse.error.message);
    }

    return {
      id: insertResponse.data.Id,
      eventId: insertResponse.data.EventId,
      appUserId: insertResponse.data.AppUserId,
      amountPaid: insertResponse.data.AmountPaid,
      paymentStatus: insertResponse.data.PaymentStatus,
      registeredOn: insertResponse.data.RegisteredOn
    };
  }
};

export default eventApi;
