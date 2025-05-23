import React from "react";
import { Link } from "react-router-dom";
import "./StatCard.css";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  linkTo?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  linkTo,
  color,
}) => {
  const cardContent = (
    <div className="stat-card-content">
      <div
        className="stat-icon"
        style={{ backgroundColor: color || "var(--color-gray-medium)" }}
      >
        <span>{icon.substring(0, 1).toUpperCase()}</span>
      </div>
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="stat-card"
        style={{ borderColor: color || "var(--color-border)" }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className="stat-card"
      style={{ borderColor: color || "var(--color-border)" }}
    >
      {cardContent}
    </div>
  );
};

export default StatCard;
