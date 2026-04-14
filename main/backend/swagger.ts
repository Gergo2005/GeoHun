const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Bookclub Backend API",
    version: "1.0.0",
    description: "Teljeskörű Swagger dokumentáció a bookclub-backend API végpontjaihoz."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Fejlesztői szerver"
    }
  ],
  paths: {
    "/auth/register": {
      post: {
        summary: "Felhasználó regisztráció",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Sikeres regisztráció",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    userId: { type: "integer" }
                  }
                }
              }
            }
          },
          400: { description: "Hiányzó adatok" },
          409: { description: "Felhasználónév már foglalt" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Felhasználó bejelentkezés",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Sikeres bejelentkezés",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    userId: { type: "integer" },
                    username: { type: "string" }
                  }
                }
              }
            }
          },
          400: { description: "Hiányzó adatok" },
          401: { description: "Hibás felhasználónév vagy jelszó" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/auth/delete/{userId}": {
      delete: {
        summary: "Felhasználó törlése",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Sikeres törlés" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/cart/add": {
      post: {
        summary: "Termék kosárba helyezése",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CartAddRequest"
              }
            }
          }
        },
        responses: {
          200: { description: "Sikeres kosárba helyezés" },
          400: { description: "Hiányzó adatok vagy már van termék a kosárban" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/cart/{userId}": {
      get: {
        summary: "Kosár állapot lekérdezése",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Kosár adatai vagy üres" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/cart/remove": {
      post: {
        summary: "Termék eltávolítása a kosárból",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CartRemoveRequest"
              }
            }
          }
        },
        responses: {
          200: { description: "Sikeres eltávolítás" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/cart/checkout": {
      post: {
        summary: "Fizetés (checkout)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CartCheckoutRequest"
              }
            }
          }
        },
        responses: {
          200: { description: "Sikeres fizetés" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/status/{userId}": {
      get: {
        summary: "Felhasználó rendelési státusz lekérdezése",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Státusz adatok" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/admin/pending-orders": {
      get: {
        summary: "Összes függőben lévő rendelés lekérdezése (admin)",
        responses: {
          200: { description: "Függőben lévő rendelések listája" },
          500: { description: "Szerver hiba" }
        }
      }
    },
    "/shop/admin/update-order/{orderId}": {
      put: {
        summary: "Rendelés státuszának frissítése (admin)",
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateOrderRequest"
              }
            }
          }
        },
        responses: {
          200: { description: "Sikeres frissítés" },
          400: { description: "Érvénytelen státusz" },
          500: { description: "Szerver hiba" }
        }
      }
    }
  },
  components: {
    schemas: {
      RegisterRequest: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" }
        },
        required: ["username", "password"]
      },
      LoginRequest: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" }
        },
        required: ["username", "password"]
      },
      CartAddRequest: {
        type: "object",
        properties: {
          userId: { type: "integer" },
          productName: { type: "string" },
          productPrice: { type: "number" }
        },
        required: ["userId", "productName", "productPrice"]
      },
      CartRemoveRequest: {
        type: "object",
        properties: {
          userId: { type: "integer" }
        },
        required: ["userId"]
      },
      CartCheckoutRequest: {
        type: "object",
        properties: {
          userId: { type: "integer" },
          productName: { type: "string" },
          productPrice: { type: "number" }
        },
        required: ["userId", "productName", "productPrice"]
      },
      UpdateOrderRequest: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["COMPLETED", "CANCELLED"] }
        },
        required: ["status"]
      }
    }
  }
};

export default swaggerDocument;
