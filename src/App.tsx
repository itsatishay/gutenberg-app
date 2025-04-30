import React, { useState } from 'react';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import ExampleList from './components/ExampleList/ExampleList';
import BookDetails from './components/BookDetails/BookDetails';
import AnalysisContainer from './components/AnalysisContainer/AnalysisContainer';

interface Book {
  id: number;
  title: string;
}

interface BookData {
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

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [characters, setCharacters] = useState<any[]>([]);

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
      setBookData({
        coverImageUrl,
        title: shortTitle,
        author,
        summary: "",
      });
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
      setBookData({
        coverImageUrl,
        title: shortTitle,
        author,
        summary: analyzeResponse.summary.join('\n'),
      });
      setCharacters(analyzeResponse.characters);
      setLoadingAnalyze(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again later.');
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

  return (
    <div>
      <Header title="Project Gutenberg" />
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
          />
      )}

{(loadingAnalyze || (characters && characters.length !== 0)) && (
        <div className='home-container-wrapper'>
              <AnalysisContainer characters={characters} loading={loadingAnalyze} />
          
        </div>
      )}

    </div>
  );
};

export default App;
