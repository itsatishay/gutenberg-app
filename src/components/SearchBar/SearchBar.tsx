import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit }) => {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input 
        type="text" 
        placeholder="Enter Book ID" 
        value={value} 
        onChange={onChange} 
      />
      <button type="submit">Analyze</button>
    </form>
  );
};

export default SearchBar;
