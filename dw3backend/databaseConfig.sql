-- Estrutura e dados iniciais do banco pastejo.
-- O PostgreSQL executa este arquivo na primeira criação do volume.

CREATE TABLE IF NOT EXISTS pasto (
    pastoid bigserial CONSTRAINT pk_pasto PRIMARY KEY,
    descricao varchar(60) UNIQUE,
    areatotal numeric(10,2),
    removido boolean DEFAULT false
);

INSERT INTO pasto (descricao, areatotal) VALUES
    ('Pasto Sede', 25.50),
    ('Pasto do Corrego', 40.00),
    ('Pasto da Baixada', 18.75)
ON CONFLICT (descricao) DO NOTHING;

CREATE TABLE IF NOT EXISTS piquete (
    piqueteid bigserial CONSTRAINT pk_piquete PRIMARY KEY,
    descricao varchar(60) UNIQUE,
    latitude numeric(10,7),
    longitude numeric(10,7),
    pastoidfk bigint CONSTRAINT fk_piquete_pasto REFERENCES pasto,
    removido boolean DEFAULT false
);

INSERT INTO piquete (descricao, latitude, longitude, pastoidfk) VALUES
    ('Piquete 01', -20.4237000, -49.9781000, (SELECT pastoid FROM pasto WHERE descricao = 'Pasto Sede')),
    ('Piquete 02', -20.4241000, -49.9775000, (SELECT pastoid FROM pasto WHERE descricao = 'Pasto Sede')),
    ('Piquete 03', -20.4302000, -49.9820000, (SELECT pastoid FROM pasto WHERE descricao = 'Pasto do Corrego'))
ON CONFLICT (descricao) DO NOTHING;

CREATE TABLE IF NOT EXISTS animal (
    animalid bigserial CONSTRAINT pk_animal PRIMARY KEY,
    nome varchar(50) UNIQUE,
    datanasc date,
    removido boolean DEFAULT false
);

INSERT INTO animal (nome, datanasc) VALUES
    ('Mimosa', '2021-03-15'),
    ('Estrela', '2020-08-02'),
    ('Malhada', '2022-01-20')
ON CONFLICT (nome) DO NOTHING;

-- Tabela resultante do relacionamento N:N entre animal e piquete.
CREATE TABLE IF NOT EXISTS alocado (
    alocadoid bigserial CONSTRAINT pk_alocado PRIMARY KEY,
    animalidifk bigint CONSTRAINT fk_alocado_animal REFERENCES animal,
    piqueteidfk bigint CONSTRAINT fk_alocado_piquete REFERENCES piquete,
    datainicio date,
    datafinal date,
    removido boolean DEFAULT false
);

INSERT INTO alocado (animalidifk, piqueteidfk, datainicio, datafinal) VALUES
    ((SELECT animalid FROM animal WHERE nome = 'Mimosa'), (SELECT piqueteid FROM piquete WHERE descricao = 'Piquete 01'), '2026-10-01', '2026-10-07'),
    ((SELECT animalid FROM animal WHERE nome = 'Estrela'), (SELECT piqueteid FROM piquete WHERE descricao = 'Piquete 02'), '2026-10-01', '2026-10-07');

CREATE TABLE IF NOT EXISTS usuarios (
    usuarioid bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE,
    password text,
    removido boolean DEFAULT false
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (username, password) VALUES
    ('admin', crypt('admin', gen_salt('bf'))),
    ('qwe', crypt('qwe', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;
