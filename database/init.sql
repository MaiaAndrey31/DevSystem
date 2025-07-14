-- Create links table if it doesn't exist
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_links_timestamp
AFTER UPDATE ON links
BEGIN
  UPDATE links SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
