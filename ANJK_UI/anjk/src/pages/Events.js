import { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import './Pages.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data))
      .finally(() => setLoading(false));
  }, []);

  const paidEvents = events.filter(event => event.type === 'paid');
  const hostedEvents = events.filter(event => event.type === 'hosted');

  return (
    <main className="page page-events">
      <h1>Events</h1>
      <p>Discover club sports events, paid tournaments, and matches hosted by our community.</p>

      {loading ? (
        <div className="loader">Loading events...</div>
      ) : (
        <>
          <section>
            <h2>Paid Events</h2>
            <div className="event-list">
              {paidEvents.map(event => (
                <article key={event.id} className="event-card">
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Fee:</strong> {event.fee}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Hosted Events</h2>
            <div className="event-list">
              {hostedEvents.map(event => (
                <article key={event.id} className="event-card">
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
