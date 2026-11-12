ALTER TABLE `LoginCode`
    ADD COLUMN `purpose` ENUM('REGISTRATION', 'PASSWORD_RESET') NOT NULL DEFAULT 'REGISTRATION';

DROP INDEX `LoginCode_email_createdAt_idx` ON `LoginCode`;

CREATE INDEX `LoginCode_email_purpose_createdAt_idx`
    ON `LoginCode`(`email`, `purpose`, `createdAt`);
