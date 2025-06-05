"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var serverless_1 = require("@neondatabase/serverless");
var neon_http_1 = require("drizzle-orm/neon-http");
var schema = require("./schema");
var sql = (0, serverless_1.neon)(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
exports.db = (0, neon_http_1.drizzle)(sql, { schema: schema });
