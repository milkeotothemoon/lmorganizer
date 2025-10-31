import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const BOT_API_KEY = "bp_bak_K7PQmsWkWdxbZe8WGD1-NqkTWsEMzl1mj8Rq"; // your Botpress API key
const BOT_ID = "c5a4f774-cde3-484b-bea5-636ced79c8e1";

const userId = "local_user_1234567890abcdef12345678";
const conversationId = "local_convo_abcdef1234567890abcdef";

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;
  console.log("🧠 User asked:", userMessage);

  try {
    const response = await fetch(
  `https://api.botpress.cloud/v1/chat/${BOT_ID}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: {
        id: userId,
      },
      conversation: {
        id: conversationId,
      },
      messages: [
        {
          type: "text",
          text: userMessage,
          role: "user",
        },
      ],
    }),
  }
);


    const text = await response.text();
console.log("📩 Raw API response:", text);

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error("Botpress returned non-JSON: " + text.slice(0, 200));
}

const botReply =
  data?.responses?.[0]?.text ||
  data?.messages?.find((m) => m.role === "assistant")?.content ||
  "No response from Botpress";

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Error communicating with Botpress:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);

// bp_bak_K7PQmsWkWdxbZe8WGD1-NqkTWsEMzl1mj8Rq