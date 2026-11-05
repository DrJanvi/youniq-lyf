ALTER TABLE `AboutUsPageSetting`
    MODIFY `whyChooseHeading` VARCHAR(255) NOT NULL DEFAULT 'WHY CHOOSE BUABED YOUNIQLYF?';

ALTER TABLE `ContactPageSetting`
    MODIFY `email` VARCHAR(190) NOT NULL DEFAULT 'info@buabedyouniqlyf.com',
    MODIFY `imageAlt` VARCHAR(255) NOT NULL DEFAULT 'Youniqlyf Perfumes location';
