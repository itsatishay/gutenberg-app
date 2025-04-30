import React from 'react';
import './BookDetails.css';

interface BookData {
  coverImageUrl: string;
  title: string;
  author: string;
  summary: string;
}

interface BookDetailsProps {
  data: BookData | null;
  loading: boolean;
  loadingAnalyze: boolean;
}

// Import the SVGs as URLs
import bookIcon from '../../assets/book.svg';
import personIcon from '../../assets/person.svg';

const BookDetails: React.FC<BookDetailsProps> = ({ data, loading, loadingAnalyze }) => {
  if (!data && !loading) return null;

  const { coverImageUrl, title, author, summary } = data || {};

  return (
    <div className="book-details-container">
      <div className="cover-container">
        {loading ? (
          <div className="cover-skeleton shimmer"></div>
        ) : (
          <>
            <img src={coverImageUrl} alt={title} className="cover-image" />
            <button className="chat-button">Chat about book</button>
          </>
        )}
      </div>
      <div className="info-container">
        <div className="title-row">
          {/* Book icon from assets as img tag */}
          <img src={bookIcon} alt="Book Icon" className="icon" width="24" height="24" />
          {loading ? (
            <div className="text-skeleton title-skeleton shimmer"></div>
          ) : (
            <div><h2>{title}</h2></div>
          )}
        </div>
        <div className="author-row">
          {/* User icon from assets as img tag */}
          <img src={personIcon} alt="User Icon" className="icon" width="24" height="24" />
          {loading ? (
            <div className="text-skeleton author-skeleton shimmer"></div>
          ) : (
            <p>{author}</p>
          )}
        </div>
        <div className="summary-section">
          <h3>Book Summary</h3>
          {loadingAnalyze ? (
            <div className="summary-skeleton">
              <div className="text-skeleton shimmer" style={{ width: '90%' }}></div>
              <div className="text-skeleton shimmer" style={{ width: '85%' }}></div>
              <div className="text-skeleton shimmer" style={{ width: '80%' }}></div>
              <div className="text-skeleton shimmer" style={{ width: '60%' }}></div>
            </div>
          ) : (
            <p>{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
