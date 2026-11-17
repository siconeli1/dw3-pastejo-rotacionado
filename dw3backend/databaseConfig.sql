-- arquivo: dw3backend/databaseConfig.sql

----- Cria um banco de dados
-- create database pastejo;

create table IF NOT EXISTS pasto (
    pastoid bigserial constraint pk_pasto PRIMARY KEY,
    descricao varchar(60) UNIQUE,
    areatotal numeric(10,2),
    removido boolean DEFAULT false
);

insert into pasto values
    (default, 'Pasto Sede', 25.50),
    (default, 'Pasto do Corrego', 40.00),
    (default, 'Pasto da Baixada', 18.75)
ON CONFLICT DO NOTHING;

create table IF NOT EXISTS piquete (
    piqueteid bigserial constraint pk_piquete PRIMARY KEY,
    descricao varchar(60) UNIQUE,
    latitude numeric(10,7),
    longitude numeric(10,7),
    pastoidfk bigint constraint fk_piquete_pasto REFERENCES pasto,
    removido boolean DEFAULT false
);

insert into piquete values
    (default, 'Piquete 01', -20.4237000, -49.9781000, (SELECT pastoid from pasto where descricao = 'Pasto Sede')),
    (default, 'Piquete 02', -20.4241000, -49.9775000, (SELECT pastoid from pasto where descricao = 'Pasto Sede')),
    (default, 'Piquete 03', -20.4302000, -49.9820000, (SELECT pastoid from pasto where descricao = 'Pasto do Corrego'))
ON CONFLICT DO NOTHING;

create table IF NOT EXISTS animal (
    animalid bigserial constraint pk_animal PRIMARY KEY,
    nome varchar(50) UNIQUE,
    datanasc date,
    removido boolean DEFAULT false
);

insert into animal values
    (default, 'Mimosa', '2021-03-15'),
    (default, 'Estrela', '2020-08-02'),
    (default, 'Malhada', '2022-01-20')
ON CONFLICT DO NOTHING;

-- Tabela resultante do relacionamento N:N entre animal e piquete
create table IF NOT EXISTS alocado (
    alocadoid bigserial constraint pk_alocado PRIMARY KEY,
    animalidifk bigint constraint fk_alocado_animal REFERENCES animal,
    piqueteidfk bigint constraint fk_alocado_piquete REFERENCES piquete,
    datainicio date,
    datafinal date,
    removido boolean DEFAULT false
);

insert into alocado values
    (default, (SELECT animalid from animal where nome = 'Mimosa'), (SELECT piqueteid from piquete where descricao = 'Piquete 01'), '2026-10-01', '2026-10-07'),
    (default, (SELECT animalid from animal where nome = 'Estrela'), (SELECT piqueteid from piquete where descricao = 'Piquete 02'), '2026-10-01', '2026-10-07');

-- Tabela de login
create table IF NOT EXISTS usuarios (
    usuarioid bigserial constraint pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE,
    password text,
    removido boolean DEFAULT false
);

CREATE EXTENSION if NOT EXISTS pgcrypto;

insert into usuarios values
    (default, 'admin', crypt('admin', gen_salt('bf'))), -- senha criptografada com bcrypt
    (default, 'qwe', crypt('qwe', gen_salt('bf'))) -- senha criptografada com bcrypt
ON CONFLICT DO NOTHING;
