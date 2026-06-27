-- Supabase SQL Schema setup for Wedding Guest App

-- 1. Create tables
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Seed default admin account
INSERT INTO admins (username, password) VALUES ('admin123', 'password123');

CREATE TABLE weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    host_username TEXT UNIQUE NOT NULL,
    host_password TEXT NOT NULL,
    khqr_img_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    companions INT DEFAULT 0,
    relation_type TEXT,
    amount NUMERIC DEFAULT 0,
    note TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup RLS (Row Level Security)
-- NOTE: Allowing full public access as requested for prototype purposes. 
-- In a real production app, RLS should be restricted properly using authenticated user roles.

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access on admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on weddings" ON weddings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on guests" ON guests FOR ALL USING (true) WITH CHECK (true);
