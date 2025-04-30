import { Request, Response } from "express";
import { fetchBookContent} from "../services/gutenberg";
import { analyzeBookContent } from "../llm/gemini";
import { checkExistingAnalysis, saveAnalysis } from "./cachedAnalyzes";

export async function analyzeBook(req: Request, res: Response) {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: "Missing bookId in request." });
  }
  try {
    const cachedAnalyze = await checkExistingAnalysis(bookId);
    if(cachedAnalyze != null){
      return res.status(200).json(cachedAnalyze);
    }

    const bookText = await fetchBookContent(bookId);
    const analyzedData = await analyzeBookContent(bookText);
    await saveAnalysis(bookId, analyzedData);
    return res.status(200).json(analyzedData);
  } catch (error: any) {
    console.error("Error analyzing book:", error);

    // Check if it's a "book not found" type error
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    // Any other server error
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
