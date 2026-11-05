ALTER TABLE `Category`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Category_deletedAt_idx`(`deletedAt`);

ALTER TABLE `Brand`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Brand_deletedAt_idx`(`deletedAt`);

ALTER TABLE `ProductType`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `ProductType_deletedAt_idx`(`deletedAt`);

ALTER TABLE `Product`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedByTaxonomy` BOOLEAN NOT NULL DEFAULT false,
    ADD INDEX `Product_deletedAt_idx`(`deletedAt`),
    ADD INDEX `Product_deletedByTaxonomy_idx`(`deletedByTaxonomy`);

ALTER TABLE `Discount`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Discount_deletedAt_idx`(`deletedAt`);

ALTER TABLE `Coupon`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Coupon_deletedAt_idx`(`deletedAt`);

ALTER TABLE `Review`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Review_deletedAt_idx`(`deletedAt`);

ALTER TABLE `Order`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `Order_deletedAt_idx`(`deletedAt`);

ALTER TABLE `HighlightedPost`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `HighlightedPost_deletedAt_idx`(`deletedAt`);

ALTER TABLE `HeroBanner`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `HeroBanner_deletedAt_idx`(`deletedAt`);

ALTER TABLE `BlogArticle`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `BlogArticle_deletedAt_idx`(`deletedAt`);

ALTER TABLE `ContactLocation`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `ContactLocation_deletedAt_idx`(`deletedAt`);

ALTER TABLE `ContactFaq`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `ContactFaq_deletedAt_idx`(`deletedAt`);

ALTER TABLE `AboutUsPrinciple`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `AboutUsPrinciple_deletedAt_idx`(`deletedAt`);

ALTER TABLE `AboutUsLegacyStat`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `AboutUsLegacyStat_deletedAt_idx`(`deletedAt`);

ALTER TABLE `AboutUsWhyChooseCard`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD INDEX `AboutUsWhyChooseCard_deletedAt_idx`(`deletedAt`);
