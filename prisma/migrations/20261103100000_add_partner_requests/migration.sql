CREATE TABLE `PartnerRequest` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `countryCode` VARCHAR(4) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `interest` ENUM('DISTRIBUTOR', 'INFLUENCER_CREATOR', 'OTHER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `PartnerRequest_createdAt_idx`(`createdAt`),
    INDEX `PartnerRequest_fullName_idx`(`fullName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
