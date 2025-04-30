import * as admin from 'firebase-admin';

const CHAT_SESSIONS_COLLECTION = 'chat_sessions';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export async function createChatSession(chatSessionId: string, bookId: string): Promise<void> {
  const docRef = db.collection(CHAT_SESSIONS_COLLECTION).doc(chatSessionId);
  
  await docRef.set({
    bookId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function saveChatMessage(chatSessionId: string, message: ChatMessage): Promise<void> {
  const messagesRef = db.collection(CHAT_SESSIONS_COLLECTION)
    .doc(chatSessionId)
    .collection(CHAT_MESSAGES_COLLECTION);
  
  await messagesRef.add(message);
  
  await db.collection(CHAT_SESSIONS_COLLECTION)
    .doc(chatSessionId)
    .update({ updatedAt: new Date() });
}

export async function getChatHistory(chatSessionId: string): Promise<ChatMessage[] | null> {
  const sessionRef = db.collection(CHAT_SESSIONS_COLLECTION).doc(chatSessionId);
  const sessionDoc = await sessionRef.get();
  
  if (!sessionDoc.exists) {
    return null;
  }
  
  const messagesSnapshot = await sessionRef
    .collection(CHAT_MESSAGES_COLLECTION)
    .orderBy('timestamp', 'asc')
    .get();
  
  return messagesSnapshot.docs.map(doc => ({
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate()
  })) as ChatMessage[];
} 