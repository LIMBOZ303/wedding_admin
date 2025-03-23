import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, count, icon }) => {
  return (
    <div className="stats-card">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
  );
};

export default StatsCard;
