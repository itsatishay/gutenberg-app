import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import ExampleList from './components/ExampleList/ExampleList';
import BookDetails from './components/BookDetails/BookDetails';
import AnalysisContainer from './components/AnalysisContainer/AnalysisContainer';
import ChatPage from './components/ChatPage/ChatPage';

interface Book {
  id: number;
  title: string;
}

interface BookData {
  id: string;
  coverImageUrl: string;
  title: string;
  author: string;
  summary: string;
}

const exampleBooks: Book[] = [
  { id: 16, title: 'Peter Pan' },
  { id: 74, title: 'The Adventures of Tom Sawyer' },
  { id: 84, title: 'Frankenstein' },
  { id: 11, title: 'Alice in Wonderland' },
];

const MainContent: React.FC<{ bookData: BookData | null; setBookData: (data: BookData | null) => void }> = ({ bookData, setBookData }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingAnalyze, setLoadingAnalyze] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (bookData) {
      setChatSessionId(crypto.randomUUID());
    }
  }, [bookData]);

  const handleSearch = async (queryId: string) => {
    try {
      setLoading(true);
      setBookData(null);
      setLoadingAnalyze(true);
      
      // Fetch book metadata
      const bookResponse = await fetch('https://api-tqpt7ex3wq-uc.a.run.app/book-metadata/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: queryId }),
      });
      if (!bookResponse.ok) {
        throw new Error(`Fetch error: ${bookResponse.status}`);
      }
      const data = await bookResponse.json();
      const { coverImageUrl, shortTitle, author } = data;
      const newBookData = {
        id: queryId,
        coverImageUrl,
        title: shortTitle,
        author,
        summary: "",
      };
      setBookData(newBookData);
      setLoading(false);
      // Fetch book summary using another API
      const summaryResponse = await fetch('https://api-tqpt7ex3wq-uc.a.run.app/analyze-book/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: queryId }),
      });
      if (!summaryResponse.ok) {
        throw new Error(`Fetch error: ${summaryResponse.status}`);
      }
      const analyzeResponse = await summaryResponse.json();
      setCharacters(analyzeResponse.characters);
      setLoadingAnalyze(false);
      setBookData({
        ...newBookData,
        summary: analyzeResponse.summary.join('\n'),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again later.');
      setBookData(null);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = searchTerm.match(/\d+/);
    if (!match) {
      alert('Please enter a valid numeric Book ID or select an example.');
      return;
    }
    const bookId = match[0];
    handleSearch(bookId);
  };

  const onExampleSelect = (book: Book) => {
    setSearchTerm(`${book.id}`);
  };

  const handleChatClick = () => {
    if (bookData) {
      navigate(`/chat/${bookData.id}/${chatSessionId}`);
    }
  };

  const getHeaderTitle = () => {
    if (location.pathname.startsWith('/chat/')) {
      const bookId = location.pathname.split('/')[2];
      const currentBook = bookData?.id === bookId ? bookData : null;
      return currentBook ? `Ask questions about ${currentBook.title}` : 'Project Gutenberg';
    }
    return 'Project Gutenberg';
  };

  return (
    <>
      <Header title={getHeaderTitle()} />
      {!location.pathname.startsWith('/chat/') && (
        <>
          <div className="home-container-wrapper">
            <SearchBar
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onSubmit={onSearchSubmit}
            />
            <p className="example-label">Example books:</p>
            <ExampleList books={exampleBooks} onSelect={onExampleSelect} />
          </div>

          {(loading || (bookData && bookData.title !== "")) && (
            <BookDetails
              data={bookData}
              loading={loading}
              loadingAnalyze={loadingAnalyze}
              onChatClick={handleChatClick}
            />
          )}

          {(loadingAnalyze || (characters && characters.length !== 0)) && (
            <div className='home-container-wrapper'>
              <AnalysisContainer characters={characters} loading={loadingAnalyze} />
            </div>
          )}
        </>
      )}
      {location.pathname.startsWith('/chat/') && (
        <ChatPage
          bookId={location.pathname.split('/')[2]}
          chatSessionId={location.pathname.split('/')[3]}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  const [bookData, setBookData] = useState<BookData | null>(null);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<MainContent bookData={bookData} setBookData={setBookData} />} />
          <Route path="/chat/:bookId/:chatSessionId" element={<MainContent bookData={bookData} setBookData={setBookData} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
