import apiClient from "../utils/apiClient";
import { parse } from 'node-html-parser';

export async function fetchBookContent(bookId: string): Promise<string> {
  const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`;
  const contentUrl2 = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;

  const result1 = await getBookContent(contentUrl);
  if(result1 != null){
    return result1;
  }
  const result2 = await getBookContent(contentUrl2);
  if(result2 != null){
    return result2;
  }

  throw new Error("Book with Id " + bookId + " not found!");
}


async function getBookContent(contentUrl: string): Promise<any>{
  try {
    const response = await apiClient.get(contentUrl);
    return response.data;
  } catch (error: any) {
    return null;
  }
}



export async function fetchBookMetaData(bookId: string): Promise<string> {
  const contentUrl = `https://www.gutenberg.org/ebooks/${bookId}`;
  try{
    const response = await apiClient.get(contentUrl);
    const parsedInfo = parseGutenbergHTML(response.data);
    return parsedInfo;
  }catch(error: any){
    if (error.response && error.response.status === 404) {
      throw new Error(`Book with ID ${bookId} not found.`);
    } else {
      throw new Error(`Failed to fetch book details: ${error.message || 'Unknown error'}`);
    }
  }
}


// Extract book information
function parseGutenbergHTML(htmlContent: string): any {
  const root = parse(htmlContent);
  
  const getText = (selector: string): string => {
    const element = root.querySelector(selector);
    return element ? element.text.trim() : '';
  };

  const getAttribute = (selector: string, attr: string): string | undefined => {
    const element = root.querySelector(selector);
    return element ? element.getAttribute(attr) : undefined;
  };
  
  const bookInfo: any = {
    title: getText('h1#book_title'),
    shortTitle: getText('td[itemprop="headline"]'),
    author: getText('tr th:contains("Author") + td a'),
    language: getText('tr[property="dcterms:language"] td'),
    releaseDate: getText('tr[property="dcterms:issued"] td'),
    lastUpdated: getText('tr[property="dcterms:modified"] td'),
    downloads: getText('tr th:contains("Downloads") + td'),
    category: getText('tr th:contains("Category") + td'),
    coverImageUrl: getAttribute('.cover-art', 'src'),
  };

  return bookInfo;
}



