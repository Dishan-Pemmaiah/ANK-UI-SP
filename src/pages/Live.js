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
          {status ? (
            <>
              <h2>{status.message}</h2>
              <p>Updated at {new Date(status.createdOn).toLocaleString()}</p>
            </>
          ) : (
            <>
              <h2>No live update available</h2>
              <p>Check back when an admin posts the next live update.</p>
            </>
          )}
        </section>
      )}
    </main>
  );
}
