ALTER TABLE `ContactFaq`
ADD COLUMN `page` ENUM('CONTACT', 'FAQ_PAGE') NOT NULL DEFAULT 'FAQ_PAGE';

CREATE INDEX `ContactFaq_page_isActive_sortOrder_idx`
ON `ContactFaq`(`page`, `isActive`, `sortOrder`);
