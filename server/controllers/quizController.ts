import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Unified Google Gen AI SDK initialization
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
});

export const generateQuiz = async (req: any, res: any) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing from environment variables");
            return res.status(500).json({ error: "AI service configuration error (API Key missing)." });
        }

        const prompt = `Generate exactly 15 challenging academic multiple-choice questions for a university student on the topic: "${topic}".
Follow the engineering exam style of Mumbai University.
Return ONLY a JSON array of objects with this structure:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (0-3),
  "explanation": "educational string"
}`;

        // Using the new @google/genai SDK syntax
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json"
            }
        });

        // The new SDK returns the text directly in response.text
        let text = result.text || "";

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
            console.error("JSON Parse Error. Raw Text:", text);
            // Fallback: try to extract JSON from markdown if AI failed to respect mimeType
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse AI response into JSON");
            }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid response format: an array was expected.");
        }

        // Add IDs and ensure we have enough questions
        const questionsWithIds = questions.map((q, idx) => ({
            ...q,
            id: idx + 1
        }));

        res.json({ questions: questionsWithIds });
    } catch (err: any) {
        console.error("Quiz Generation Error Details:", err);
        let errorMessage = "AI service is currently busy or timed out. Please try again.";

        if (err.message?.includes("API_KEY")) {
            errorMessage = "AI Authentication failed. Check API Key deployment.";
        }

        res.status(500).json({ error: errorMessage });
    }
};
