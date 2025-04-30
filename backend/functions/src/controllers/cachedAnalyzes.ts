import admin = require("firebase-admin");
import { firestore } from "firebase-admin";

admin.initializeApp();
const db = firestore();
const ANALYSIS_COLLECTION = "bookAnalyses";
const cachedHours = 24;

// Function to check if analysis already exists and is fresh
export async function checkExistingAnalysis(bookId: string): Promise<any | null> {
  const docRef = db.collection(ANALYSIS_COLLECTION).doc(bookId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    console.log(`No existing analysis for bookId: ${bookId}`);
    return null;
  }

  const data = docSnap.data();
  if (!data || !data.savedAt) {
    console.log(`Existing document is invalid or missing timestamp for bookId: ${bookId}`);
    return null;
  }

  const savedAt = data.savedAt.toDate(); 
  const now = new Date();
  const diffInHours = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

  // Check if analysis is older than allowed cached hours
  if (diffInHours > cachedHours) {
    return null;
  }

  return data.analysis; 
}

// Function to save analyzed book data into Firestore
export async function saveAnalysis(bookId: string, analysisData: any): Promise<void> {
  const docRef = db.collection(ANALYSIS_COLLECTION).doc(bookId);

  await docRef.set({
    analysis: analysisData,
    savedAt: new Date(), 
  });

}
