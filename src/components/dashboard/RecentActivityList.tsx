import React from "react";
import { Link } from "react-router-dom";
import "./RecentActivityList.css";

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  link?: string;
  author?: string;
}

interface RecentActivityListProps {
  title: string;
  items: ActivityItem[];
  viewAllLink?: string;
  itemTypeIcon?: React.ReactNode;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  title,
  items,
  viewAllLink,
  itemTypeIcon,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="recent-activity-card">
        <h3>{title}</h3>
        <p>No hay actividad reciente para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="recent-activity-card">
      <div className="recent-activity-header">
        <h3>{title}</h3>
        {viewAllLink && (
          <Link to={viewAllLink} className="view-all-link">
            Ver todos →
          </Link>
        )}
      </div>
      <ul className="recent-activity-items">
        {items.map((item) => (
          <li key={item.id} className="recent-activity-item">
            {itemTypeIcon && (
              <span className="activity-item-icon">{itemTypeIcon}</span>
            )}
            <div className="activity-item-content">
              {item.link ? (
                <Link to={item.link} className="activity-item-title">
                  {item.title}
                </Link>
              ) : (
                <span className="activity-item-title">{item.title}</span>
              )}
              {item.author && (
                <span className="activity-item-author">por: {item.author}</span>
              )}
              <span className="activity-item-date">{item.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityList;
