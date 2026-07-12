import './Pages.css';

export default function About() {
  return (
    <main className="page page-about">
      <h1>About Anjigeri Naad Koota</h1>
      <p>Anjigeri Naad Koota is a community sports club for local events, training, and live match culture.</p>
      <section className="about-grid">
        <article>
          <h2>Our mission</h2>
          <p>Encourage local sports, support athletes, and bring people together through competition and celebration.</p>
        </article>
        <article>
          <h2>What we host</h2>
          <p>Regional tournaments, paid sports events, club training camps, and live match gatherings.</p>
        </article>
        <article>
          <h2>How to join</h2>
          <p>Sign up as a member, attend a club event, or reach out for sponsorship and event hosting opportunities.</p>
        </article>
      </section>
    </main>
  );
}
