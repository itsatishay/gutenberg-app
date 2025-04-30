# Gutenberg Book Analysis

https://itsatishay.github.io/gutenberg-app/

## Demo Video
Watch the demo video here: https://youtu.be/D5MTYo3CzcQ

A web application that allows users to analyze and interact with Project Gutenberg books. Users can search for books by ID, view book details, analyze character interactions, and chat with an AI about the book's content.

## Features

- Search books by ID or select from example books
- View book metadata including cover image, title, and author
- Analyze character interactions and relationships
- Graph for showing character interaction
- Chat with AI about book content (ask any question about the story or its characters)

## Tech Stack

- **Frontend**: 
  - React
  - TypeScript
  - Vite
  - Vis Network
  - CSS Modules

- **Backend**:
  - Firebase Functions
  - Firestore Database

- **Deployment**:
  - GitHub Pages
  - Firebase Hosting

## Backend Endpoints

### Book Metadata (`/book-metadata/`)
- **Method**: POST
- **Purpose**: Fetches basic information about a book
- **Input**: Book ID
- **Output**: Cover image URL, title, author, and other metadata

### Book Analysis (`/analyze-book/`)
- **Method**: POST
- **Purpose**: Analyzes book content to extract character interactions and relationships
- **Input**: Book ID
- **Output**: 
  - Character list with their interactions
  - Key conversations between characters
  - Character relationship analysis

### Chat API (`/chat/`)
- **Method**: POST
- **Purpose**: Enables AI-powered chat about book content
- **Input**: Book ID, chat session ID, and user message
- **Output**: AI response about the book's content

### Chat History (`/chat-history/`)
- **Method**: POST
- **Purpose**: Retrieves chat history for a specific book and session
- **Input**: Book ID and chat session ID
- **Output**: List of previous chat messages and responses
- **Storage**: Chat history is stored in Firestore for persistence

## Caching Strategy

To optimize performance and reduce API costs, we implement a caching system:
- Book analysis results are cached in Firestore
- Cache duration is currently set to 1 day
- Cache can be extended to a longer duration based on requirements
- This significantly reduces Gemini API usage and improves response times for previously analyzed books

## Tech Stack Decisions

### Frontend & Backend Choices
I chose React with TypeScript for the frontend and Node.js with TypeScript for the backend because I had prior experience with these technologies. Before starting development, I evaluated if this stack could handle all the required features, and once confirmed, I proceeded with the implementation.

### AI Model Selection
During development, I compared different LLM providers, specifically OpenAI and Google's Gemini. After testing both, I opted for Gemini because:
- It demonstrated superior contextual memory for book-related questions
- The free tier was more generous and suitable for the project's needs

### Deployment Decision
I selected GitHub Pages for deployment because it offered a quick and straightforward way to host the frontend. 
Given my prior experience with deploying backends on Firebase Functions, I chose it cause it was quick and straightforward to set up and deploy. Since the application was already leveraging other Firebase services, incorporating Cloud Functions allowed for a streamlined and efficient deployment workflow."


