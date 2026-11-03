CREATE TABLE `HeroBanner` (
    `id` VARCHAR(191) NOT NULL,
    `desktopImage` VARCHAR(1000) NOT NULL,
    `mobileImage` VARCHAR(1000) NULL,
    `link` VARCHAR(1000) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `HeroBanner` (`id`, `desktopImage`, `link`, `alt`, `sortOrder`) VALUES
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186271/storefront/7967f1bb-a221-49b7-8c8c-a784001e6809.webp', '/products', 'Banner 1', 1),
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186376/storefront/57b8ac74-5d12-4f03-99d1-4c9f0a0fa7e9.webp', '/products', 'Banner 2', 2),
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186400/storefront/f848a233-9d15-4a65-8812-566136d45ded.webp', '/products', 'Banner 3', 3),
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186414/storefront/7274d684-3ec4-4323-82bf-569335f2dbd8.webp', '/products', 'Banner 4', 4),
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186428/storefront/c07fe89a-7fe0-495e-97fa-0f9a4ead9920.webp', '/products', 'Banner 5', 5),
  (UUID(), 'https://res.cloudinary.com/dpwtbp5g/image/upload/v1793186442/storefront/629d7e8d-e51b-48a2-b0af-c5f78504adcb.webp', '/products', 'Banner 6', 6);

