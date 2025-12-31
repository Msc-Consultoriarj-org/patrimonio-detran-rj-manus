import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcryptjs";
import { users } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seedUsers() {
  console.log("🌱 Seeding users...");

  const passwordHash = await bcrypt.hash("123", 10);

  const usersToInsert = [
    {
      username: "moises",
      passwordHash,
      name: "Moises",
      email: "moises@detran.rj.gov.br",
      loginMethod: "local",
      role: "admin",
      mustChangePassword: 1,
    },
    {
      username: "pedro",
      passwordHash,
      name: "Pedro",
      email: "pedro@detran.rj.gov.br",
      loginMethod: "local",
      role: "admin",
      mustChangePassword: 1,
    },
  ];

  for (const user of usersToInsert) {
    try {
      await db.insert(users).values(user);
      console.log(`✅ User ${user.username} created`);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`⚠️  User ${user.username} already exists`);
      } else {
        console.error(`❌ Error creating user ${user.username}:`, error);
      }
    }
  }

  console.log("✨ Seeding complete!");
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
