
-- Seed all content entries with EN defaults plus FR and RU translations
-- Uses ON CONFLICT to be idempotent
INSERT INTO public.site_content (page, section, content_en, content_fr, content_ru) VALUES
  -- Home: Hero
  ('home', 'hero_title', 'Houses with a point of view', 'Des maisons avec un point de vue', 'Дома с характером'),
  ('home', 'hero_subtitle', 'A collection of distinctive homes across Europe, the Caucasus, and the Gulf.', 'Une collection de maisons d''exception à travers l''Europe, le Caucase et le Golfe.', 'Коллекция уникальных домов в Европе, на Кавказе и в Персидском заливе.'),
  -- Home: Collection
  ('home', 'collection_label', 'The Collection', 'La Collection', 'Коллекция'),
  ('home', 'collection_title', 'Each maison is selected for its character, its relationship to place.', 'Chaque maison est choisie pour son caractère, son lien au lieu.', 'Каждый дом выбран за свой характер и связь с местом.'),
  -- Home: Social Proof
  ('home', 'social_proof', 'across all properties · Superhost · Guest Favourite · 30+ five-star reviews', 'sur toutes les propriétés · Superhost · Favori des voyageurs · 30+ avis cinq étoiles', 'по всем объектам · Суперхозяин · Выбор гостей · 30+ пятизвёздочных отзывов'),
  -- Home: Philosophy
  ('home', 'philosophy_label', 'Philosophy', 'Philosophie', 'Философия'),
  ('home', 'philosophy_title', 'Not rentals. Residences.', 'Pas des locations. Des résidences.', 'Не аренда. Резиденции.'),
  ('home', 'philosophy_text', 'We don''t believe in vacation rentals. We believe in places that change how you see the world — houses that become part of your story, not just your itinerary.', 'Nous ne croyons pas aux locations de vacances. Nous croyons aux lieux qui changent votre regard — des maisons qui font partie de votre histoire, pas seulement de votre itinéraire.', 'Мы не верим в аренду на отпуск. Мы верим в места, которые меняют ваш взгляд на мир — дома, которые становятся частью вашей истории.'),
  ('home', 'philosophy_quote', 'Where houses become places.', 'Là où les maisons deviennent des lieux.', 'Где дома становятся местами.'),
  -- Home: Services
  ('home', 'services_label', 'Services', 'Services', 'Услуги'),
  ('home', 'services_title', 'Beyond hospitality', 'Au-delà de l''hospitalité', 'Больше, чем гостеприимство'),
  ('home', 'services_desc', 'We also partner with select property owners to bring their vision to life.', 'Nous accompagnons aussi des propriétaires sélectionnés pour donner vie à leur vision.', 'Мы также сотрудничаем с избранными владельцами, помогая воплотить их видение.'),
  ('home', 's1_title', 'Selection & Positioning', 'Sélection & Positionnement', 'Отбор и позиционирование'),
  ('home', 's1_desc', 'We identify properties with character and potential, transforming them into memorable destinations with narrative positioning and editorial storytelling.', 'Nous identifions des biens avec du caractère et du potentiel, les transformant en destinations mémorables grâce au positionnement narratif.', 'Мы находим объекты с характером и потенциалом, превращая их в запоминающиеся направления.'),
  ('home', 's2_title', 'Management', 'Gestion', 'Управление'),
  ('home', 's2_desc', 'Complete operational management: welcome, maintenance, guest screening, multilingual support in French, English, and Russian. Same-day response.', 'Gestion opérationnelle complète : accueil, maintenance, sélection des voyageurs, support multilingue. Réponse le jour même.', 'Полное операционное управление: встреча гостей, обслуживание, проверка, поддержка на трёх языках. Ответ в тот же день.'),
  ('home', 's3_title', 'Revenue', 'Revenus', 'Доходность'),
  ('home', 's3_desc', 'Intelligent pricing strategy, occupancy optimization focused on quality over volume. We position your property above the ordinary.', 'Stratégie tarifaire intelligente, optimisation du taux d''occupation axée sur la qualité. Nous positionnons votre bien au-dessus de l''ordinaire.', 'Умная ценовая стратегия, оптимизация загрузки с упором на качество. Мы позиционируем ваш объект выше обычного.'),
  ('home', 'services_link', 'Learn about our management services →', 'En savoir plus sur nos services de gestion →', 'Узнать о наших услугах управления →'),
  -- Home: About preview
  ('home', 'about_desc', 'Expatriate proprietors who returned to their roots to restore properties in places they know intimately. Not an agency. Not endless scaling. Just houses cared for properly.', 'Des propriétaires expatriés revenus à leurs racines pour restaurer des biens dans des lieux qu''ils connaissent intimement. Pas une agence. Juste des maisons bien gérées.', 'Владельцы-экспаты, вернувшиеся к корням, чтобы восстанавливать дома в местах, которые знают как свои пять пальцев.'),
  ('home', 'about_link', 'Read our story →', 'Lire notre histoire →', 'Читать нашу историю →'),
  -- Home: CTAs
  ('home', 'cta_discover', 'Discover the Collection', 'Découvrir la Collection', 'Открыть коллекцию'),
  ('home', 'cta_entrust', 'Entrust your property', 'Confier votre bien', 'Доверьте нам ваш объект'),
  ('home', 'travelers_label', 'For Travelers', 'Pour les voyageurs', 'Для путешественников'),
  ('home', 'travelers_title', 'Stay in homes with a point of view.', 'Séjournez dans des maisons avec un point de vue.', 'Остановитесь в домах с характером.'),
  ('home', 'travelers_desc', 'Few properties, high standards, real people behind every stay.', 'Peu de propriétés, des standards élevés, de vraies personnes derrière chaque séjour.', 'Мало объектов, высокие стандарты, реальные люди за каждым пребыванием.'),
  ('home', 'travelers_cta', 'Browse the collection', 'Voir la collection', 'Смотреть коллекцию'),
  ('home', 'owners_label', 'For Owners', 'Pour les propriétaires', 'Для владельцев'),
  ('home', 'owners_title', 'We don''t manage every property.', 'Nous ne gérons pas tous les biens.', 'Мы управляем не всеми объектами.'),
  ('home', 'owners_desc', 'Just the ones worth it. And if yours isn''t ready yet — we''ll get it there.', 'Seulement ceux qui en valent la peine. Et si le vôtre n''est pas prêt — on s''en charge.', 'Только теми, которые этого стоят. А если ваш ещё не готов — мы это исправим.'),
  ('home', 'owners_cta', 'Talk to us', 'Parlons-en', 'Поговорим'),
  -- About
  ('about', 'title', 'Darya & Mickaël', 'Darya & Mickaël', 'Дарья и Микаэль'),
  ('about', 'subtitle', 'About', 'À propos', 'О нас'),
  ('about', 'darya_p1', 'Darya is Franco-Russian, with deep local knowledge of both Brittany and the Caucasus. She brings trilingual fluency in French, English, and Russian — and with it, natural access to three distinct markets.', 'Darya est franco-russe, avec une connaissance intime de la Bretagne et du Caucase. Elle apporte une maîtrise trilingue du français, de l''anglais et du russe — et avec elle, un accès naturel à trois marchés distincts.', 'Дарья — франко-русская, с глубоким знанием Бретани и Кавказа. Она свободно владеет тремя языками — французским, английским и русским, что открывает доступ к трём рынкам.'),
  ('about', 'darya_p2', 'She handles the daily operations: welcome, maintenance, listening. Same-day response, always before 10am. Guests don''t interact with a platform. They interact with a person.', 'Elle gère les opérations quotidiennes : accueil, maintenance, écoute. Réponse le jour même, toujours avant 10h. Les voyageurs ne parlent pas à une plateforme. Ils parlent à une personne.', 'Она управляет ежедневными операциями: встреча, обслуживание, внимание. Ответ в тот же день, всегда до 10 утра. Гости общаются не с платформой, а с человеком.'),
  ('about', 'philosophy_title', 'Philosophy', 'Philosophie', 'Философия'),
  ('about', 'philosophy_p1', 'Not an agency. Not endless scaling. Just houses cared for properly.', 'Pas une agence. Pas de croissance infinie. Juste des maisons bien gérées.', 'Не агентство. Не бесконечный рост. Просто дома, о которых заботятся как следует.'),
  ('about', 'philosophy_p2', 'We are expatriate proprietors who returned to our roots to restore properties in places we know intimately. Every maison in our collection reflects a place we''ve lived, a landscape we''ve walked, a community we belong to.', 'Nous sommes des propriétaires expatriés revenus à nos racines pour restaurer des biens dans des lieux que nous connaissons intimement. Chaque maison reflète un lieu où nous avons vécu, un paysage que nous avons parcouru.', 'Мы — владельцы-экспаты, вернувшиеся к корням, чтобы восстанавливать дома в местах, которые знаем как свои пять пальцев. Каждый дом отражает место, где мы жили.'),
  ('about', 'locations_label', 'Where we are', 'Où nous sommes', 'Где мы находимся'),
  ('about', 'signature', '— Darya & Mickaël', '— Darya & Mickaël', '— Дарья и Микаэль'),
  -- Management
  ('management', 'hero_title', 'We started with our own homes.', 'Nous avons commencé par nos propres maisons.', 'Мы начали с собственных домов.'),
  ('management', 'hero_p1', 'A mountain duplex in the Caucasus. A stone house reimagined by architects in Brittany. A family townhouse in Dubai''s only net-zero community.', 'Un duplex de montagne dans le Caucase. Une maison en pierre réinventée par des architectes en Bretagne. Un townhouse familial dans la seule communauté net-zéro de Dubaï.', 'Горный дуплекс на Кавказе. Каменный дом, переосмысленный архитекторами в Бретани. Семейный таунхаус в единственном нулевом углеродном комплексе Дубая.'),
  ('management', 'hero_p2', 'We didn''t start as managers — we started as owners. We learned what it takes to earn five stars every time: the right photos, the right words, the right pricing, the right welcome. Now we bring that to a handful of other properties. Not an agency. Not a platform. Just us, doing for your home what we do for ours.', 'Nous n''avons pas commencé comme gestionnaires — mais comme propriétaires. Nous avons appris ce qu''il faut pour obtenir cinq étoiles à chaque fois. Maintenant, nous apportons cette expertise à quelques autres propriétés. Pas une agence. Pas une plateforme. Juste nous.', 'Мы начали не как управляющие — а как владельцы. Мы узнали, что нужно, чтобы каждый раз получать пять звёзд. Теперь мы делаем это для нескольких других объектов. Не агентство. Не платформа. Просто мы.'),
  ('management', 'whatwedo_title', 'What we do.', 'Ce que nous faisons.', 'Что мы делаем.'),
  ('management', 'step_1', 'We visit your property. We assess it honestly. Not every home makes it into the collection. We look for character, location, and something worth building on. If it''s not ready, we''ll tell you what it needs.', 'Nous visitons votre bien. Nous l''évaluons honnêtement. Chaque maison ne fait pas partie de la collection. Nous cherchons le caractère, l''emplacement, et quelque chose sur quoi construire.', 'Мы осматриваем ваш объект. Честно оцениваем. Не каждый дом попадает в коллекцию. Мы ищем характер, локацию и потенциал.'),
  ('management', 'step_2', 'We get it to the level. Styling, photography direction, the listing narrative, amenity upgrades if needed. We work with architects, designers, and photographers we trust.', 'Nous le mettons au niveau. Mise en scène, direction photo, narration de l''annonce, améliorations si nécessaire. Nous travaillons avec des architectes, designers et photographes de confiance.', 'Мы доводим его до уровня. Стилизация, фотосъёмка, текст объявления, улучшения при необходимости. Мы работаем с проверенными архитекторами, дизайнерами и фотографами.'),
  ('management', 'step_3', 'We handle everything. Pricing that adapts to demand, guest vetting, multilingual communication in French, English and Russian, check-in coordination, cleaning, maintenance, quality checks.', 'Nous gérons tout. Tarification adaptée à la demande, sélection des voyageurs, communication multilingue, coordination, ménage, maintenance, contrôle qualité.', 'Мы берём всё на себя. Цены, адаптированные к спросу, проверка гостей, многоязычная коммуникация, координация, уборка, обслуживание, контроль качества.'),
  ('management', 'proof_title', 'Our own track record.', 'Notre propre bilan.', 'Наш собственный послужной список.'),
  ('management', 'notready_title', 'Your property isn''t there yet?', 'Votre bien n''est pas encore prêt ?', 'Ваш объект ещё не готов?'),
  ('management', 'notready_subtitle', 'That''s why we''re here.', 'C''est pour ça qu''on est là.', 'Для этого мы и здесь.'),
  ('management', 'notready_p1', 'Not every home is ready on day one. Some need styling. Some need better photography. Some need a complete rethink of how guests experience the space.', 'Toutes les maisons ne sont pas prêtes dès le premier jour. Certaines ont besoin de mise en scène. D''autres de meilleures photos. D''autres d''une refonte complète.', 'Не каждый дом готов с первого дня. Некоторым нужна стилизация. Другим — лучшие фотографии. Третьим — полное переосмысление.'),
  ('management', 'notready_p2', 'We work with architects, interior designers, and photographers to bring properties up to the standard. From a weekend of staging to a full renovation — we scope it, manage it, and deliver it.', 'Nous travaillons avec des architectes, designers d''intérieur et photographes pour atteindre le standard. Du home staging à la rénovation complète — nous cadrons, gérons et livrons.', 'Мы работаем с архитекторами, дизайнерами интерьеров и фотографами. От стилизации за выходные до полной реновации — мы планируем, управляем и доставляем результат.'),
  ('management', 'contact_title', 'Let''s talk about your property.', 'Parlons de votre bien.', 'Давайте поговорим о вашем объекте.'),
  ('management', 'contact_desc', 'Tell us where it is and what you''re thinking. We''ll get back to you within 24 hours.', 'Dites-nous où il se trouve et ce que vous avez en tête. Nous vous répondrons sous 24 heures.', 'Расскажите, где он находится и что вы думаете. Мы ответим в течение 24 часов.'),
  ('management', 'contact_thanks', 'Thank you — we''ll be in touch within 24 hours.', 'Merci — nous vous contacterons sous 24 heures.', 'Спасибо — мы свяжемся с вами в течение 24 часов.'),
  ('management', 'faq_title', 'Questions.', 'Questions.', 'Вопросы.'),
  -- Contact
  ('contact', 'title', 'Get in Touch', 'Contactez-nous', 'Свяжитесь с нами'),
  ('contact', 'intro_text', '', '', '')
ON CONFLICT (page, section) DO UPDATE SET
  content_en = COALESCE(NULLIF(EXCLUDED.content_en, ''), site_content.content_en),
  content_fr = COALESCE(NULLIF(EXCLUDED.content_fr, ''), site_content.content_fr),
  content_ru = COALESCE(NULLIF(EXCLUDED.content_ru, ''), site_content.content_ru);
