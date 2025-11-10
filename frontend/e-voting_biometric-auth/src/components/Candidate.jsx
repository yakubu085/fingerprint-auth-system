import React from 'react';

const Candidate = ({ candidate, isSelected, onSelect, isAdmin }) => {
  return (
    <div className={`card h-100 shadow-sm border-2 ${isSelected ? 'border-primary' : 'border-0'}`} onClick={() => onSelect(candidate)} style={{ cursor: 'pointer' }}>
      <img src={candidate.image} className="card-img-top" alt={candidate.name} />
      <div className="card-body text-center">
        <h5 className="card-title" style={{ color: '#1A3D7C' }}>{candidate.name}</h5>
        {isAdmin && (
          <button className="btn btn-sm btn-outline-secondary mt-2">Edit Candidate</button>
        )}
      </div>
    </div>
  );
};

export default Candidate;
