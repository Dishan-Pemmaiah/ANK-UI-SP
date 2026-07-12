import './Pages.css';

export default function Home() {
  return (
    <main className="page page-home">
      <section className="hero-section">
        <div>
          <h1>Anjigeri Naad Koota</h1>
          <p>Welcome to the database-backed sports club for community, competition, and culture.</p>
        </div>
      </section>

      <section className="section-grid">
        <article>
          <h2>Club Sports</h2>
          <p>Football, hockey, cricket, marathon events, kabaddi, kho-kho, running, yoga, and more now load from club records.</p>
        </article>
        <article>
          <h2>Events</h2>
          <p>Attend tournaments, host local matches, and view live updates and history from the database.</p>
        </article>
        <article>
          <h2>Members</h2>
          <p>Join the club, connect with fellow athletes, and access member details that are stored in the database.</p>
        </article>
      </section>

      <section className="section-highlight">
        <h2>Play. Host. Watch live.</h2>
        <p>Our club supports sportspeople of every age. Every update now comes from the database instead of static UI content.</p>
      </section>
    </main>
  );
}
