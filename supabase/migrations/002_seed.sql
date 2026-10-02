insert into public.categories (name, slug, description) values
  ('Home & Kitchen','home-kitchen','Everyday pieces for the table and shelf'),
  ('Bags & Travel','bags-travel','Carry things well'),
  ('Tech Accessories','tech-accessories','Small upgrades for your desk'),
  ('Stationery','stationery','Notebooks, pens and paper')
on conflict (slug) do nothing;

with c as (select slug, id from public.categories)
insert into public.products (category_id, name, slug, description, price, image_url, stock_quantity, is_featured)
select c.id, v.name, v.slug, v.descr, v.price, 'https://picsum.photos/seed/' || v.slug || '/800/800', v.stock, v.feat
from (values
  ('home-kitchen','Stoneware Mug Set','stoneware-mug-set','Set of four hand-glazed 300 ml mugs. Dishwasher safe.',32.00,40,true),
  ('home-kitchen','Linen Tea Towels','linen-tea-towels','Pack of three stonewashed linen towels that soften with every wash.',18.50,60,false),
  ('home-kitchen','Cast Iron Skillet','cast-iron-skillet','26 cm pre-seasoned skillet for the stove, oven or open fire.',44.00,15,true),
  ('home-kitchen','Walnut Serving Board','walnut-serving-board','Solid walnut board finished with food-safe oil.',29.00,0,false),
  ('bags-travel','Canvas Weekender','canvas-weekender','Waxed canvas duffel with leather handles and a shoe pocket.',89.00,12,true),
  ('bags-travel','Packing Cube Trio','packing-cube-trio','Three lightweight cubes in S, M and L.',21.00,80,false),
  ('bags-travel','Everyday Backpack','everyday-backpack','20 L water-resistant pack with a padded 15" laptop sleeve.',64.00,25,true),
  ('tech-accessories','Aluminium Laptop Stand','aluminium-laptop-stand','Folding stand that lifts your screen to eye level.',38.00,30,false),
  ('tech-accessories','Braided USB-C Cable','braided-usb-c-cable','2 m, 100 W charging and fast data transfer.',14.00,150,false),
  ('tech-accessories','Desk Mat','desk-mat','Felt desk mat, 80 x 40 cm, with a non-slip base.',26.00,3,true),
  ('stationery','Dot-Grid Notebook','dot-grid-notebook','A5, 192 pages of 100 gsm paper that handles fountain pens.',12.00,200,false),
  ('stationery','Brass Pen','brass-pen','Refillable brass ballpoint that ages beautifully.',24.00,45,true)
) as v(cat, name, slug, descr, price, stock, feat)
join c on c.slug = v.cat
on conflict (slug) do nothing;
