// Quiz Generation Handler - v1.1
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Auth check
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authorized, no token' });
        }
        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (jwtErr: any) {
            const secretLength = process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0;
            const secretPrefix = process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) : 'NONE';
            const reason = jwtErr.name === 'TokenExpiredError' 
                ? 'Token expired. Please log out and log in again.' 
                : jwtErr.name === 'JsonWebTokenError'
                    ? `Invalid token signature. Server sees secret starting with "${secretPrefix}" (length: ${secretLength}).`
                    : 'Token verification failed';
            return res.status(401).json({ error: reason });
        }

        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel Environment Variables." });
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

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
            console.error(`Gemini API Error (${apiResponse.status}):`, errorBody);
            return res.status(502).json({ error: `AI API error: ${errorBody.slice(0, 200)}` });
        }

        const apiResult = await apiResponse.json();
        const text = apiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(502).json({ error: "Empty response from AI model" });
        }

        let questions;
        try {
            questions = JSON.parse(text);
        } catch {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                return res.status(502).json({ error: "AI returned invalid JSON" });
            }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(502).json({ error: "AI returned empty array" });
        }

        const questionsWithIds = questions.map((q: any, idx: number) => ({
            ...q,
            id: idx + 1
        }));

        return res.status(200).json({ questions: questionsWithIds });

    } catch (err: any) {
        console.error("Quiz handler error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
