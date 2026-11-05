CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `images` JSON NOT NULL,
    `priceOverride` DECIMAL(10, 2) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariant_productId_isActive_idx`(`productId`, `isActive`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CartItem`
    ADD COLUMN `variantId` VARCHAR(191) NULL,
    ADD COLUMN `variantKey` VARCHAR(191) NOT NULL DEFAULT '';

ALTER TABLE `CartItem`
    DROP FOREIGN KEY `CartItem_cartId_fkey`;

DROP INDEX `CartItem_cartId_productId_key` ON `CartItem`;

CREATE UNIQUE INDEX `CartItem_cartId_productId_variantKey_key`
    ON `CartItem`(`cartId`, `productId`, `variantKey`);

ALTER TABLE `CartItem`
    ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CartItem`
    ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
    ADD COLUMN `variantId` VARCHAR(191) NULL,
    ADD COLUMN `variantName` VARCHAR(120) NULL,
    ADD COLUMN `variantColor` VARCHAR(7) NULL,
    ADD COLUMN `variantImages` JSON NULL;

ALTER TABLE `OrderItem`
    ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
