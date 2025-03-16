import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavigationItem = ({ item }) => {
  if (item.type === 'directory') {
    return (
      <li>
        <span className="nav-folder">{item.name}</span>
        <ul>
          {item.children.map((child, index) => (
            <NavigationItem key={index} item={child} />
          ))}
        </ul>
      </li>
    );
  } else {
    return (
      <li>
        <Link to={`${item.path}`} className="nav-link">{item.name}</Link>
      </li>
    );
  }
};

const Navigation = ({ structure, refreshStructure }) => {
    const [newFolderName, setNewFolderName] = useState('');
    const [parentPath, setParentPath] = useState('');
  
    const handleCreateFolder = async () => {
      if (!newFolderName.trim()) return alert("Folder name is required");
  
      const response = await fetch('/api/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName, parentPath }),
      });
  
      if (response.ok) {
        alert("Folder created successfully!");
        setNewFolderName('');
        refreshStructure(); // Refresh navigation after creating folder
      } else {
        alert("Failed to create folder.");
      }
    };
  
    if (!structure || structure.length === 0) {
      return <div>Loading navigation...</div>;
    }
  
    return (
      <nav>
        <ul className="nav-list">
          {structure.map((item, index) => (
            <NavigationItem key={index} item={item} />
          ))}
        </ul>
  
        {/* CRUD Form */}
        <div className="crud-form">
          <input
            type="text"
            placeholder="New Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <select onChange={(e) => setParentPath(e.target.value)} value={parentPath}>
            <option value="">Root</option>
            {structure.map((item, index) =>
              item.type === 'directory' ? (
                <option key={index} value={item.path}>{item.name}</option>
              ) : null
            )}
          </select>
          <button onClick={handleCreateFolder}>Add Folder</button>
        </div>
      </nav>
    );
  };
  
export default Navigation;
