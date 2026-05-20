-- ============================================================
-- Brow Derma CMS — Schema Supabase
-- Exécuter une seule fois dans l'éditeur SQL de Supabase
-- ============================================================

-- Table des contenus (key-value store)
CREATE TABLE IF NOT EXISTS content (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  key         TEXT        UNIQUE NOT NULL,
  value       TEXT,
  type        TEXT        NOT NULL DEFAULT 'text', -- text | html | image | json | textarea
  section     TEXT        NOT NULL,
  label       TEXT        NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Lecture publique (site visible par tous)
CREATE POLICY "Public read" ON content
  FOR SELECT TO anon USING (true);

-- Écriture authentifiée uniquement
CREATE POLICY "Auth write" ON content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── STOCKAGE MÉDIAS ─────────────────────────────────────────
-- À faire manuellement dans Supabase > Storage :
-- 1. Créer un bucket nommé "media"
-- 2. Cocher "Public bucket"
-- 3. Ajouter la policy : INSERT pour "authenticated", SELECT pour "public"

-- ─── DONNÉES INITIALES ───────────────────────────────────────
INSERT INTO content (key, value, type, section, label) VALUES

-- SEO
('seo.title',          'Brow Derma – Maquillage Permanent Sourcils Hyères', 'text',     'seo',         'Titre de page'),
('seo.description',    'Studio de maquillage permanent sourcils à Hyères. Microblading, Powder Brows, Combo Brow — résultats naturels et sur-mesure par Brow Derma.', 'text', 'seo', 'Meta description'),
('seo.og_title',       'Brow Derma – Maquillage Permanent Sourcils Hyères', 'text',     'seo',         'OG Title (partage réseaux)'),
('seo.og_description', 'Studio spécialisé en microblading, powder brows et combo brow. Résultats naturels, élégants, sur-mesure.', 'text', 'seo', 'OG Description'),

-- Héro
('hero.eyebrow',      'Maquillage permanent sourcils', 'text', 'hero', 'Accroche (texte doré)'),
('hero.title',        'Des sourcils<br>naturels qui<br><em>subliment</em><br>votre regard', 'html', 'hero', 'Titre principal'),
('hero.subtitle',     'Microblading & sourcils poudrés pour restructurer, équilibrer et intensifier le regard avec élégance.', 'text', 'hero', 'Sous-titre'),
('hero.cta_primary',  'Prendre rendez-vous', 'text', 'hero', 'Bouton principal'),
('hero.badge_label',  'Tenue jusqu''à',      'text', 'hero', 'Badge — texte'),
('hero.badge_value',  '24 mois',             'text', 'hero', 'Badge — valeur'),

-- Intro
('intro.stat_number', '3',                   'text', 'intro', 'Chiffre clé'),
('intro.stat_label',  'techniques<br>disponibles', 'html', 'intro', 'Label du chiffre'),
('intro.quote',       'Chez Brow Derma, chaque sourcil est étudié en fonction de <em>votre visage, votre peau</em> et votre expression naturelle. L''objectif : apporter équilibre, définition et harmonie — sans jamais transformer.', 'html', 'intro', 'Citation'),

-- Prestations — Carte 1
('presta.1.tag',      'Technique manuelle',  'text', 'prestations', 'Carte 1 — Catégorie'),
('presta.1.name',     'Microblading',        'text', 'prestations', 'Carte 1 — Nom'),
('presta.1.subtitle', 'Des sourcils naturellement redessinés, poil à poil', 'text', 'prestations', 'Carte 1 — Sous-titre'),
('presta.1.desc',     'Technique de tatouage manuel d''origine asiatique. Recréer un effet poil à poil très naturel pour restructurer les sourcils avec un rendu discret et précis. Idéal pour combler les zones clairsemées ou redonner de la symétrie au regard.', 'textarea', 'prestations', 'Carte 1 — Description'),

-- Prestations — Carte 2
('presta.2.tag',      'Powder Brows',        'text', 'prestations', 'Carte 2 — Catégorie'),
('presta.2.name',     'Sourcils Poudrés',    'text', 'prestations', 'Carte 2 — Nom'),
('presta.2.subtitle', 'Un rendu doux et sophistiqué au quotidien', 'text', 'prestations', 'Carte 2 — Sous-titre'),
('presta.2.desc',     'Technique semi-permanente créant un effet poudré élégant. Idéale pour les peaux mixtes à grasses, les peaux matures ou celles qui souhaitent un effet légèrement maquillé — tout en restant naturel.', 'textarea', 'prestations', 'Carte 2 — Description'),

-- Prestations — Carte 3
('presta.3.tag',      'Technique mixte',     'text', 'prestations', 'Carte 3 — Catégorie'),
('presta.3.name',     'Combo Brow',          'text', 'prestations', 'Carte 3 — Nom'),
('presta.3.subtitle', 'L''équilibre parfait entre naturel et définition', 'text', 'prestations', 'Carte 3 — Sous-titre'),
('presta.3.desc',     'Associe la finesse du microblading à la technique du poudré — résultat naturel, structuré et plus intense. Entièrement personnalisé selon la morphologie du visage. Idéal pour les sourcils peu fournis.', 'textarea', 'prestations', 'Carte 3 — Description'),

-- Tarifs — Créations
('tarif.microblading.price',      '290', 'text', 'tarifs', 'Microblading — prix (€)'),
('tarif.powder.price',            '290', 'text', 'tarifs', 'Powder Brows — prix (€)'),
('tarif.combo.price',             '310', 'text', 'tarifs', 'Combo Brows — prix (€)'),

-- Tarifs — Retouches Microblading
('tarif.retouche.micro.6m',       '90',  'text', 'tarifs', 'Retouche Micro < 6 mois'),
('tarif.retouche.micro.12m',      '120', 'text', 'tarifs', 'Retouche Micro 6–12 mois'),
('tarif.retouche.micro.18m',      '150', 'text', 'tarifs', 'Retouche Micro 12–18 mois'),
('tarif.retouche.micro.18plus',   '180', 'text', 'tarifs', 'Retouche Micro > 18 mois'),

-- Tarifs — Retouches Powder Brows
('tarif.retouche.powder.12m',     '110', 'text', 'tarifs', 'Retouche Powder < 12 mois'),
('tarif.retouche.powder.18m',     '140', 'text', 'tarifs', 'Retouche Powder 12–18 mois'),
('tarif.retouche.powder.24m',     '170', 'text', 'tarifs', 'Retouche Powder 18–24 mois'),

-- Tarifs — Retouches Combo Brows
('tarif.retouche.combo.12m',      '120', 'text', 'tarifs', 'Retouche Combo < 12 mois'),
('tarif.retouche.combo.18m',      '150', 'text', 'tarifs', 'Retouche Combo 12–18 mois'),
('tarif.retouche.combo.24m',      '180', 'text', 'tarifs', 'Retouche Combo 18–24 mois'),

-- À propos
('apropos.text1', 'Passionnée par l''esthétique du regard et le travail du détail, j''ai créé Brow Derma avec une approche simple : <strong>sublimer sans transformer.</strong>', 'html', 'apropos', 'Paragraphe 1'),
('apropos.text2', 'Chaque visage est unique. C''est pourquoi je prends le temps d''étudier la morphologie, l''équilibre et l''expression naturelle avant chaque prestation. Mon objectif : des résultats élégants, harmonieux et adaptés à chaque femme.', 'text', 'apropos', 'Paragraphe 2'),

-- FAQ
('faq.items', '[{"q":"Est-ce douloureux ?","a":"La sensation reste très supportable pour la majorité des clientes."},{"q":"Le résultat reste-t-il très foncé ?","a":"Non. Après la cicatrisation, le résultat s''éclaircit naturellement d''environ 30 à 40 %. La retouche fixatrice permet ensuite d''harmoniser et stabiliser le résultat final."},{"q":"Peut-on faire un maquillage permanent en été ?","a":"Oui, à condition de respecter les consignes de cicatrisation et d''éviter soleil, piscine et mer pendant quelques jours."},{"q":"Combien de temps ça tient ?","a":"Microblading : 12 à 18 mois. Poudré : 18 à 24 mois. La tenue varie selon le type de peau et le mode de vie."},{"q":"Est-ce que cela peut faire tomber les poils ?","a":"Non. Le maquillage permanent n''empêche pas les poils naturels de pousser normalement."},{"q":"Est-ce adapté aux peaux matures ?","a":"Oui, notamment la technique poudrée qui offre souvent un très joli rendu sur les peaux matures et sèches."}]', 'json', 'faq', 'Questions / Réponses (JSON)'),

-- Contact
('contact.address',   '3 avenue Ernest Millet, 83400 Hyères', 'text', 'contact', 'Adresse'),
('contact.phone',     '06.95.93.76.52',                       'text', 'contact', 'Téléphone'),
('contact.email',     'browderma83@gmail.com',                 'text', 'contact', 'Email'),
('contact.instagram', '@brow_derma',                          'text', 'contact', 'Instagram')

ON CONFLICT (key) DO NOTHING;
