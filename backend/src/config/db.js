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
