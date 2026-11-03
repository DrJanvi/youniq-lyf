CREATE TABLE `BlogArticle` (
    `id` VARCHAR(36) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(60) NOT NULL,
    `publishedAt` DATE NOT NULL,
    `readTime` INTEGER NOT NULL,
    `excerpt` VARCHAR(320) NOT NULL,
    `image` VARCHAR(1000) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogArticle_slug_key`(`slug`),
    INDEX `BlogArticle_category_publishedAt_idx`(`category`, `publishedAt`),
    INDEX `BlogArticle_publishedAt_idx`(`publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
