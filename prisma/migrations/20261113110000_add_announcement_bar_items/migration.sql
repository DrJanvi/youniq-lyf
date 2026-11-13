CREATE TABLE `AnnouncementBarItem` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `link` VARCHAR(1000) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `AnnouncementBarItem_deletedAt_sortOrder_idx`(`deletedAt`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `AnnouncementBarItem` (`id`, `message`, `sortOrder`, `updatedAt`)
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'Early Users Get 50% Off - Hurry up, Limited Time Offer!',
    0,
    CURRENT_TIMESTAMP(3)
);
