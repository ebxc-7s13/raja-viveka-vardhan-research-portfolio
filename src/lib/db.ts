import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const DB_PATH = process.env.DATABASE_PATH || './data/portfolio.db';

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let _db: Database.Database | null = null;
let _seeded = false;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initializeSchema(_db);
    // Auto-seed if database is empty (first run on fresh deploy)
    if (!_seeded) {
      _seeded = true;
      try {
        const userCount = (_db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
        if (userCount === 0) {
          console.log('[db] Empty database detected — running seed...');
          execSync('npx tsx scripts/seed.ts', {
            cwd: process.cwd(),
            timeout: 30000,
            stdio: 'pipe',
          });
          // Re-open the database after seed (seed drops/recreates tables)
          _db.close();
          _db = new Database(DB_PATH);
          _db.pragma('journal_mode = WAL');
          _db.pragma('foreign_keys = ON');
          console.log('[db] Seed complete.');
        }
      } catch (e) {
        console.error('[db] Auto-seed failed:', e);
      }
    }
  }
  return _db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    -- Users table for admin authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Admin',
      role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin', 'editor')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Research themes / domains
    CREATE TABLE IF NOT EXISTS research_themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Research projects (full case-study format)
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      research_problem TEXT NOT NULL,
      motivation TEXT NOT NULL,
      approach TEXT NOT NULL,
      methodology TEXT,
      experimental_setup TEXT,
      hardware TEXT,
      data_acquisition TEXT,
      computational_method TEXT,
      results TEXT NOT NULL,
      key_contribution TEXT NOT NULL,
      status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'ongoing', 'under_review', 'filed')),
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      cover_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Publications
    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      journal TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('published', 'accepted', 'under_review', 'manuscript', 'preprint')),
      doi TEXT,
      abstract TEXT,
      research_area TEXT,
      pdf_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Patents
    CREATE TABLE IF NOT EXISTS patents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      inventors TEXT NOT NULL,
      applicant TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('granted', 'filed', 'pending', 'search_report')),
      description TEXT NOT NULL,
      innovation TEXT NOT NULL,
      research_area TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Thesis entries
    CREATE TABLE IF NOT EXISTS theses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      supervisor TEXT NOT NULL,
      year TEXT NOT NULL,
      research_problem TEXT NOT NULL,
      objective TEXT NOT NULL,
      methodology TEXT NOT NULL,
      key_contributions TEXT NOT NULL,
      results TEXT NOT NULL,
      conclusions TEXT,
      future_work TEXT,
      pdf_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Research timeline milestones
    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('education', 'research', 'publication', 'patent', 'project', 'startup', 'award')),
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Research notes / blog posts
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      cover_image TEXT,
      published INTEGER DEFAULT 0,
      author_id INTEGER REFERENCES users(id),
      category TEXT DEFAULT 'research_notes',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME
    );

    -- Contact form submissions
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit log for security tracking
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Rate limit tracking
    CREATE TABLE IF NOT EXISTS rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      window_start DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      token_hash TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revoked INTEGER DEFAULT 0
    );

    -- Project media (images, videos, figures)
    CREATE TABLE IF NOT EXISTS project_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK(media_type IN ('image', 'video', 'document')),
      caption TEXT,
      caption_title TEXT,
      section TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
    CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
    CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline(category);

    -- Site content management (editable text)
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(page, key)
    );
    CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);
  `);
}

// Graceful shutdown
process.on('exit', () => {
  if (_db) _db.close();
});
