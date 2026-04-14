import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Termék kosárba helyezése
router.post("/cart/add", async (req, res) => {
  console.log("📦 Kosárba helyezés kérés:", req.body);
  const { userId, productName, productPrice } = req.body;
  
  if (!userId || !productName || !productPrice) {
    return res.status(400).json({ error: "Hiányzó adatok!" });
  }
  
  try {
    // Ellenőrizzük, van-e már aktív kosár
    const existingCart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (existingCart?.status === 'FILLED') {
      return res.status(400).json({ error: "Már van termék a kosárban" });
    }
    
    // Kosár létrehozása vagy frissítése
    const cart = await prisma.cart.upsert({
      where: { userId: parseInt(userId) },
      update: {
        productName: productName,
        productPrice: productPrice,
        status: 'FILLED'
      },
      create: {
        userId: parseInt(userId),
        productName: productName,
        productPrice: productPrice,
        status: 'FILLED'
      }
    });
    
    res.json({ 
      success: true, 
      cart: {
        productName: cart.productName,
        productPrice: cart.productPrice
      }
    });
  } catch (error) {
    console.error("❌ Részletes hiba:", error);
    res.status(500).json({ 
      error: "Hiba a kosárba helyezéskor",
      details: error instanceof Error ? error.message : error
    });
  }
});

// Kosár állapotának lekérése
router.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (!cart || cart.status === 'EMPTY') {
      return res.json({ cart: null });
    }
    
    res.json({ 
      cart: {
        productName: cart.productName,
        productPrice: cart.productPrice
      }
    });
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a kosár lekérésekor" });
  }
});

// Termék eltávolítása a kosárból
router.post("/cart/remove", async (req, res) => {
  const { userId } = req.body;
  
  try {
    await prisma.cart.update({
      where: { userId: parseInt(userId) },
      data: {
        productName: null,
        productPrice: null,
        status: 'EMPTY'
      }
    });
    
    res.json({ success: true, message: "Termék eltávolítva a kosárból" });
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a termék eltávolításakor" });
  }
});

// Fizetés - MÓDOSÍTVA: PENDING státusszal menti
router.post("/cart/checkout", async (req, res) => {
  const { userId, productName, productPrice } = req.body;
  
  try {
    // Rendelés létrehozása PENDING státusszal
    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        productName: productName,
        productPrice: productPrice,
        status: 'PENDING' // Változtatás: PENDING, nem COMPLETED
      }
    });
    
    // Kosár ürítése
    await prisma.cart.update({
      where: { userId: parseInt(userId) },
      data: {
        productName: null,
        productPrice: null,
        status: 'EMPTY'
      }
    });
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a fizetés során" });
  }
});

// Felhasználó rendelési státuszának lekérése - MÓDOSÍTVA
router.get("/status/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const lastOrder = await prisma.order.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!lastOrder) {
      return res.json({ status: "Még nem fizettél" });
    }
    
    // Magyar nyelvű státusz szövegek
    let statusText = "";
    switch(lastOrder.status) {
      case 'PENDING':
        statusText = "Függőben (Admin jóváhagyásra vár)";
        break;
      case 'COMPLETED':
        statusText = "Sikeres rendelés";
        break;
      case 'CANCELLED':
        statusText = "Elutasítva";
        break;
      default:
        statusText = lastOrder.status;
    }
    
    res.json({
      status: statusText,
      rawStatus: lastOrder.status, // Nyers státusz a frontendnek
      lastOrder: {
        id: lastOrder.id,
        productName: lastOrder.productName,
        productPrice: lastOrder.productPrice,
        date: lastOrder.createdAt
      }
    });
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a státusz lekérésekor" });
  }
});

// ADMIN végpontok
// Összes függőben lévő rendelés lekérése
router.get("/admin/pending-orders", async (req, res) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(pendingOrders);
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a rendelések lekérésekor" });
  }
});

// Rendelés státuszának frissítése
router.put("/admin/update-order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // 'COMPLETED' vagy 'CANCELLED'
  
  if (!['COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: "Érvénytelen státusz" });
  }
  
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: status }
    });
    
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("❌ Hiba:", error);
    res.status(500).json({ error: "Hiba a rendelés frissítésekor" });
  }
});

export default router;