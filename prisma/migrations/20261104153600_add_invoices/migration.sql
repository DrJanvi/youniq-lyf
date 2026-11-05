CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `sequence` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `recipientEmail` VARCHAR(190) NULL,
    `emailStatus` ENUM('PENDING', 'SENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `emailAttempts` INTEGER NOT NULL DEFAULT 0,
    `lastAttemptAt` DATETIME(3) NULL,
    `lastError` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invoice_sequence_key`(`sequence`),
    UNIQUE INDEX `Invoice_orderId_key`(`orderId`),
    INDEX `Invoice_emailStatus_lastAttemptAt_idx`(`emailStatus`, `lastAttemptAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Invoice_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
