import { Request, Response } from "express";
import { fetchBookContent } from "../services/gutenberg";
import { chatWithBook } from "../llm/gemini";
import { getChatHistory, saveChatMessage, createChatSession } from "../services/chatService";

export async function handleChatMessage(req: Request, res: Response) {
  const { chatSessionId, bookId, message } = req.body;

  if (!chatSessionId || !bookId || !message) {
    return res.status(400).json({ error: "Missing required fields: chatSessionId, bookId, or message" });
  }

  try {
    // Get or create chat session
    let chatHistory = await getChatHistory(chatSessionId) || [];
    const isNewSession = chatHistory.length === 0;

    // If new session, create it
    if (isNewSession) {
      await createChatSession(chatSessionId, bookId);
    }

    // Get book content
    const bookContent = await fetchBookContent(bookId);

    // Set timeout for the entire operation
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000); // 30 seconds timeout
    });

    // Get response from LLM with timeout
    const llmResponse = await Promise.race([
      chatWithBook(bookContent, message, chatHistory),
      timeoutPromise
    ]);

    // Save both user message and LLM response
    await saveChatMessage(chatSessionId, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    await saveChatMessage(chatSessionId, {
      role: 'assistant',
      content: llmResponse,
      timestamp: new Date()
    });

    return res.status(200).json({ response: llmResponse });
  } catch (error: any) {
    console.error("Error in chat:", error);
    if (error.message?.includes('timeout') || error.message?.includes('CANCELLED')) {
      return res.status(408).json({ error: "The request took too long to process. Please try again." });
    }
    if (error.message?.includes('UNAVAILABLE') || error.message?.includes('503')) {
      return res.status(503).json({ error: "The service is temporarily unavailable. Please try again in a few moments." });
    }
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

export async function getChatHistoryEndpoint(req: Request, res: Response) {
  const { chatSessionId } = req.body;

  if (!chatSessionId) {
    return res.status(400).json({ error: "Missing chatSessionId" });
  }

  try {
    const chatHistory = await getChatHistory(chatSessionId) || [];
    return res.status(200).json({ chatHistory });
  } catch (error: any) {
    console.error("Error getting chat history:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
} 