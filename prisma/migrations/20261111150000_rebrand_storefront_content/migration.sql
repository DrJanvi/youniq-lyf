ALTER TABLE `HighlightedCategorySetting`
    MODIFY `buttonLink` VARCHAR(1000) NOT NULL DEFAULT '/products';

ALTER TABLE `ContactPageSetting`
    MODIFY `email` VARCHAR(190) NOT NULL DEFAULT 'youniqlyf@youniqlyf.ae',
    MODIFY `supportDescription` VARCHAR(500) NOT NULL DEFAULT 'For help with bags and accessories, order updates, and returns.',
    MODIFY `imageAlt` VARCHAR(255) NOT NULL DEFAULT 'Youniqlyf customer support';

ALTER TABLE `AboutUsPageSetting`
    MODIFY `principlesHeading` VARCHAR(255) NOT NULL DEFAULT 'Our approach to everyday style.',
    MODIFY `whoSubheading` VARCHAR(255) NOT NULL DEFAULT 'Bags and accessories to make your look your own',
    MODIFY `whoBadge` VARCHAR(120) NOT NULL DEFAULT 'STYLE YOUR WAY',
    MODIFY `legacyHeading` VARCHAR(255) NOT NULL DEFAULT 'BAGS & ACCESSORIES FOR YOUR EVERYDAY',
    MODIFY `whyChooseHeading` VARCHAR(255) NOT NULL DEFAULT 'WHY CHOOSE YOUNIQLYF?';

UPDATE `HighlightedCategorySetting`
SET `title` = 'Meet Your Next Youniq Bag'
WHERE `id` = 'home' AND `title` = 'A Scent That Leaves a Lasting Impression';

UPDATE `HighlightedCategorySetting`
SET `description` = 'Discover bags that bring together expressive style and everyday function.'
WHERE `id` = 'home' AND `description` = 'Eternal OUD is an exquisite fragrance created for those who appreciate the art of refined perfumery.';

UPDATE `HighlightedCategorySetting`
SET `buttonLink` = '/products'
WHERE `id` = 'home' AND `buttonLink` = '/category/fragrances';

UPDATE `HighlightedCategorySetting`
SET `image` = 'https://cdn.shopify.com/s/files/1/0686/7949/9934/files/7JA00026_6.jpg?v=1739871268'
WHERE `id` = 'home' AND `image` = 'https://i.ibb.co/Yw3fc76/highlight.webp';

UPDATE `ContactPageSetting`
SET `contactIntro` = 'Whether you need help choosing a Youniq bag or accessory or have a question about an order, our team is ready to assist.'
WHERE `id` = 'contact-us' AND `contactIntro` = 'Whether you need help choosing a fragrance or have a question about an order, our team is ready to assist.';

UPDATE `ContactPageSetting`
SET `email` = 'youniqlyf@youniqlyf.ae'
WHERE `id` = 'contact-us' AND `email` = 'info@buabedyouniqlyf.com';

UPDATE `ContactPageSetting`
SET `supportDescription` = 'For help with bags and accessories, order updates, and returns.'
WHERE `id` = 'contact-us' AND `supportDescription` = 'For product advice, order updates, returns, and wholesale enquiries.';

UPDATE `ContactPageSetting`
SET `imageAlt` = 'Youniqlyf customer support'
WHERE `id` = 'contact-us' AND `imageAlt` = 'Youniqlyf Perfumes location';

UPDATE `AboutUsPageSetting`
SET
    `heroHeading` = CASE
        WHEN REPLACE(`heroHeading`, CHAR(10), ' ') = 'THE ART OF FRAGRANCE, CRAFTED WITH PASSION'
        THEN 'STYLE THAT
MOVES WITH YOU'
        ELSE `heroHeading`
    END,
    `heroDescription` = CASE
        WHEN `heroDescription` = 'Discover timeless fragrances crafted with passion, quality, and modern elegance.'
        THEN 'Discover Youniq bags and Youniqlyf accessories designed to bring effortless style and everyday function to your wardrobe.'
        ELSE `heroDescription`
    END,
    `journeyHeading` = CASE
        WHEN `journeyHeading` = 'Our Journey' THEN 'Made for Your Every Day'
        ELSE `journeyHeading`
    END,
    `journeyDescription` = CASE
        WHEN `journeyDescription` = 'Decades of experience shaped by a steady commitment to fragrance, care and thoughtful development.'
        THEN 'Youniqlyf is about finding the pieces that make getting ready feel easy. Explore bags and accessories that bring personal style and useful details together.'
        ELSE `journeyDescription`
    END,
    `principlesHeading` = CASE
        WHEN `principlesHeading` = 'The principles behind every creation.'
        THEN 'Our approach to everyday style.'
        ELSE `principlesHeading`
    END,
    `whoSubheading` = CASE
        WHEN `whoSubheading` = 'Quality, Consistency, Creativity Beyond Expectations'
        THEN 'Bags and accessories to make your look your own'
        ELSE `whoSubheading`
    END,
    `whoParagraph1` = CASE
        WHEN `whoParagraph1` = 'Established in 1995 in Jebel Ali Free Zone, Buabed Youniqlyf Perfumes brings decades of fragrance expertise, combining the richness of Arabian, African, and European scents with modern innovation.'
        THEN 'Youniqlyf is a fashion brand for bags and accessories that bring a considered finishing touch to everyday dressing.'
        ELSE `whoParagraph1`
    END,
    `whoParagraph2` = CASE
        WHEN `whoParagraph2` = 'With manufacturing facilities in the UAE and Saudi Arabia, we specialize in perfumes, cosmetics, skincare, haircare, and personal care products, crafted to meet international quality standards.'
        THEN 'Explore Youniq bags and Youniqlyf accessories selected to balance personal style with the details you reach for throughout the day.'
        ELSE `whoParagraph2`
    END,
    `whoParagraph3` = CASE
        WHEN `whoParagraph3` = 'From signature fragrances to customized blends, every product is developed in-house with a commitment to quality, originality, and customer satisfaction.'
        THEN 'From everyday carry to the finishing touches, our collections are made to help you find pieces that work with your wardrobe and your routine.'
        ELSE `whoParagraph3`
    END,
    `whoParagraph4` = CASE
        WHEN `whoParagraph4` = 'Our strategic marketing is based on our hard work and persistence, making our production compete with international brands on originality, clean compositions, and affordable prices.'
        THEN 'We believe the right accessory should feel like you: easy to style, useful to carry, and ready for the moments that make up your day.'
        ELSE `whoParagraph4`
    END,
    `whoBadge` = CASE
        WHEN `whoBadge` = 'TRADITION REIMAGINED' THEN 'STYLE YOUR WAY'
        ELSE `whoBadge`
    END,
    `legacyHeading` = CASE
        WHEN `legacyHeading` = 'A LEGACY OF FRAGRANCE SINCE 1995'
        THEN 'BAGS & ACCESSORIES FOR YOUR EVERYDAY'
        ELSE `legacyHeading`
    END,
    `legacyIntro` = CASE
        WHEN `legacyIntro` = 'Established in 1995 in Jebel Ali Free Zone, Buabed Youniqlyf Perfumes was founded with a vision to create exceptional fragrances inspired by the richness of Arabian heritage and crafted to meet international quality standards.'
        THEN 'Youniqlyf brings together bags and accessories to help make everyday styling feel simple, expressive, and uniquely yours.'
        ELSE `legacyIntro`
    END,
    `legacyParagraph1` = CASE
        WHEN `legacyParagraph1` = 'With years of expertise in fragrance manufacturing, we have expanded our capabilities to include perfumes, cosmetics, skincare, haircare, personal care, and home fragrances. Our commitment to quality, innovation, and craftsmanship continues to shape every product we create.'
        THEN 'Find Youniq bags for the essentials you take along, and Youniqlyf accessories that add a personal touch to your look.'
        ELSE `legacyParagraph1`
    END,
    `legacyParagraph2` = CASE
        WHEN `legacyParagraph2` = 'Today, we continue to bring together traditional Arabian perfumery and modern manufacturing techniques to create distinctive fragrance experiences. From concept and development to production, our focus remains on quality, consistency, and delivering products that reflect our passion for perfumery.'
        THEN 'Whether you are getting ready for a busy day or planning a special occasion, explore versatile pieces that move with your plans.'
        ELSE `legacyParagraph2`
    END,
    `whyChooseHeading` = CASE
        WHEN `whyChooseHeading` = 'WHY CHOOSE BUABED YOUNIQLYF?'
        THEN 'WHY CHOOSE YOUNIQLYF?'
        ELSE `whyChooseHeading`
    END,
    `whyChooseDescription` = CASE
        WHEN `whyChooseDescription` = 'Discover a world where fragrance heritage meets everyday luxury. From captivating perfumes to thoughtfully crafted personal care essentials, every creation brings a distinctive touch to your daily rituals.'
        THEN 'Find Youniq bags and Youniqlyf accessories that bring together personal style, everyday use, and finishing touches for every occasion.'
        ELSE `whyChooseDescription`
    END,
    `milestone1Year` = CASE WHEN `milestone1Year` = '1995' THEN 'Everyday' ELSE `milestone1Year` END,
    `milestone1Title` = CASE WHEN `milestone1Title` = 'Established' THEN 'Made to Move' ELSE `milestone1Title` END,
    `milestone1Description` = CASE WHEN `milestone1Description` = 'Founded in Jebel Ali Free Zone.' THEN 'Explore bags and accessories for the rhythm of your day.' ELSE `milestone1Description` END,
    `milestone2Year` = CASE WHEN `milestone2Year` = '2003' THEN 'Versatile' ELSE `milestone2Year` END,
    `milestone2Title` = CASE WHEN `milestone2Title` = 'Manufacturing Expansion' THEN 'Easy to Style' ELSE `milestone2Title` END,
    `milestone2Description` = CASE WHEN `milestone2Description` = 'Expanded manufacturing into personal care products in Saudi Arabia.' THEN 'Find pieces that work with more of the looks you love.' ELSE `milestone2Description` END,
    `milestone3Year` = CASE WHEN `milestone3Year` = '500+' THEN 'Details' ELSE `milestone3Year` END,
    `milestone3Title` = CASE WHEN `milestone3Title` = 'Specialized Workforce' THEN 'The Finishing Touch' ELSE `milestone3Title` END,
    `milestone3Description` = CASE WHEN `milestone3Description` = 'A skilled team supporting production and product development.' THEN 'Discover accessories that bring your personal style together.' ELSE `milestone3Description` END,
    `milestone4Year` = CASE WHEN `milestone4Year` = 'Today' THEN 'Youniq' ELSE `milestone4Year` END,
    `milestone4Title` = CASE WHEN `milestone4Title` = 'Fragrance Varieties' THEN 'Make It Your Own' ELSE `milestone4Title` END,
    `milestone4Description` = CASE WHEN `milestone4Description` = 'A diverse fragrance portfolio inspired by tradition and modern trends.' THEN 'Choose the bags and accessories that feel like you.' ELSE `milestone4Description` END
WHERE `id` = 'about-us';

UPDATE `AboutUsPrinciple`
SET `description` = 'Bring together Youniq bags and accessories that help you carry what matters and express your own style.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Our Mission' AND `description` = 'To create exceptional fragrances and personal care products through quality, innovation, and craftsmanship, delivering distinctive experiences that exceed customer expectations.';

UPDATE `AboutUsPrinciple`
SET `description` = 'Make it easy to find accessories that feel personal, versatile, and ready to go wherever the day takes you.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Our Vision' AND `description` = 'We honor the raw beauty of Arabian ingredients, selecting every note with care and preserving the character that makes it unique.';

UPDATE `AboutUsPrinciple`
SET `description` = 'We value thoughtful details, easy-to-wear style, and a shopping experience that keeps you in control.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Our Values' AND `description` = 'We believe in uncompromising quality, creative excellence, integrity, and lasting customer relationships. Every fragrance reflects our commitment to consistency, originality, and trust.';

UPDATE `AboutUsLegacyStat`
SET `title` = 'Everyday Style'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Established';

UPDATE `AboutUsLegacyStat`
SET `title` = 'Useful Details'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Manufacturing Expansion';

UPDATE `AboutUsLegacyStat`
SET `title` = 'Versatile Picks'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Specialized Workforce';

UPDATE `AboutUsLegacyStat`
SET `title` = 'Youniq Collections'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Fragrance Varieties';

UPDATE `AboutUsWhyChooseCard`
SET `title` = 'Everyday Style',
    `description` = 'Discover bags and accessories that make it easy to add a little more of your personality to everyday outfits.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Decades Of Fragrance Expertise';

UPDATE `AboutUsWhyChooseCard`
SET `title` = 'Thoughtful Details',
    `description` = 'Explore useful details and versatile styles selected with the way you dress and carry your essentials in mind.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Quality Excellence';

UPDATE `AboutUsWhyChooseCard`
SET `title` = 'Bags for Every Plan',
    `description` = 'From daily routines to plans worth dressing up for, find a Youniq bag that fits the moment and your look.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'Crafted In-House';

UPDATE `AboutUsWhyChooseCard`
SET `title` = 'Accessorize Your Way',
    `description` = 'Make your style your own with Youniqlyf accessories that bring an outfit together, from the everyday to the occasional.'
WHERE `pageSettingId` = 'about-us' AND `title` = 'A World Of Fragrances';
