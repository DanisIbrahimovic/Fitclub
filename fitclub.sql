-- ============================================================
--  FitClub — Database creation script
--  Author  : Danis Ibrahimovic
--  Date    : 27.04.2026
--  Version : 1.2
--  DBMS    : PostgreSQL
-- ============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS activity_types;
DROP TABLE IF EXISTS objectives;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- TABLE : users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL          PRIMARY KEY,
    email           VARCHAR(320)    NOT NULL UNIQUE,
    password_hash   VARCHAR(60)    NOT NULL,
    role            VARCHAR(5)     NOT NULL DEFAULT 'user'
                        CHECK (role IN ('admin', 'user'))
);

-- ------------------------------------------------------------
-- TABLE : activity_types
-- ------------------------------------------------------------
CREATE TABLE activity_types (
    id      SERIAL          PRIMARY KEY,
    label   VARCHAR(25)    NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- TABLE : objectives
-- ------------------------------------------------------------
CREATE TABLE objectives (
    id      SERIAL          PRIMARY KEY,
    label   VARCHAR(20)    NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- TABLE : rooms
-- ------------------------------------------------------------
CREATE TABLE rooms (
    id      SERIAL          PRIMARY KEY,
    name    VARCHAR(10)    NOT NULL
);

INSERT INTO rooms (name) VALUES
    ('Salle A'),
    ('Salle B'),
    ('Salle C'),
    ('Salle D'),
    ('Salle E'),
    ('Salle F'),
    ('Salle G'),
    ('Salle H'),
    ('Salle I'),
    ('Salle J'),
    ('Salle K'),
    ('Salle L'),
    ('Salle M'),
    ('Salle N'),
    ('Salle O'),
    ('Salle P'),
    ('Salle Q'),
    ('Salle R'),
    ('Salle S'),
    ('Salle T'),
    ('Salle U'),
    ('Salle V'),
    ('Salle W'),
    ('Salle X'),
    ('Salle Y'),
    ('Salle Z');
-- ------------------------------------------------------------
-- TABLE : activities
-- ------------------------------------------------------------
CREATE TABLE activities (
    id                  SERIAL          PRIMARY KEY,
    title               VARCHAR(100)    NOT NULL UNIQUE,
    description         TEXT,
    duration_minutes    INTEGER         NOT NULL CHECK (duration_minutes > 0),
    intensity           SMALLINT        NOT NULL CHECK (intensity BETWEEN 1 AND 5),
    calories            INTEGER         CHECK (calories >= 0),
    photo               VARCHAR(100),
    activity_type_id    INTEGER         NOT NULL REFERENCES activity_types(id),
    objective_id        INTEGER         NOT NULL REFERENCES objectives(id)
);

-- ------------------------------------------------------------
-- TABLE : classes
-- ------------------------------------------------------------
CREATE TABLE classes (
    id              SERIAL      PRIMARY KEY,
    date_time       TIMESTAMP   NOT NULL,
    nb_places       INTEGER     NOT NULL CHECK (nb_places > 0),
    activity_id     INTEGER     NOT NULL REFERENCES activities(id),
    room_id         INTEGER     NOT NULL REFERENCES rooms(id)
);

-- ------------------------------------------------------------
-- JUNCTION TABLE : bookings
-- (users 0,N ---- 0,N classes via RESERVER)
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id              SERIAL      PRIMARY KEY,
    booking_date    TIMESTAMP   NOT NULL UNIQUE,
    user_id         INTEGER     NOT NULL REFERENCES users(id),
    class_id        INTEGER     NOT NULL REFERENCES classes(id)
);

-- ============================================================
--  Seed data
-- ============================================================

-- Activity types (from CDC)
INSERT INTO activity_types (label) VALUES
    ('Bien-être'),
    ('Cardio-training'),
    ('Cours aquatiques'),
    ('Cours de danse'),
    ('Renforcement musculaire');

-- Objectives (from CDC)
INSERT INTO objectives (label) VALUES
    ('Se muscler'),
    ('Perdre du poids'),
    ('Être en forme'),
    ('Se défouler'),
    ('Se détendre');
