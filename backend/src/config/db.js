"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
/*const pool = new pg_1.Pool({
    user: 'postgres.kpqaazjeyzhczmxhtjyq',
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    database: 'postgres',
    password: 'SuperTienda2025',
    port: 6543,
});*/



const pool = new pg_1.Pool({
    user: 'postgres',
    host: '206.183.128.36',
    database: 'super_tienda',
    password: 'qgvTfRSMUerCtY4FqUNvDpuzBsH84D',
    port: 5217,
});

exports.default = pool;

/*
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O', 'U')),  -- M: Masculino, F: Femenino, O: Otro, U: No especificado
    birth_date DATE,
    email VARCHAR(100),
    address VARCHAR(100),
    mobile_phone VARCHAR(20),



    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        password_changed_at TIMESTAMP WITH TIME ZONE,
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        is_locked BOOLEAN DEFAULT FALSE,
        failed_login_attempts INTEGER DEFAULT 0,
        must_change_password BOOLEAN DEFAULT TRUE,
    );
    */