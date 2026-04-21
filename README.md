Magyar GeoGuessr
Ez a projekt egy magyarországi helyszíneken alapuló GeoGuessr-szerű játék, amely React + TypeScript frontendből és Express + Prisma + MySQL backendből áll. A játékhoz tartozik felhasználói hitelesítés, shop, leaderboard, valamint térképes játékélmény.

Fő funkciók
Regisztráció és bejelentkezés
Térképes játék magyar helyszínekkel
Shop (vásárlás, kosár, rendelés)
Leaderboard (pontverseny)
Sötét/világos mód
Swagger API dokumentáció
Cypress E2E tesztek
Technológiák
Frontend: React, TypeScript, Vite, Google Maps API, Cypress
Backend: Node.js, Express, Prisma ORM, MySQL, Swagger
Tesztelés: Cypress (E2E)
Telepítés
1. Klónozd a repót és lépj be a főkönyvtárba
git clone <repo-url>
cd geohun/main
2. Backend telepítése és indítása
cd backend
npm install
# .env fájlban állítsd be a DATABASE_URL-t (MySQL)
npx prisma generate
npx prisma db pull
npx prisma db push
npm run dev
A backend alapértelmezett portja: 3000

3. Frontend telepítése és indítása
cd ../frontend
npm install
npm run dev
A frontend alapértelmezett portja: 5173

4. Adatbázis seedelése (opcionális)
cd backend
npx tsx prisma/seed.ts

Tesztelés
E2E tesztek (Cypress)
A frontend mappában:

npx cypress run
vagy grafikus felülettel:

npx cypress open
A Cypress tesztek a cypress/e2e mappában találhatók.

Főbb mappák és fájlok
backend/ – Express backend, Prisma ORM, API-k
backend/prisma/schema.prisma – Adatbázis séma
frontend/ – React + TypeScript frontend
frontend/cypress/ – E2E tesztek
frontend/src/components/ – Főbb React komponensek
Környezeti változók
A backend .env fájlban add meg a MySQL adatbázis elérhetőségét:

DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
Swagger API
A backend automatikusan generált Swagger dokumentációval rendelkezik:
http://localhost:3000/api-docs

Részletesebb leírások a videókban!

Készítette: GeoHun csapata
