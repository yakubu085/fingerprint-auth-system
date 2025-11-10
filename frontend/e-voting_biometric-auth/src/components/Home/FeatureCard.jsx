import React from 'react';

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <div className="card h-100 shadow-sm border-0 text-center py-4">
      <i className={`bi ${icon} fs-1 mb-3`} style={{ color: '#00BFFF' }}></i>
      <h5 style={{ color: '#1A3D7C' }}>{title}</h5>
      <p>{desc}</p>
    </div>
  );
};

export default FeatureCard;
