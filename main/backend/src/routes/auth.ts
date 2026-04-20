import express, { Router, Request, Response } from 'express';
import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Regisztráció
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Felhasználónév és jelszó szükséges' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Felhasználónév már foglalt' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    });

    res.status(201).json({ message: 'Sikeres regisztráció', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Szerver hiba' });
  }
});

// Bejelentkezés
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Felhasználónév és jelszó szükséges' });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
    }

    // Státusz ellenőrzése
    if (user.status === UserStatus.BANNED) {
      return res.status(403).json({ error: 'A fiókod ki van tiltva.' });
    }
    if (user.status === UserStatus.DELETED) {
      return res.status(403).json({ error: 'A fiókod törölve lett.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
    }

    res.json({ message: 'Sikeres bejelentkezés', userId: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Szerver hiba' });
  }
});

// Felhasználó törlése (soft delete)
router.delete('/delete/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Felhasználó sikeresen törölve (soft delete)' });
  } catch (error) {
    console.error('Hiba a felhasználó törlésekor:', error);
    res.status(500).json({ error: 'Szerver hiba a felhasználó törlésekor' });
  }
});

export default router;