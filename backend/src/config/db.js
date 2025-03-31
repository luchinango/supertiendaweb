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
    host: 'localhost',
    database: 'tienda',
    password: 'Leo2007',
    port: 5433,
});

exports.default = pool;
