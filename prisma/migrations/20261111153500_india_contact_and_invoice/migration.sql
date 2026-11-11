ALTER TABLE `ContactPageSetting`
    MODIFY `email` VARCHAR(190) NOT NULL DEFAULT 'support@youniqlyf.com',
    MODIFY `phone` VARCHAR(40) NOT NULL DEFAULT '+91 9871777077',
    MODIFY `whatsapp` VARCHAR(40) NULL DEFAULT '+91 9871777077';

UPDATE `ContactPageSetting`
SET `email` = 'support@youniqlyf.com'
WHERE `id` = 'contact-us'
  AND `email` IN ('info@buabedyouniqlyf.com', 'youniqlyf@youniqlyf.ae');

UPDATE `ContactPageSetting`
SET `phone` = '+91 9871777077'
WHERE `id` = 'contact-us'
  AND `phone` = '+966 12 627 4600';

UPDATE `ContactPageSetting`
SET `whatsapp` = '+91 9871777077'
WHERE `id` = 'contact-us'
  AND `whatsapp` = '+966 55 565 5711';
