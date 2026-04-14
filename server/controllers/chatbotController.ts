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
            }
        }
        else if (msg.includes("navigation") || msg.includes("where is") || msg.includes("tab")) {
            response = "You can navigate using the sidebar. 'Dashboard' for overview, 'Courses' for your classes, 'Eco-Impact' for your stats, and 'History' for past notices.";
        }
        else if (msg.includes("hello") || msg.includes("hi ") || msg.startsWith("hi")) {
            response = `Hello ${req.user.name.split(' ')[0]}! I'm your Campus-Pace AI. How can I assist your studies today?`;
        }

        // --- 2. GROK AI INTEGRATION (Study Queries) ---
        if (!response) {
            try {
                const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.GROK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "grok-beta",
                        messages: [
                            { 
                                role: "system", 
                                content: "You are Campus-Pace AI, a highly intelligent and specialized study assistant. Focus strictly on academic and study-related queries. If a user asks something unrelated to education or the campus, politely steer them back to their studies. Be concise, encouraging, and accurate." 
                            },
                            { role: "user", content: message }
                        ],
                        temperature: 0.7
                    })
                });

                if (grokRes.ok) {
                    const data = await grokRes.json();
                    response = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";
                } else {
                    response = "Our study assistant is currently busy with other students. Try asking a campus-specific question instead!";
                }
            } catch (aiErr) {
                console.error("Grok AI Error:", aiErr);
                response = "I'm currently unable to connect to the brain network. Please check your internet or try again in a bit.";
            }
        }

        res.json({ response });
    } catch (err: any) {
        res.status(500).json({ error: "AI Assistant is currently resting. Please try again later." });
    }
};
