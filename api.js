const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // your key

let allNotesText = "";

async function loadAllNotes() {
  const baseFolders = ["MIL", "Contempo"]; // your folders
  for (const folder of baseFolders) {
    const files = fs.readdirSync(`./${folder}`);
    for (const file of files) {
      const filePath = `./${folder}/${file}`;
      if (file.endsWith(".pdf")) {
        const data = await pdfParse(fs.readFileSync(filePath));
        allNotesText += `\n\n[${file}]\n${data.text}`;
      } else if (file.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ path: filePath });
        allNotesText += `\n\n[${file}]\n${result.value}`;
      } else if (file.endsWith(".txt")) {
        allNotesText += fs.readFileSync(filePath, "utf-8");
      }
    }
  }
  console.log("✅ Loaded all main lesson files.");
}

// 🧠 move top-level await inside an async function
(async () => {
  await loadAllNotes();

  app.post("/ask", async (req, res) => {
    const { question } = req.body;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful study assistant. Use the context provided to answer questions based on school lessons."
            },
            {
              role: "user",
              content: `Context:\n${allNotesText.slice(0, 8000)}\n\nQuestion: ${question}`
            }
          ]
        })
      });

      const data = await response.json();
      console.log("API response:", data);

      const answer = data?.choices?.[0]?.message?.content || "No answer found.";
      res.json({ answer });
    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(3000, () => console.log("Server running at http://localhost:3000"));
})();