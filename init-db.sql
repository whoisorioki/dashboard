-- Initialize Druid metadata database
CREATE DATABASE IF NOT EXISTS druid_metadata;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'druid_meta_user') THEN
        CREATE USER druid_meta_user WITH PASSWORD 'druid';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE druid_metadata TO druid_meta_user;
GRANT ALL ON SCHEMA public TO druid_meta_user;
