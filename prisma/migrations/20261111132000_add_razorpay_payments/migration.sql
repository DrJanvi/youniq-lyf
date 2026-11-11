ALTER TABLE `Order`
    ADD COLUMN `paymentStatus` ENUM('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'NOT_REQUIRED';

UPDATE `Order`
SET `paymentStatus` = 'PENDING'
WHERE `paymentMethod` IN ('RAZORPAY', 'PAYU');

CREATE TABLE `RazorpayPaymentAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `razorpayOrderId` VARCHAR(64) NULL,
    `razorpayPaymentId` VARCHAR(64) NULL,
    `amount` BIGINT NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `status` ENUM('CREATING', 'CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED') NOT NULL DEFAULT 'CREATING',
    `failureCode` VARCHAR(100) NULL,
    `failureDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RazorpayPaymentAttempt_razorpayOrderId_key`(`razorpayOrderId`),
    UNIQUE INDEX `RazorpayPaymentAttempt_razorpayPaymentId_key`(`razorpayPaymentId`),
    INDEX `RazorpayPaymentAttempt_orderId_status_idx`(`orderId`, `status`),
    INDEX `RazorpayPaymentAttempt_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `RazorpayPaymentAttempt_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RazorpayWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(100) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RazorpayWebhookEvent_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
