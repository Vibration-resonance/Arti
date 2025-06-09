-- Script SQL pour créer la table si besoin et ajouter des domaines à la whitelist

create table if not exists whitelist_domains (
  id serial primary key,
  domain text not null unique
);

insert into whitelist_domains (domain) values
-- Google / Alphabet
('test-google.com'),
('google.com'),('google.fr'),('google.de'),('google.co.jp'),('google.com.br'),
('youtube.com'),
('gmail.com'),('drive.google.com'),('docs.google.com'),('sheets.google.com'),('slides.google.com'),
('play.google.com'),('cloud.google.com'),('search.google.com'),
('blogger.com'),('blogspot.com'),
('android.com'),('chrome.com'),('chromium.org'),
-- Microsoft
('microsoft.com'),('live.com'),('outlook.com'),('office.com'),
('bing.com'),('linkedin.com'),('github.com'),('azure.com'),('msn.com'),('xbox.com'),
-- Apple
('apple.com'),('icloud.com'),('itunes.com'),
-- Amazon
('amazon.com'),('amazon.fr'),('amazon.de'),('amazon.co.jp'),
('aws.amazon.com'),('twitch.tv'),('imdb.com'),
-- Oracle, IBM, Salesforce, Adobe
('oracle.com'),('ibm.com'),('salesforce.com'),('adobe.com'),
-- Netflix, Spotify
('netflix.com'),('spotify.com'),
-- Paypal, Ebay
('paypal.com'),('ebay.com'),('ebay.fr'),('ebay.de'),
-- Wordpress
('wordpress.com'),('wordpress.org'),
-- Tencent, Alibaba
('tencent.com'),('alibaba.com'),('aliexpress.com'),
-- Samsung, Sony
('samsung.com'),('sony.com'),
-- Organisations internationales
('un.org'),('unesco.org'),('unicef.org'),('who.int'),('worldbank.org'),('imf.org'),('europa.eu'),('oecd.org'),('wto.org'),('icrc.org'),('amnesty.org'),
-- Archives et éducation
('archive.org'),('coursera.org'),('edx.org'),('udacity.com'),('khanacademy.org'),
-- Banques internationales (exemples)
('hsbc.com'),('citigroup.com'),('jpmorganchase.com');

-- Pour les patrons (*.gov, *.edu, etc.), il faut gérer côté backend ou via une logique spécifique, car SQL ne gère pas les wildcards dans les valeurs de colonne.
