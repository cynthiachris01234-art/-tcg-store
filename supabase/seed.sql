-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data — sample products for development
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO products (brand, language, product_type, set_name, set_code, slug, image_url, release_date, stock_quantity, market_price_usd, our_price_usd, pack_count, is_pre_order) VALUES

-- Pokémon EN
('pokemon','en','booster_box','Scarlet & Violet — Stellar Crown','SV7','pokemon-stellar-crown-en-box',
 'https://images.pokemontcg.io/sv7/logo.png','2024-09-13',15,144.99,101.49,36,false),
('pokemon','en','case','Scarlet & Violet — Stellar Crown Case','SV7-CASE','pokemon-stellar-crown-en-case',
 'https://images.pokemontcg.io/sv7/logo.png','2024-09-13',4,829.99,550.55,NULL,false),

-- Pokémon JP
('pokemon','jp','booster_box','Stellar Miracle','SV7JP','pokemon-stellar-miracle-jp-box',
 'https://images.pokemontcg.io/sv7/logo.png','2024-07-19',8,75.00,52.50,30,false),

-- Pokémon KR
('pokemon','kr','booster_box','별의 기적 (Stellar Miracle)','SV7KR','pokemon-stellar-miracle-kr-box',
 'https://images.pokemontcg.io/sv7/logo.png','2024-09-06',5,80.00,56.00,30,false),

-- One Piece EN
('onepiece','en','booster_box','Wings of the Captain','OP06','onepiece-wings-captain-en-box',
 'https://storage.googleapis.com/tcg-vault/onepiece-op06.png','2024-07-12',20,89.99,62.99,24,false),
('onepiece','en','booster_box','500 Years in the Future','OP07','onepiece-500-years-en-box',
 'https://storage.googleapis.com/tcg-vault/onepiece-op07.png','2024-10-25',0,99.99,69.99,24,true),

-- One Piece JP
('onepiece','jp','booster_box','500 Years in the Future','OP07JP','onepiece-500-years-jp-box',
 'https://storage.googleapis.com/tcg-vault/onepiece-op07.png','2024-09-28',12,44.00,30.80,24,false),

-- MTG EN
('mtg','en','booster_box','Bloomburrow Draft Booster Box','BLB','mtg-bloomburrow-draft-en-box',
 'https://cards.scryfall.io/art_crop/front/b/l/blb.jpg','2024-08-02',10,119.99,83.99,36,false),
('mtg','en','booster_box','Duskmourn: House of Horror Draft Booster Box','DSK','mtg-duskmourn-draft-en-box',
 'https://cards.scryfall.io/art_crop/front/d/s/dsk.jpg','2024-09-27',7,134.99,94.49,36,false),
('mtg','en','case','Bloomburrow Draft Booster Case','BLB-CASE','mtg-bloomburrow-draft-en-case',
 'https://cards.scryfall.io/art_crop/front/b/l/blb.jpg','2024-08-02',3,699.99,463.49,NULL,false),

-- MTG JP
('mtg','jp','booster_box','Bloomburrow Japanese Booster Box','BLB-JP','mtg-bloomburrow-jp-box',
 'https://cards.scryfall.io/art_crop/front/b/l/blb.jpg','2024-08-02',5,159.99,111.99,36,false),

-- Yu-Gi-Oh EN
('yugioh','en','booster_box','Phantom Nightmare Booster Box','PHNI','yugioh-phantom-nightmare-en-box',
 'https://ygoprodeck.com/pics/phni.jpg','2024-02-09',3,89.99,62.99,24,false),
('yugioh','en','booster_box','Rage of the Abyss','ROTA','yugioh-rage-abyss-en-box',
 'https://ygoprodeck.com/pics/rota.jpg','2024-10-24',0,99.99,69.99,24,true),

-- Yu-Gi-Oh JP
('yugioh','jp','booster_box','Rage of the Abyss JP','ROTA-JP','yugioh-rage-abyss-jp-box',
 'https://ygoprodeck.com/pics/rota.jpg','2024-09-28',10,42.00,29.40,30,false),

-- Yu-Gi-Oh KR
('yugioh','kr','booster_box','Phantom Nightmare KR','PHNI-KR','yugioh-phantom-nightmare-kr-box',
 'https://ygoprodeck.com/pics/phni.jpg','2024-04-12',6,55.00,38.50,24,false);

-- Sample deal
INSERT INTO deals (title, description, product_ids, extra_discount_percent, starts_at, ends_at, badge_label, is_active) VALUES
(
  'Autumn Bundle — Extra 10% Off Select Boxes',
  'Stack an additional 10% off on top of our base 30% below-market price on these select boxes.',
  ARRAY(SELECT id FROM products WHERE set_code IN ('SV7','BLB')),
  10,
  NOW(),
  NOW() + INTERVAL '14 days',
  '🍂 AUTUMN DEAL',
  true
);
