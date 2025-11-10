import React from 'react';

const ElectionCard = ({ election, isAdmin }) => {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title" style={{ color: '#1A3D7C' }}>{election.title}</h5>
        <p className="card-text">Date: {election.date}</p>
        <p className="card-text">Status: {election.status}</p>
        {isAdmin && (
          <button className="btn btn-sm btn-outline-primary">Add Candidate</button>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
