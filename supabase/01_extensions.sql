-- 01_extensions.sql
-- Enable cryptographic functions for UUID generation
create extension if not exists "pgcrypto";
