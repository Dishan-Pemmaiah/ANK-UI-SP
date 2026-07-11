import './Pages.css';

export default function Home() {
  return (
    <main className="page page-home">
      <section className="hero-section">
        <div>
          <h1>Anjigeri Naad Koota</h1>
          <p>Welcome to the sports club for community, competition, and culture.</p>
        </div>
      </section>

      <section className="section-grid">
        <article>
          <h2>Club Sports</h2>
          <p>Football, kabaddi, kho-kho, running, yoga and more — all designed for players and supporters.</p>
        </article>
        <article>
          <h2>Events</h2>
          <p>Attend paid tournaments, host local matches, and enjoy community festivals with live updates.</p>
        </article>
        <article>
          <h2>Members</h2>
          <p>Join the club, connect with fellow athletes, and access training schedules, news, and member-only events.</p>
        </article>
      </section>

      <section className="section-highlight">
        <h2>Play. Host. Watch live.</h2>
        <p>Our club supports sportspeople of every age. Stay up to date with live matches, upcoming paid competitions, and member benefits.</p>
      </section>
    </main>
  );
}
