// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import Notice from '../models/Notice';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import User from '../models/User';

export const handleChatOptions = async (req: any, res: any) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const msg = message.toLowerCase();
        let response = "";

        // --- 1. LOCAL KEYWORD LOGIC (Campus Specific) ---
        if (msg.includes("notice") || msg.includes("announcement")) {
            const latestNotice = await Notice.findOne().sort({ createdAt: -1 });
            response = latestNotice
                ? `The latest notice is: "${latestNotice.title}". You can find more detail in the Announcements section.`
                : "There are no recent notices at the moment.";
        }
        else if (msg.includes("assignment") || msg.includes("homework") || msg.includes("deadline")) {
            const pending = await Assignment.find().sort({ deadline: 1 }).limit(2);
            if (pending.length > 0) {
                const list = pending.map(a => `${a.title} (Due: ${new Date(a.deadline!).toLocaleDateString()})`).join(", ");
                response = `You have these upcoming assignments: ${list}. Better get started!`;
            } else {
                response = "You're all caught up! No pending assignments found.";
            }
        }
        else if (msg.includes("paper") || msg.includes("previous")) {
            const count = await QuestionPaper.countDocuments();
            const sample = await QuestionPaper.findOne();
            response = `We have ${count} question papers in the grid. ${sample ? `For example, I found a ${sample.subject} paper from ${sample.year}.` : ""}`;
        }
        else if (msg.includes("eco") || msg.includes("impact") || msg.includes("water") || msg.includes("carbon")) {
            const user = await User.findById(userId);
            if (user?.eco_stats) {
                const { total_pages_saved, total_water_saved, total_co2_prevented } = user.eco_stats;
                response = `Your impact is amazing! You've saved ${total_pages_saved} pages, which equals ${total_water_saved}L of water and prevented ${total_co2_prevented}kg of CO2. Keep going!`;
            } else {
                response = "Your eco-tracking is just getting started. Start submitting assignments digitally to see your impact!";
        let campusContext = "";

        // --- 1. GATHER LOCAL CONTEXT (Dynamic Facts) ---
        try {
            if (msg.includes("notice") || msg.includes("announcement")) {
                const notices = await Notice.find().sort({ createdAt: -1 }).limit(3);
                campusContext += notices.length > 0 
                  ? `[Context: List of Recent Notices: ${notices.map(n => n.title).join(", ")}] ` 
                  : "[Context: There are no recent notices.] ";
            }
            if (msg.includes("assignment") || msg.includes("homework") || msg.includes("deadline")) {
                const pending = await Assignment.find().sort({ deadline: 1 }).limit(3);
                campusContext += pending.length > 0
                  ? `[Context: Upcoming Assignments: ${pending.map(a => `${a.title} due on ${new Date(a.deadline!).toLocaleDateString()}`).join(", ")}] `
                  : "[Context: You have no pending assignments.] ";
            }
            if (msg.includes("eco") || msg.includes("impact") || msg.includes("water") || msg.includes("carbon")) {
                const user = await User.findById(userId);
                if (user?.eco_stats) {
                    campusContext += `[Context: User's Eco-Stats: ${user.eco_stats.total_pages_saved} pages saved, ${user.eco_stats.total_water_saved}L water saved, ${user.eco_stats.total_co2_prevented}kg CO2 prevented.] `;
                }
            }
            if (msg.includes("paper") || msg.includes("previous")) {
                const count = await QuestionPaper.countDocuments();
                campusContext += `[Context: We have ${count} previous year question papers available in the dashboard.] `;
            }
        } catch (dbErr) {
            console.warn("DB Context gathering failed:", dbErr);
        }

        // --- 2. GROK AI AGENT RESPONSE ---
        if (!process.env.GROK_API_KEY) {
            return res.json({ response: "Welcome! I'm your Campus-Pace helper. [SYSTEM NOTE: Grok API Key is missing in Environment Variables. Please add GROK_API_KEY to Vercel to activate my full brain!]" });
        }

        const postData = JSON.stringify({
            model: "grok-beta",
            messages: [
                { 
                    role: "system", 
                    content: `You are Campus-Pace AI, a high-performance Grok-beta powered study agent. 
                    PERSONALITY: You are witty, encouraging, and highly intelligent. 
                    RULES: 
                    1. Focus strictly on academic and campus-related topics.
                    2. Use the local context provided in modern markdown formatting.
                    3. If a user asks about local info (notices, assignments), use the [Context] tags provided below.
                    4. Keep responses concise but impactful.` 
                },
                { role: "user", content: `${campusContext}\n\nUser Question: ${message}` }
            ],
            temperature: 0.7
        });

        const options = {
            hostname: 'api.x.ai',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const aiReq = https.request(options, (aiRes) => {
            let body = '';
            aiRes.on('data', (chunk) => body += chunk);
            aiRes.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (aiRes.statusCode === 200) {
                        res.json({ response: data.choices?.[0]?.message?.content || "I'm having a quiet moment. Try again!" });
                    } else {
                        console.error("Grok API Error Status:", aiRes.statusCode, body);
                        res.json({ response: `Grok is currently unavailable (Error ${aiRes.statusCode}). I'll try my best to help manually if you have a simple question!` });
                    }
                } catch (e) {
                    res.json({ response: "I encountered a processing error. Please try a simpler question." });
                }
            });
        });

        aiReq.on('error', (e) => {
            console.error("Grok Request Error:", e);
            res.json({ response: "My connection to the AI network was interrupted. Please check your internet or try again later." });
        });

        aiReq.write(postData);
        aiReq.end();

    } catch (err: any) {
        res.status(500).json({ error: "AI Assistant is currently resting. Please try again later." });
    }
};
