-- Database schema for Portfolio Admin Authentication
-- PostgreSQL / Neon Database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create user sessions table (for JWT tracking and revocation)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_jti VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Note: You can set up a cron job in Neon to run this function periodically
-- For example, run daily: SELECT cleanup_expired_sessions();

COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON TABLE user_sessions IS 'Tracks active JWT sessions for revocation capability';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role: admin, viewer, etc.';
COMMENT ON COLUMN user_sessions.token_jti IS 'JWT ID (jti claim) for token tracking';

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Create visitor sessions table (for portfolio visitors, not admin users)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Device & Browser info
  user_agent TEXT,
  is_mobile BOOLEAN DEFAULT false,
  is_desktop BOOLEAN DEFAULT true,
  browser VARCHAR(50),
  os VARCHAR(50),
  device_type VARCHAR(20), -- mobile, tablet, desktop
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- Geographic data
  ip_address VARCHAR(45),
  country VARCHAR(100),
  country_code VARCHAR(2),
  city VARCHAR(100),
  region VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Session timing
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER, -- calculated when session ends
  
  -- Referrer info
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Flags
  blocked_mobile BOOLEAN DEFAULT false, -- true if tried to access from mobile but was blocked
  viewed_about_me BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
  
  -- Page info
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  
  -- Timing
  view_duration_seconds INTEGER, -- how long they stayed on the page
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table (for tracking specific interactions)
CREATE TABLE IF NOT EXISTS visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'canvas_load', 'photo_loaded', 'about_me_opened', 'photo_clicked', etc.
  event_category VARCHAR(50), -- 'engagement', 'performance', 'navigation'
  event_label VARCHAR(255),
  event_value NUMERIC(10, 2), -- for numeric values like load time in ms
  
  -- Additional context (JSON for flexibility)
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,
  
  -- Load performance
  page_load_time_ms INTEGER,
  canvas_init_time_ms INTEGER,
  first_photo_load_time_ms INTEGER,
  avg_photo_load_time_ms INTEGER,
  total_photos_loaded INTEGER,
  
  -- Network info
  connection_type VARCHAR(50), -- '4g', 'wifi', etc.
  connection_effective_type VARCHAR(20), -- 'slow-2g', '2g', '3g', '4g'
  
  measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create daily aggregated stats (for faster dashboard queries)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  
  -- Visitor counts
  total_sessions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  mobile_blocked_count INTEGER DEFAULT 0,
  desktop_visitors INTEGER DEFAULT 0,
  
  -- Engagement
  about_me_opens INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  
  -- Performance
  avg_page_load_time_ms INTEGER DEFAULT 0,
  avg_photo_load_time_ms INTEGER DEFAULT 0,
  
  -- Geographic (top 5 countries stored as JSONB)
  top_countries JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started_at ON visitor_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country_code ON visitor_sessions(country_code);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_is_mobile ON visitor_sessions(is_mobile);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_blocked_mobile ON visitor_sessions(blocked_mobile);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_measured_at ON performance_metrics(measured_at);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date);

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(target_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (
    stat_date,
    total_sessions,
    unique_visitors,
    mobile_blocked_count,
    desktop_visitors,
    about_me_opens,
    avg_session_duration_seconds,
    total_page_views,
    avg_page_load_time_ms,
    avg_photo_load_time_ms,
    top_countries
  )
  SELECT
    target_date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT session_id) as unique_visitors,
    SUM(CASE WHEN blocked_mobile THEN 1 ELSE 0 END) as mobile_blocked_count,
    SUM(CASE WHEN is_desktop THEN 1 ELSE 0 END) as desktop_visitors,
    SUM(CASE WHEN viewed_about_me THEN 1 ELSE 0 END) as about_me_opens,
    AVG(duration_seconds)::INTEGER as avg_session_duration_seconds,
    (SELECT COUNT(*) FROM page_views pv 
     JOIN visitor_sessions vs ON pv.session_id = vs.id 
     WHERE DATE(pv.viewed_at) = target_date) as total_page_views,
    (SELECT AVG(page_load_time_ms)::INTEGER FROM performance_metrics pm
     JOIN visitor_sessions vs ON pm.session_id = vs.id
     WHERE DATE(pm.measured_at) = target_date) as avg_page_load_time_ms,
    (SELECT AVG(avg_photo_load_time_ms)::INTEGER FROM performance_metrics pm
     JOIN visitor_sessions vs ON pm.session_id = vs.id
     WHERE DATE(pm.measured_at) = target_date) as avg_photo_load_time_ms,
    (SELECT jsonb_agg(country_stats)
     FROM (
       SELECT jsonb_build_object('country', country, 'count', COUNT(*)) as country_stats
       FROM visitor_sessions
       WHERE DATE(started_at) = target_date AND country IS NOT NULL
       GROUP BY country
       ORDER BY COUNT(*) DESC
       LIMIT 5
     ) top_countries_query) as top_countries
  FROM visitor_sessions
  WHERE DATE(started_at) = target_date
  ON CONFLICT (stat_date) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    unique_visitors = EXCLUDED.unique_visitors,
    mobile_blocked_count = EXCLUDED.mobile_blocked_count,
    desktop_visitors = EXCLUDED.desktop_visitors,
    about_me_opens = EXCLUDED.about_me_opens,
    avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
    total_page_views = EXCLUDED.total_page_views,
    avg_page_load_time_ms = EXCLUDED.avg_page_load_time_ms,
    avg_photo_load_time_ms = EXCLUDED.avg_photo_load_time_ms,
    top_countries = EXCLUDED.top_countries,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

COMMENT ON TABLE visitor_sessions IS 'Tracks portfolio visitor sessions with device, geo, and timing data';
COMMENT ON TABLE page_views IS 'Records individual page views within visitor sessions';
COMMENT ON TABLE visitor_events IS 'Captures specific user interactions and events';
COMMENT ON TABLE performance_metrics IS 'Stores performance measurements for visitor sessions';
COMMENT ON TABLE daily_stats IS 'Aggregated daily statistics for fast dashboard queries';
