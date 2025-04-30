import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="app-header">
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
