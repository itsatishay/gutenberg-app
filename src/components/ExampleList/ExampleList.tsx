import React from 'react';
import './ExampleList.css';

interface Book {
  id: number;
  title: string;
}

interface ExampleListProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

const ExampleList: React.FC<ExampleListProps> = ({ books, onSelect }) => {
  return (
    <div className="example-list">
      {books.map((book) => (
        <button 
          type="button"
          className="example-item" 
          key={book.id} 
          onClick={() => onSelect(book)}
        >
          {book.title} ({book.id})
        </button>
      ))}
    </div>
  );
};

export default ExampleList;
