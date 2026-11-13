import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { slugify } from "../lib/slug";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});
const read = (f: string) =>
  JSON.parse(readFileSync(join(__dirname, "../sample-data", f), "utf8"));
const categoryImage = "https://i.ibb.co/bjgWVt8x/category-1.webp";

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("Set SEED_ADMIN_PASSWORD");
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    create: {
      username,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  await prisma.contactPageSetting.upsert({
    where: { id: "contact-us" },
    update: {},
    create: {
      id: "contact-us",
      contactIntro:
        "Whether you need help choosing a bag or have a question about an order, our team is ready to assist.",
    },
  });

  await prisma.announcementBarItem.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      message: "Early Users Get 50% Off - Hurry up, Limited Time Offer!",
      sortOrder: 0,
    },
  });

  const cats: { name: string }[] = read("get-categories.json").data;
  const categoryIds = new Map<string, string>();
  for (const c of cats) {
    const row = await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: { image: categoryImage },
      create: { name: c.name, slug: slugify(c.name), image: categoryImage },
    });
    categoryIds.set(c.name, row.id);
  }

  await prisma.tag.upsert({
    where: { slug: "featured" },
    update: {},
    create: { name: "Featured", slug: "featured" },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "youniqlyf" },
    update: {},
    create: { name: "Youniqlyf", slug: "youniqlyf" },
  });

  const products = read("get-all-products.json").data;
  const usedSlugs = new Set<string>();
  for (const p of products) {
    let categoryId = categoryIds.get(p.category);
    if (!categoryId) {
      const row = await prisma.category.upsert({
        where: { slug: slugify(p.category) },
        update: { image: categoryImage },
        create: {
          name: p.category,
          slug: slugify(p.category),
          image: categoryImage,
        },
      });
      categoryId = row.id;
      categoryIds.set(p.category, categoryId);
    }
    const title = String(p.name).trim();
    let slug = slugify(title);
    for (let i = 2; usedSlugs.has(slug); i++) slug = `${slugify(title)}-${i}`;
    usedSlugs.add(slug);

    const price = p.price.amount;
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        description: p.description,
        images: p.images ?? [],
        price,
        currency: p.price.currency?.code ?? "INR",
        stock: p.quantity ?? 0,
        gender: ["MALE", "FEMALE", "UNISEX"].includes(p.gender)
          ? p.gender
          : "UNISEX",
        rating: p.rating ?? 0,
        createdAt: new Date(p.createdAt),
        categoryId,
        brandId: brand.id,
      },
    });

    // The sample "discount" is a sale price; convert it into a percentage rule.
    const sale = p.discount?.amount;
    if (sale && sale < price) {
      const exists = await prisma.discount.findFirst({
        where: { productId: product.id },
      });
      if (!exists) {
        await prisma.discount.create({
          data: {
            name: "Sale",
            type: "PERCENT",
            value: Math.round(((price - sale) / price) * 10000) / 100,
            productId: product.id,
          },
        });
      }
    }
  }
  console.log(
    `Seeded ${products.length} products, ${cats.length} categories, admin "${username}"`,
  );
}

main().finally(() => prisma.$disconnect());
