import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Make sure it exists in your .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const paths = [
    {
      slug: "cyber-security",
      name: "Cyber Security",
      description: "SOC, SIEM, incident response, security fundamentals.",
    },
    {
      slug: "software-engineering",
      name: "Software Engineering",
      description: "Full-stack development, system design, testing, CI/CD.",
    },
    {
      slug: "data-ai",
      name: "Data & AI",
      description: "Data analysis, machine learning, pipelines, MLOps basics.",
    },
  ];

  for (const path of paths) {
    await prisma.careerPath.upsert({
      where: { slug: path.slug },
      update: {
        name: path.name,
        description: path.description,
      },
      create: {
        slug: path.slug,
        name: path.name,
        description: path.description,
      },
    });
  }

  console.log("✅ CareerPath seeding completed");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
