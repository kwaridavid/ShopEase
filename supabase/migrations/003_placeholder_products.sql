-- Extra demo catalogue so test users can browse, filter, hit low-stock and out-of-stock states.
-- Safe to re-run: existing slugs are skipped. Run AFTER 001 and 002.
insert into public.categories (name, slug, description) values
  ('Outdoors & Fitness','outdoors-fitness','Gear for moving around outside'),
  ('Personal Care','personal-care','Simple, everyday essentials')
on conflict (slug) do nothing;

with c as (select slug, id from public.categories)
insert into public.products (category_id, name, slug, description, price, image_url, stock_quantity, is_featured)
select c.id, v.name, v.slug, v.descr, v.price, 'https://picsum.photos/seed/' || v.slug || '/800/800', v.stock, v.feat
from (values
  ('home-kitchen','Ceramic Pour-Over Set','ceramic-pour-over-set','Dripper, server and two cups for a slow morning coffee.',46.00,22,true),
  ('home-kitchen','Glass Storage Jars','glass-storage-jars','Set of six airtight jars with bamboo lids.',27.50,70,false),
  ('home-kitchen','Soy Wax Candle','soy-wax-candle','40-hour candle in a reusable glass tumbler.',19.00,5,false),
  ('bags-travel','Leather Passport Wallet','leather-passport-wallet','Vegetable-tanned leather with card slots and a pen loop.',35.00,34,false),
  ('bags-travel','Insulated Water Bottle','insulated-water-bottle','750 ml steel bottle, cold for 24 hours, hot for 12.',28.00,90,true),
  ('bags-travel','Travel Neck Pillow','travel-neck-pillow','Memory foam pillow with a washable cover.',22.00,0,false),
  ('tech-accessories','Wireless Charging Pad','wireless-charging-pad','15 W Qi pad with a non-slip surface.',31.00,48,true),
  ('tech-accessories','Bluetooth Speaker','bluetooth-speaker','Pocket speaker with 12 hours of playtime and a splash-proof body.',59.00,18,true),
  ('tech-accessories','Cable Organiser Box','cable-organiser-box','Hides power strips and tidies loose cables.',17.00,4,false),
  ('stationery','Pencil Set of 12','pencil-set-of-12','Graphite pencils in mixed hardness, in a tin.',9.50,120,false),
  ('stationery','Weekly Planner','weekly-planner','Undated desk planner with 52 tear-off sheets.',15.00,75,false),
  ('stationery','Watercolour Travel Kit','watercolour-travel-kit','Twelve pans, a water brush and a small pad.',33.00,26,true),
  ('outdoors-fitness','Yoga Mat','yoga-mat','6 mm non-slip mat with a carry strap.',36.00,40,true),
  ('outdoors-fitness','Resistance Band Set','resistance-band-set','Five bands from light to extra heavy, with a pouch.',16.00,100,false),
  ('outdoors-fitness','Trail Daypack','trail-daypack','18 L pack with a hydration sleeve and rain cover.',72.00,14,false),
  ('outdoors-fitness','Camping Mug','camping-mug','Enamel mug with a folding handle.',11.00,2,false),
  ('personal-care','Shea Hand Cream','shea-hand-cream','75 ml, fragrance-free, absorbs quickly.',8.50,130,false),
  ('personal-care','Bamboo Toothbrush Pack','bamboo-toothbrush-pack','Pack of four soft-bristle brushes.',7.00,160,false),
  ('personal-care','Natural Soap Bars','natural-soap-bars','Three cold-process bars: oat, lavender and cedar.',13.00,55,true),
  ('personal-care','Beard Care Kit','beard-care-kit','Oil, balm and a wooden comb in a gift box.',29.00,0,false)
) as v(cat, name, slug, descr, price, stock, feat)
join c on c.slug = v.cat
on conflict (slug) do nothing;
