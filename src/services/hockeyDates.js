const istParts = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Enter a valid date.');
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return { day: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
};

export const toIstDate = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return istParts(value).day;
};

export const istDateToIso = (value, endOfDay = false) => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid tournament date.');
  const time = endOfDay ? '23:59:59.999' : '00:00:00';
  const timestamp = new Date(`${value}T${time}+05:30`);
  if (Number.isNaN(timestamp.getTime()) || istParts(timestamp).day !== value) throw new Error('Enter a valid tournament date.');
  return timestamp.toISOString();
};

export const toIstLocalDateTime = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const { day, time } = istParts(value);
  return `${day}T${time}`;
};

export const istLocalDateTimeToIso = (value) => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Enter a valid fixture date and time.');
  const timestamp = new Date(`${value}:00+05:30`);
  if (Number.isNaN(timestamp.getTime()) || toIstLocalDateTime(timestamp) !== value) throw new Error('Enter a valid fixture date and time.');
  return timestamp.toISOString();
};

export const formatSeasonDates = (startsAt, endsAt) => {
  const format = (value) => value ? new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(value)) : '';
  const start = format(startsAt);
  const end = format(endsAt);
  return start && end ? `${start} – ${end}` : start || end;
};
