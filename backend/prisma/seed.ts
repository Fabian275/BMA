import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const language1 = await prisma.language.create({
    data: {
      name: "Deutsch",
      code: "de",
    },
  });

  const language2 = await prisma.language.create({
    data: {
      name: "English",
      code: "en",
    },
  });

  const language3 = await prisma.language.create({
    data: {
      name: "Français",
      code: "fr",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "Fabian",
      password_hash:
        "$2a$12$LHl0Jokb6ECixS4S8o1wXeQd7xwBTrG4qzyrUBz8jZqL5xwsrBTiG", //passwort: G8Zq6tKrit
        language: { connect: { id: language1.id }},
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "Jannis",
      password_hash:
        "$2a$12$DFrBiCzsi6klAQG.wcyz8egvfkkBKFbBJbfi7AqWidRy3FLp8kz9K", //passwort: ELLFeH9nMC
       language: { connect: { id: language2.id }},
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: "Ares",
      password_hash:
        "$2a$12$4/RPuCOiVPaFzFWE8TCnU.5.FXSgIMtsVadpDR2yt7.83dFypKFku", //passwort: meYX2T0d30
       language: { connect: { id: language3.id }},
    },
  });


  console.log("Initialdaten hinzugefügt:", {
    language1,
    language2,
    language3,
    user1,
    user2,
    user3,
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
