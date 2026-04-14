import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
app.get("/members", async (req, res) => {
    try {
        const members = await prisma.members.findMany();
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: "Hiba a lekérdezés során." });
    }
});
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
