import { Request, Response } from "express";
import {fetchBookMetaData } from "../services/gutenberg";

export async function getBookDetails(req: Request, res: Response) {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: "Missing bookId in request." });
  }

  try {
    const bookDetails = await fetchBookMetaData(bookId);

    return res.status(200).json(bookDetails);
  } catch (error: any) {
    console.error("Error getting book details:", error);

    // Check if it's a "book not found" type error
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    // Any other server error
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
