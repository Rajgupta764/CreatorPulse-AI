UPDATE users SET daily_limit = 10 WHERE daily_limit = 3;
UPDATE daily_usage SET count = 0 WHERE date = CURRENT_DATE;
