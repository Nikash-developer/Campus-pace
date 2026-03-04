import express from 'express';
// import { createServer as createViteServer } from 'vite'; // Removed from top for production safety
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// MongoDB setup
import { connectDB } from './server/config/db';
import { seedDB } from './server/seed';

// Route imports
import authRoutes from './server/routes/authRoutes';
import assignmentRoutes from './server/routes/assignmentRoutes';
import submissionRoutes from './server/routes/submissionRoutes';
import uploadRoutes from './server/routes/uploadRoutes';
import noticeRoutes from './server/routes/noticeRoutes';
import chatbotRoutes from './server/routes/chatbotRoutes';
import questionPaperRoutes from './server/routes/questionPaperRoutes';
import quizRoutes from './server/routes/quizRoutes';

import dns from "node:dns";
// dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS - Disabled for production stability unless needed

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbMiddleware = async (req: any, res: any, next: any) => {
  try {
    const conn = await connectDB();
    if (!conn) {
      return res.status(503).json({
        error: 'Database connection failed. Please check your MONGO_URI and IP whitelist settings in MongoDB Atlas.'
      });
    }
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database service unavailable' });
  }
};

// --- API ROUTES ---
// We register these at the top level so they are available immediately for Vercel
app.use('/api/auth', dbMiddleware, authRoutes);
app.use('/api/assignments', dbMiddleware, assignmentRoutes);
app.use('/api/submissions', dbMiddleware, submissionRoutes);
app.use('/api/upload', dbMiddleware, uploadRoutes);
app.use('/api/notices', dbMiddleware, noticeRoutes);
app.use('/api/chatbot', dbMiddleware, chatbotRoutes);
app.use('/api/quiz', dbMiddleware, quizRoutes);
app.use('/api', dbMiddleware, questionPaperRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

async function setupApp() {
  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import vite only in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Seed locally only
    await connectDB();
    await seedDB();
  } else {
    // Production serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Check if the path is an API call that missed the routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL !== "1") {
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('A user connected via Socket.io');
    });

    server.listen(PORT as number, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

setupApp().catch((err) => {
  console.error("setupApp failed:", err);
});
export default app;
