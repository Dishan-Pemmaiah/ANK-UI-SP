import { useEffect, useState } from 'react';
import { getMembers } from '../services/api';
import './Pages.css';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembers()
      .then(data => setMembers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page page-members">
      <h1>Members</h1>
      <p>Meet the club members and learn how to join Anjigeri Naad Koota.</p>

      <section className="member-benefits">
        <h2>Membership Benefits</h2>
        <ul>
          <li>Access to training sessions and club events</li>
          <li>Priority registration for paid tournaments</li>
          <li>Live event news and member-only updates</li>
          <li>Community coaching and fitness support</li>
        </ul>
      </section>

      {loading ? (
        <div className="loader">Loading members...</div>
      ) : (
        <section className="member-grid">
          {members.map(member => (
            <article key={member.id} className="member-card">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <p><strong>Sport:</strong> {member.sport}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
