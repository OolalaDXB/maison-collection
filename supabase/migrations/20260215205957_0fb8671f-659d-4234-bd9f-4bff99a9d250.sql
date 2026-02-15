INSERT INTO public.site_content (page, section, content_en, content_fr, content_ru) VALUES
  ('home', 'hero_title', 'Houses with a point of view', 'Des maisons avec un point de vue', 'Дома с характером'),
  ('home', 'hero_subtitle', 'A curated collection of distinctive properties across Europe and beyond.', 'Une collection de propriétés d''exception à travers l''Europe et au-delà.', 'Коллекция уникальных домов по всей Европе и за её пределами.'),
  ('home', 'services_label', 'Services', 'Services', 'Услуги'),
  ('home', 's1_title', 'Curated Selection', 'Sélection Rigoureuse', 'Тщательный отбор'),
  ('home', 's1_desc', 'Each property is personally selected for its architecture, location and character.', 'Chaque propriété est personnellement sélectionnée pour son architecture, son emplacement et son caractère.', 'Каждый объект лично отобран за архитектуру, расположение и характер.'),
  ('home', 's2_title', 'Personal Service', 'Service Personnel', 'Персональный сервис'),
  ('home', 's2_desc', 'Direct communication with the owners. Same-day response, always before 10am.', 'Communication directe avec les propriétaires. Réponse le jour même, toujours avant 10h.', 'Прямое общение с владельцами. Ответ в тот же день, всегда до 10 утра.'),
  ('home', 's3_title', 'Local Expertise', 'Expertise Locale', 'Местная экспертиза'),
  ('home', 's3_desc', 'Deep knowledge of each region. We live where our properties are.', 'Connaissance approfondie de chaque région. Nous vivons là où se trouvent nos propriétés.', 'Глубокое знание каждого региона. Мы живём там, где расположены наши дома.'),
  ('home', 'collection_label', 'Collection', 'Collection', 'Коллекция'),
  ('home', 'collection_title', 'Our Properties', 'Nos Propriétés', 'Наши объекты'),
  ('home', 'cta_discover', 'Discover', 'Découvrir', 'Открыть'),
  ('home', 'cta_entrust', 'Entrust Your Property', 'Confiez-nous votre bien', 'Доверьте нам свою недвижимость'),
  ('management', 'title', 'Property Management', 'Gestion Locative', 'Управление недвижимостью'),
  ('management', 'subtitle', 'We manage your property with the same care as if it were our own.', 'Nous gérons votre bien avec le même soin que s''il était le nôtre.', 'Мы управляем вашей недвижимостью с такой же заботой, как своей собственной.'),
  ('about', 'title', 'Darya & Mickaël', 'Darya & Mickaël', 'Дарья и Микаэль'),
  ('about', 'subtitle', 'About', 'À propos', 'О нас'),
  ('contact', 'title', 'Get in Touch', 'Contactez-nous', 'Свяжитесь с нами')
ON CONFLICT (page, section) DO UPDATE SET
  content_en = COALESCE(EXCLUDED.content_en, site_content.content_en),
  content_fr = COALESCE(EXCLUDED.content_fr, site_content.content_fr),
  content_ru = COALESCE(EXCLUDED.content_ru, site_content.content_ru);