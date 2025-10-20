# Backend Setup Instructions
- docker exec -it dc-backend-1 sh
- npx prisma migrate dev --name init
- npm run seed
- exit