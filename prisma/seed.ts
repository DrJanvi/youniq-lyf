import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slug";

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
const read = (f: string) => JSON.parse(readFileSync(join(__dirname, "../sample-data", f), "utf8"));
const categoryImage = "https://i.ibb.co/bjgWVt8x/category-1.webp";

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("Set SEED_ADMIN_PASSWORD");
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    create: { username, name: "Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });

  await prisma.contactPageSetting.upsert({
    where: { id: "contact-us" },
    update: {},
    create: {
      id: "contact-us",
      contactIntro: "Whether you need help choosing a fragrance or have a question about an order, our team is ready to assist.",
    },
  });

  const contactLocations = [
    {
      slug: "jeddah-saudi-arabia",
      city: "Jeddah",
      country: "Saudi Arabia",
      company: "Al Hussain Buabed Banafa Factory",
      address: "P.O. Box 16787, Jeddah 21474",
      phone: "+966 12 627 4600",
      whatsapp: "+966 12 627 7447",
      sortOrder: 0,
    },
    {
      slug: "dubai-united-arab-emirates",
      city: "Dubai",
      country: "United Arab Emirates",
      company: "Buabed Banafa Perfumes Industry FZCO",
      address: "P.O. Box 61266, Jebel Ali Free Zone",
      phone: "+971 4 819 8950",
      whatsapp: "+971 55 387 6053",
      sortOrder: 1,
    },
  ];
  for (const location of contactLocations) {
    await prisma.contactLocation.upsert({
      where: { slug: location.slug },
      update: {},
      create: location,
    });
  }

  const contactFaqs = [
    {
      id: "contact-faq-fragrance-types",
      question: "What types of fragrances does Buabed Banafa offer?",
      answer: "We offer a wide range of fragrances inspired by Arabian and European blends. Contact our team and we’ll be happy to help you find the right scent.",
      sortOrder: 0,
    },
    {
      id: "contact-faq-men-women",
      question: "Do you offer fragrances for men and women?",
      answer: "Yes. Our collection includes fragrances for men and women, as well as unisex options.",
      sortOrder: 1,
    },
    {
      id: "contact-faq-authenticity",
      question: "Are your products authentic?",
      answer: "All products sold through our official store are authentic Buabed Banafa products.",
      sortOrder: 2,
    },
    {
      id: "contact-faq-other-products",
      question: "Do you sell products other than perfumes?",
      answer: "Yes. Our range also includes body care, hair care, and home care products.",
      sortOrder: 3,
    },
  ];
  for (const faq of contactFaqs) {
    await prisma.contactFaq.upsert({
      where: { id: faq.id },
      update: {},
      create: faq,
    });
  }

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
    where: { slug: "banafa" },
    update: {},
    create: { name: "Banafa", slug: "banafa" },
  });

  const products = read("get-all-products.json").data;
  const usedSlugs = new Set<string>();
  for (const p of products) {
    let categoryId = categoryIds.get(p.category);
    if (!categoryId) {
      const row = await prisma.category.upsert({
        where: { slug: slugify(p.category) },
        update: { image: categoryImage },
        create: { name: p.category, slug: slugify(p.category), image: categoryImage },
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
        currency: p.price.currency?.code ?? "AED",
        stock: p.quantity ?? 0,
        gender: ["MALE", "FEMALE", "UNISEX"].includes(p.gender) ? p.gender : "UNISEX",
        rating: p.rating ?? 0,
        createdAt: new Date(p.createdAt),
        categoryId,
        brandId: brand.id,
      },
    });

    // The sample "discount" is a sale price; convert it into a percentage rule.
    const sale = p.discount?.amount;
    if (sale && sale < price) {
      const exists = await prisma.discount.findFirst({ where: { productId: product.id } });
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
  console.log(`Seeded ${products.length} products, ${cats.length} categories, admin "${username}"`);
}

main().finally(() => prisma.$disconnect());
