// src/components/NewsCard.jsx
import React from 'react';

const NewsCard = ({ title, content, date }) => {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title" style={{ color: '#1A3D7C' }}>{title}</h5>
        <p className="card-text">{content}</p>
      </div>
      <div className="card-footer bg-white border-0 text-muted" style={{ fontSize: '0.85rem' }}>
        {date}
      </div>
    </div>
  );
};

export default NewsCard;
