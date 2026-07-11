import { useEffect, useState } from 'react';
import { getLiveStatus } from '../services/api';
import './Pages.css';

export default function Live() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveStatus()
      .then(data => setStatus(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page page-live">
      <h1>Live</h1>
      <p>Live match updates, scores, and current action from the club.</p>

      {loading ? (
        <div className="loader">Loading live feed...</div>
      ) : (
        <section className="live-card">
          <h2>{status.title}</h2>
          <p>{status.description}</p>
          <div className="scoreboard">
            <div>
              <strong>{status.teamA}</strong>
              <span>{status.scoreA}</span>
            </div>
            <div>
              <strong>{status.teamB}</strong>
              <span>{status.scoreB}</span>
            </div>
            <div className="live-status">{status.liveStatus}</div>
          </div>
          <div className="live-note">Watch the match live and stay connected with the club.</div>
        </section>
      )}
    </main>
  );
}
