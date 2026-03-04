import Notice from '../models/Notice.ts';
import Assignment from '../models/Assignment.ts';
import QuestionPaper from '../models/QuestionPaper.ts';
import User from '../models/User.ts';

export const handleChatOptions = async (req: any, res: any) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const msg = message.toLowerCase();
        let response = "I'm not sure about that. Try asking about your 'assignments', 'notices', 'eco stats', or 'question papers'.";

        // Logic for Dynamic AI Responses
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
            response = `Hello ${req.user.name.split(' ')[0]}! I'm your Green-Sync AI. How can I assist your studies today?`;
        }

        res.json({ response });
    } catch (err: any) {
        res.status(500).json({ error: "AI Assistant is currently resting. Please try again later." });
    }
};
