CREATE TABLE `CareerPageSetting` (
    `id` VARCHAR(40) NOT NULL DEFAULT 'careers',
    `imageUrl` VARCHAR(1000) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CareerApplication` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `countryCode` VARCHAR(4) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `jobRole` ENUM('MARKETING', 'SALES', 'E_COMMERCE', 'OPERATIONS', 'OTHER') NOT NULL,
    `resumePublicId` VARCHAR(255) NOT NULL,
    `resumeFileName` VARCHAR(255) NOT NULL,
    `resumeContentType` VARCHAR(100) NOT NULL,
    `consentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `CareerApplication_createdAt_idx`(`createdAt`),
    INDEX `CareerApplication_fullName_idx`(`fullName`),
    INDEX `CareerApplication_email_idx`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
