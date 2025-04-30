import { GoogleGenAI, Type } from '@google/genai';

interface CharacterInteraction {
  with: string;
  count: number;
  key_conversations: string[];
  relation: string;
}
interface Character {
  name: string;
  interactions: CharacterInteraction[];
}
interface BookAnalysis {
  characters: Character[];
  summary: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function analyzeBookContent(bookText: string): Promise<BookAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google GenAI API key is not configured.');
  }
  const genaiClient = new GoogleGenAI({ apiKey });

  const prompt = `Analyze the following book content and extract key information in JSON format.

Instructions:
1. Identify all main characters and list their interactions. For each character, list each other character they interacted with, how many times they interacted, their relationship (e.g., friends, enemies, family, colleagues, etc.), and 1-2 key conversations or dialogues (short excerpts) between them.
2. Provide a brief summary of the story in 2-4 sentences.

Output strictly in the following JSON format (no extra text or explanations):

{
  "characters": [
    {
      "name": <character name>,
      "interactions": [
        {
          "with": <other character name>,
          "count": <number of interactions>,
          "relation": <relationship between characters>,
          "key_conversations": [<excerpt1>, <excerpt2>]
        }
      ]
    }
  ],
  "summary": [
    <summary sentence1>,
    <summary sentence2>,
    ...
  ]
}

Now analyze the book content below and produce the JSON:

"""${bookText}"""`;

  // JSON schema for the LLM response
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            interactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  with: { type: Type.STRING },
                  count: { type: Type.NUMBER },  // number of interactions
                  relation: { type: Type.STRING },  // relationship between characters
                  key_conversations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }  // 1-2 key conversation excerpts
                  }
                },
                required: ['with', 'count', 'relation', 'key_conversations']
              }
            }
          },
          required: ['name', 'interactions']
        }
      },
      summary: {
        type: Type.ARRAY,
        items: { type: Type.STRING }  // 2-4 sentences summarizing the story
      }
    },
    required: ['characters', 'summary']
  };

  const response = await genaiClient.models.generateContent({
    model: 'gemini-2.0-flash-001',  
    contents: prompt,
    config: {
      responseMimeType: 'application/json',  
      responseSchema: responseSchema,        
      temperature: 0.2,                      
      candidateCount: 1                      
    }
  });

  // Ensure we got a text response from the model
  const outputText = response.text;
  if (!outputText || outputText.trim() === '') {
    throw new Error('No text response from the LLM.');
  }

  let result: BookAnalysis;
  try {
    result = JSON.parse(outputText);
  } catch (err) {
    throw new Error('Failed to parse JSON from LLM response: ' + (err as Error).message);
  }

  return result;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function chatWithBook(bookContent: string, userMessage: string, chatHistory: ChatMessage[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Google GenAI API key is not configured.');
    }
    const genaiClient = new GoogleGenAI({ apiKey });

    let lastError: Error | null = null;
    let retryCount = 0;
    let retryDelay = INITIAL_RETRY_DELAY;

    while (retryCount < MAX_RETRIES) {
        try {
            // Get the last two messages for context
            const lastTwoMessages = chatHistory.slice(-2);
            const chatContext = lastTwoMessages.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');

            const prompt = `You are a helpful assistant that answers questions about a specific book. 
            You should ONLY answer questions based on the book content provided below. 

            When answering questions:
            1. ALWAYS consider the context from the last two messages to understand the full meaning of the current question
            2. If a question uses pronouns like "they" or "them", look at the previous message to understand who is being referred to
            3. If a question seems to be asking for your opinion or interpretation of a relationship, use the information from the book to provide a factual answer
            4. Only respond with "The book does not provide information to answer this question" if you truly cannot find any relevant information in the book content or previous context
            5. Keep your answers concise and based on the book content
            6. If a question is about a relationship that was discussed in previous messages, use that information to answer

            ${chatHistory.length > 0 ? `Last two messages for context:\n${chatContext}\n\n` : ''}

            Book Content:
            """${bookContent}"""

            Current Question: ${userMessage}

            Please provide a concise answer based on the book content and the context from the last two messages. If the question is about relationships or interpretations, use the information from the book to provide a factual answer.`;

            const response = await genaiClient.models.generateContent({
                model: 'gemini-1.5-pro',
                contents: prompt,
                config: {
                    temperature: 0.2,
                    candidateCount: 1,
                    maxOutputTokens: 500 // Limit response length
                }
            });

            const outputText = response.text;
            if (!outputText || outputText.trim() === '') {
                throw new Error('No text response from the LLM.');
            }

            return outputText.trim();
        } catch (error: any) {
            lastError = error;
            
            // Check if it's a 503 error
            if (error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
                if (retryCount < MAX_RETRIES - 1) {
                    console.log(`Retry attempt ${retryCount + 1} after ${retryDelay}ms`);
                    await sleep(retryDelay);
                    retryDelay *= 2; // Exponential backoff
                    retryCount++;
                    continue;
                }
            }
            
            // If it's not a 503 error or we've exhausted retries, throw the error
            throw error;
        }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new Error('Failed to get response after multiple retries');
}
