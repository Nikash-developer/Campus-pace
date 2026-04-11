// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import dotenv from 'dotenv';
dotenv.config();

export const generateQuiz = async (req: any, res: any) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing from environment variables");
            return res.status(500).json({ error: "AI service not configured. GEMINI_API_KEY is missing." });
        }

        const prompt = `Generate exactly 10 challenging academic multiple-choice questions for a university student on the topic: "${topic}".
Style: Engineering/University level (Mumbai University exam pattern).
Return ONLY a valid JSON array. No markdown, no backticks, no extra text.
Each object must have:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (0 to 3),
  "explanation": "short educational string"
}`;

        console.log(`[Quiz] Requesting questions for topic: ${topic}`);

        // Use the Gemini REST API directly — no SDK needed
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error(`[Quiz] Gemini API Error (${apiResponse.status}):`, errorBody);
            throw new Error(`Gemini API returned ${apiResponse.status}: ${errorBody.slice(0, 200)}`);
        }

        const apiResult = await apiResponse.json();

        // Extract text from Gemini response
        const text = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("[Quiz] No text in Gemini response:", JSON.stringify(apiResult, null, 2));
            throw new Error("Empty response from AI model");
        }

        console.log(`[Quiz] Received response, length: ${text.length}`);

        // Parse the JSON
        let questions;
        try {
            questions = JSON.parse(text);
        } catch (parseErr) {
            // Fallback: try to extract JSON array from potentially wrapped text
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                console.error("[Quiz] Failed to parse:", text.slice(0, 300));
                throw new Error("AI returned invalid JSON");
            }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("AI returned empty or invalid array");
        }

        // Add IDs
        const questionsWithIds = questions.map((q: any, idx: number) => ({
            ...q,
            id: idx + 1
        }));

        console.log(`[Quiz] Success: ${questionsWithIds.length} questions generated`);
        res.json({ questions: questionsWithIds });

    } catch (err: any) {
        console.error("[Quiz] Error:", err.message || err);
        res.status(500).json({ error: err.message || "Failed to generate quiz" });
    }
};
