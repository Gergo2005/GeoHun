import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import authRoutes from "./routes/auth";
import shopRoutes from "./routes/shop"; // Ez az import legyen meg

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger';

// CORS beállítások
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());


// Route-ok regisztrálása - FONTOS sorrend!
app.use('/auth', authRoutes);
app.use('/shop', shopRoutes); // Ez kell, hogy legyen!

// Swagger dokumentáció endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Teszt endpoint a shop elérésének ellenőrzésére
app.get('/test-shop', (req, res) => {
  res.json({ message: 'Shop router működik' });
});

// Leaderboard végpontok
app.get("/members", async (req, res) => {
    try {
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: { score: 'desc' }
        });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Hiba a leaderboard lekérdezésekor." });
    }
});

app.get('/user/levels/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED'
            },
            select: {
                productName: true
            }
        });
        const levels = orders.map(o => o.productName);
        res.json({ levels });
    } catch (error) {
        res.status(500).json({ error: 'Hiba a szintek lekérésekor' });
    }
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "Backend fut",
        timestamp: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "Bookclub Backend API",
        endpoints: {
            members: "/members",
            health: "/health",
            shop: "/shop",
            auth: "/auth",
            test: "/test-shop"
        }
    });
});

app.post("/leaderboard", async (req, res) => {
    const { username, score, rounds } = req.body;
    if (!username || typeof score !== 'number' || typeof rounds !== 'number') {
        return res.status(400).json({ error: "Hiányzó vagy hibás adatok." });
    }
    try {
        const entry = await prisma.leaderboard.create({
            data: { username, score, rounds }
        });
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: "Hiba mentés közben." });
    }
});

app.get("/leaderboard", async (req, res) => {
    try {
        const leaderboard = await prisma.leaderboard.findMany({
            orderBy: { score: 'desc' }
        });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Hiba a leaderboard lekérdezésekor." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Szerver fut: http://localhost:${PORT}`);
    console.log(`📊 Tagok endpoint: http://localhost:${PORT}/members`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🏆 Leaderboard POST: http://localhost:${PORT}/leaderboard`);
    console.log(`🏆 Leaderboard GET: http://localhost:${PORT}/leaderboard`);
    console.log(`🛒 Shop endpoints: http://localhost:${PORT}/shop`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
});