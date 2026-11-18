ALTER TABLE `Discount`
    ADD COLUMN `variantScope` ENUM('ALL', 'SELECTED') NOT NULL DEFAULT 'ALL';

CREATE TABLE `DiscountVariant` (
    `discountId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,

    INDEX `DiscountVariant_variantId_idx`(`variantId`),
    PRIMARY KEY (`discountId`, `variantId`),
    CONSTRAINT `DiscountVariant_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `DiscountVariant_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
