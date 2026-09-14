export const SIMPLE_KNOCKOUT_ROUNDS = ['Quarter Final','Semi Final','Final','3rd Place'];

export const roundPosition = (name = '') => {
  const normalized = name.trim().toLowerCase().replace(/[-_]/g,' ').replace(/\s+/g,' ');
  if (['quarter final','quarter finals','quter final','qf'].includes(normalized)) return 0;
  if (['semi final','semi finals','semifinal','semifinals','sf'].includes(normalized)) return 1;
  if (normalized === 'final') return 2;
  if (['3rd place','third place','3rd place play off','third place playoff'].includes(normalized)) return 3;
  return 4;
};

export const sortKnockoutRounds = (rounds) => [...rounds].sort((a,b) =>
  roundPosition(a.name)-roundPosition(b.name) || a.sort_order-b.sort_order || a.name.localeCompare(b.name));
