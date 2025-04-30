import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";

import { analyzeBook } from "./controllers/analyze";
import { getBookDetails } from "./controllers/bookdetails";
import { handleChatMessage, getChatHistoryEndpoint } from "./controllers/chat";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.post("/analyze-book", async (req, res) => {
    try {
      await analyzeBook(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

app.post("/book-metadata", async (req, res) => {
    try {
      await getBookDetails(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });

app.post("/chat", async (req, res) => {
  try {
    await handleChatMessage(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/chat-history", async (req, res) => {
  try {
    await getChatHistoryEndpoint(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export const api = functions.https.onRequest(app);
