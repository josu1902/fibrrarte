#!/bin/bash
echo "Setting up Fibrarte..."
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
echo "Setup complete! Run 'npm run dev' to start."
