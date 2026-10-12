-- Run this SQL against your coconut_db MySQL database
-- Adds email verification columns to the users table

ALTER TABLE users
    ADD COLUMN email_verification_token VARCHAR(255) NULL,
    ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0;
