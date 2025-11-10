// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ElectionCard from './ElectionCard';
import NewsCard from './Home/NewsCard';

const Dashboard = () => {
  // Placeholder data
  const upcomingElections = [
    { title: "SUG President Election", date: "Nov 15, 2025", status: "Open", adminOnly: true },
    { title: "SUG Secretary Election", date: "Nov 18, 2025", status: "Open", adminOnly: true },
  ];

  const votedElections = [
    { title: "SUG Treasurer Election", date: "Oct 20, 2025", status: "Voted", adminOnly: false },
  ];

  const news = [
    { title: "Voting Guidelines Released", content: "Ensure your fingerprint is registered to vote successfully.", date: "Oct 20, 2025" },
    { title: "Candidate Registration Open", content: "Candidates have started registering for upcoming elections.", date: "Oct 25, 2025" },
  ];

  const [isAdmin, setIsAdmin] = useState(true); // placeholder, replace with auth context

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
        <h2 className="mb-4" style={{ color: '#1A3D7C' }}>Dashboard</h2>

        {/* Admin Add Election Button */}
        {isAdmin && (
          <div className="mb-4 text-end">
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addElectionModal" style={{ backgroundColor: '#00BFFF', border: 'none' }}>
              + Add New Election
            </button>
          </div>
        )}

        {/* Upcoming Elections */}
        <section className="mb-5">
          <h4 className="mb-3" style={{ color: '#1A3D7C' }}>Upcoming Elections</h4>
          <div className="row g-4">
            {upcomingElections.map((election, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <ElectionCard election={election} isAdmin={isAdmin} />
              </div>
            ))}
          </div>
        </section>

        {/* Voted Elections */}
        <section className="mb-5">
          <h4 className="mb-3" style={{ color: '#1A3D7C' }}>Voted Elections</h4>
          <div className="row g-4">
            {votedElections.map((election, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <ElectionCard election={election} isAdmin={isAdmin} />
              </div>
            ))}
          </div>
        </section>

        {/* News / Announcements */}
        <section>
          <h4 className="mb-3" style={{ color: '#1A3D7C' }}>News & Announcements</h4>
          <div className="row g-4">
            {news.map((item, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <NewsCard title={item.title} content={item.content} date={item.date} />
              </div>
            ))}
          </div>
        </section>

        {/* Add Election Modal */}
        <div className="modal fade" id="addElectionModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Election</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="electionTitle" className="form-label">Election Title</label>
                    <input type="text" className="form-control" id="electionTitle" placeholder="Enter election title" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="electionDate" className="form-label">Election Date</label>
                    <input type="date" className="form-control" id="electionDate" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#00BFFF', border: 'none' }}>Add Election</button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
