import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize genAI outside the handler to take advantage of warm starts
let genAI: any = null;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }
} catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
}

export const generateQuiz = async (req: any, res: any) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        if (!genAI) {
            console.error("GEMINI_API_KEY is missing or genAI failed to initialize");
            return res.status(500).json({ error: "AI service configuration error. Please check GEMINI_API_KEY in Vercel settings." });
        }

        // Reduced to 10 questions for extreme performance safety on Vercel free tier
        const prompt = `Generate exactly 10 multiple-choice questions for: "${topic}".
Style: Engineering/University level.
Format: JSON array ONLY.
Structure:
{
  "question": "string",
  "options": ["str", "str", "str", "str"],
  "correctAnswer": 0-3,
  "explanation": "short string"
}`;

        console.log(`Requesting 10 questions for topic: ${topic}`);

        // Set a timeout for the AI call itself
        const aiPromise = genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json"
            }
        });

        // Race against a timeout to provide a better error than Vercel's 500
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI generation timed out (10s limit)")), 9500)
        );

        const result: any = await Promise.race([aiPromise, timeoutPromise]);

        let text = result.text || "";

        // Comprehensive fallback for different SDK response shapes
        if (!text && result.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = result.candidates[0].content.parts[0].text;
        }

        if (!text) {
            throw new Error("Empty response from AI");
        }

        // Robust parsing
        let questions;
        try {
            questions = JSON.parse(text);
        } catch (parseErr) {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse AI response into JSON array");
            }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid response format: an array was expected.");
        }

        // Add IDs
        const questionsWithIds = questions.map((q, idx) => ({
            ...q,
            id: idx + 1
        }));

        res.json({ questions: questionsWithIds });
    } catch (err: any) {
        console.error("Quiz Generation Error Details:", err);

        // Return clear errors to the client
        const status = err.message?.includes("timed out") ? 504 : 500;
        res.status(status).json({
            error: err.message || "AI service error",
            details: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
    }
};
