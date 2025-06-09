-- Script SQL pour créer la table des patterns wildcard de whitelist

create table if not exists whitelist_domain_patterns (
  id serial primary key,
  pattern text not null unique
);

-- Exemples d'insertion de patterns wildcard
insert into whitelist_domain_patterns (pattern) values
('*.gov'),
('*.edu'),
('*.gouv.fr'),
('*.ac.uk'),
('*.gc.ca'),
('*.gov.uk'),
('*.go.jp'),
('*.bund.de'),
('*.gov.br'),
('*.gov.in'),
('*.uni-*.de'),
('*.ac.jp'),
-- Ajouts de patterns supplémentaires pour des domaines institutionnels, universitaires et gouvernementaux
('*.govt.*'),
('*.mil'),
('*.edu.au'),
('*.edu.cn'),
('*.edu.sg'),
('*.edu.hk'),
('*.edu.tw'),
('*.edu.tr'),
('*.ac.kr'),
('*.ac.nz'),
('*.ac.za'),
('*.ac.id'),
('*.ac.th'),
('*.ac.in'),
('*.sch.uk'),
('*.k12.*');
