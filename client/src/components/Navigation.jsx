import React from 'react';
import { Link } from 'react-router-dom';

const NavigationItem = ({ item }) => {
    if (item.type === 'directory') {
      return (
        <li>
          <span>{item.name}</span>
          {item.children && (
            <ul>
              {item.children.map((child, index) => (
                <NavigationItem key={index} item={child} />
              ))}
            </ul>
          )}
        </li>
      );
    } else {
      return (
        <li>
          <Link to={`${item.path}`}>{item.name}</Link>
        </li>
      );
    }
};  

const Navigation = ({ structure }) => {
  if (!structure || structure.length === 0) {
    return <div>Loading navigation...</div>;
  }

  return (
    <nav className="sidebar-navigation">
      <ul>
        {structure.map((item, index) => (
          <NavigationItem key={index} item={item} />
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;