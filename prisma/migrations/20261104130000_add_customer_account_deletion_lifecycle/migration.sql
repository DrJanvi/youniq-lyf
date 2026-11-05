ALTER TABLE `User`
    ADD COLUMN `accountDeletionRequestedAt` DATETIME(3) NULL,
    ADD COLUMN `sessionVersion` INTEGER NOT NULL DEFAULT 0;
