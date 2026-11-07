ALTER TABLE `Product`
    ADD COLUMN `shopify_id` VARCHAR(64) NULL;

CREATE UNIQUE INDEX `Product_shopify_id_key`
    ON `Product`(`shopify_id`);

ALTER TABLE `ProductVariant`
    ADD COLUMN `sku` VARCHAR(120) NULL;
