import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getSeasonData } from '../services/hockeyService';
import { formatSeasonDates } from '../services/hockeyDates';
import { getTournamentState, tournamentDayKey } from '../services/tournamentState';

const DISMISS_KEY = 'ank_tournament_banner_dismissed';

const FALLBACK_SEASON = {
  name: 'ANJK 3 Kodava Family Hockey Namme',
  starts_at: '2026-12-23T09:00:00+05:30',
  ends_at: '2026-12-29T18:00:00+05:30',
};

export default function TournamentBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [season, setSeason] = useState(null);
  const [state, setState] = useState(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    let active = true;
    let timer;

    const load = async () => {
      try {
        const data = await getSeasonData();
        if (!active) return;
        if (data?.season) {
          setSeason(data.season);
          setState(getTournamentState(data.matches));
        } else {
          setSeason(FALLBACK_SEASON);
          setState(getTournamentState([]));
        }
        // Use faster refresh only during live matches; otherwise poll every 60s
        const delay = data?.matches?.some((m) => m.status === 'Live') ? 15000 : 60000;
        if (active) timer = setTimeout(load, delay);
      } catch {
        if (!active) return;
        // Fallback for local dev when Supabase env vars are not set
        setSeason(FALLBACK_SEASON);
        setState(getTournamentState([]));
        if (active) timer = setTimeout(load, 60000);
      }
    };

    load();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  // Hide if dismissed
  if (dismissed) return null;

  // Hide if no season data yet
  if (!season) return null;

  // Hide if already viewing the tournament page
  if (location.pathname === '/anjk-3' || location.pathname.startsWith('/tournaments/') || location.pathname.startsWith('/admin')) return null;

  const now = new Date();
  const startsAt = season.starts_at ? new Date(season.starts_at) : null;
  const endsAt = season.ends_at ? new Date(season.ends_at) : null;

  // Calendar comparison in Indian Standard Time (IST)
  const todayKey = tournamentDayKey(now);
  const startKey = startsAt ? tournamentDayKey(startsAt) : null;
  const endKey = endsAt ? tournamentDayKey(endsAt) : null;

  const todayMidnight = new Date(`${todayKey}T00:00:00+05:30`).getTime();
  const startMidnight = startKey ? new Date(`${startKey}T00:00:00+05:30`).getTime() : null;
  const endMidnight = endKey ? new Date(`${endKey}T23:59:59+05:30`).getTime() : null;

  // Hide if tournament is fully over (end date passed + no live or upcoming matches)
  if (endMidnight && now.getTime() > endMidnight && !state?.live && !state?.next) return null;

  // Compute display content
  let icon, label, sublabel, ctaLabel, ctaPath;
  const liveMatch = state?.live;

  if (liveMatch) {
    // 1. Automatic Live Match detection (from Supabase status: 'Live')
    const homeName = liveMatch.home?.name || 'TBD';
    const awayName = liveMatch.away?.name || 'TBD';
    icon = null; // Pulsing live indicator replaces icon
    label = `${homeName} vs ${awayName}`;
    sublabel = liveMatch.home_score != null ? `${liveMatch.home_score} – ${liveMatch.away_score}` : 'LIVE';
    ctaLabel = 'Watch Live';
    ctaPath = `/anjk-3?tab=live#match-${liveMatch.id}`;
  } else if (startMidnight != null) {
    const diffDays = Math.round((startMidnight - todayMidnight) / 86400000);
    icon = '🏑';
    label = season.name;

    if (diffDays > 1) {
      // 2. Automatic Countdown days before tournament start
      sublabel = `Starts in ${diffDays} days`;
      ctaLabel = 'View';
      ctaPath = '/anjk-3';
    } else if (diffDays === 1) {
      // 1 day before
      sublabel = 'Starts tomorrow!';
      ctaLabel = 'View';
      ctaPath = '/anjk-3';
    } else if (diffDays === 0) {
      // Opening day
      sublabel = 'Day 1 · Starts today!';
      ctaLabel = state?.next ? 'Fixtures' : 'View';
      ctaPath = state?.next ? '/anjk-3?tab=fixtures' : '/anjk-3';
    } else {
      // 3. Automatic Day 2, Day 3, etc. based on calendar progression
      const dayNumber = Math.abs(diffDays) + 1;
      const isFinalDay = endKey && todayKey === endKey;
      sublabel = isFinalDay ? `Day ${dayNumber} · Final Day` : `Day ${dayNumber}`;
      ctaLabel = state?.next ? 'Fixtures' : 'Results';
      ctaPath = `/anjk-3?tab=${state?.next ? 'fixtures' : 'results'}`;
    }
  } else {
    // Generic fallback if dates not configured in DB
    icon = '🏑';
    label = season.name;
    sublabel = formatSeasonDates(season.starts_at, season.ends_at) || 'Upcoming';
    ctaLabel = 'View';
    ctaPath = '/anjk-3';
  }

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const isLive = Boolean(liveMatch);

  return (
    <Box
      onClick={() => navigate(ctaPath)}
      role="banner"
      aria-label={`Tournament: ${label}`}
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        cursor: 'pointer',
        background: isLive
          ? 'linear-gradient(135deg, #8b0000 0%, #b30000 50%, #cc1a1a 100%)'
          : 'linear-gradient(135deg, #1a0a0a 0%, #2a1010 50%, #331515 100%)',
        borderTop: isLive
          ? '2px solid #ff4444'
          : '1px solid rgba(179, 0, 0, 0.5)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
        WebkitTapHighlightColor: 'transparent',
        '&:active': {
          background: isLive
            ? 'linear-gradient(135deg, #990000, #cc0000, #dd2222)'
            : 'linear-gradient(135deg, #220e0e, #331515, #3d1a1a)',
        }
      }}
    >
      {/* Icon / Live Dot */}
      {isLive ? (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#ff4444',
            flexShrink: 0,
            boxShadow: '0 0 8px #ff4444',
            animation: 'tournamentPulse 1.5s ease-in-out infinite',
            '@keyframes tournamentPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.5, transform: 'scale(0.8)' },
            },
          }}
        />
      ) : (
        <Typography sx={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }}>{icon}</Typography>
      )}

      {/* Text Content */}
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            fontWeight: 900,
            fontSize: '0.82rem',
            lineHeight: 1.3,
            color: '#fff',
            letterSpacing: isLive ? 0.5 : 0,
          }}
        >
          {isLive && (
            <Box component="span" sx={{ color: '#ff8888', mr: 0.5, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              LIVE{' '}
            </Box>
          )}
          {label}
        </Typography>
        <Typography
          noWrap
          sx={{
            fontSize: '0.72rem',
            color: isLive ? 'rgba(255,255,255,0.9)' : '#dcb99b',
            fontWeight: isLive ? 800 : 600,
            lineHeight: 1.3,
          }}
        >
          {sublabel}
        </Typography>
      </Stack>

      {/* CTA */}
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 0.6,
          borderRadius: 1.5,
          bgcolor: isLive ? 'rgba(255,255,255,0.2)' : 'rgba(179, 0, 0, 0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {ctaLabel} →
      </Box>

      {/* Dismiss */}
      <IconButton
        size="small"
        onClick={handleDismiss}
        aria-label="Dismiss tournament banner"
        sx={{
          color: 'rgba(255,255,255,0.5)',
          p: 0.5,
          flexShrink: 0,
          '&:hover': { color: '#fff' },
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
