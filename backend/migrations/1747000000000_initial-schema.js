/**
 * Migration: 001 — Initial Schema
 * Membuat semua tabel sesuai DrawSQL diagram
 */

export const up = (pgm) => {
  // ── 1. Users ──────────────────────────────────────────────
  pgm.createTable('Users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    full_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'varchar(255)',
      notNull: true,
    },
    avatar_url: {
      type: 'varchar(500)',
    },
    is_verified: {          
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // ── 2. CV_uploads ─────────────────────────────────────────
  pgm.createTable('CV_uploads', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    users_id: {
      type: 'uuid',
      notNull: true,
      references: '"Users"(id)',
      onDelete: 'CASCADE',
    },
    filename: {
      type: 'varchar(500)',
      notNull: true,
    },
    file_url: {
      type: 'varchar(1000)',
      notNull: true,
    },
    uploaded_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // ── 3. CV_Analysis ────────────────────────────────────────
  pgm.createTable('CV_Analysis', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    CV_upload_id: {
      type: 'uuid',
      notNull: true,
      references: '"CV_uploads"(id)',
      onDelete: 'CASCADE',
    },
    Skills: {
      type: 'jsonb',
      default: pgm.func("'{}'::jsonb"),
    },
    analyzes_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // ── 4. Skills ─────────────────────────────────────────────
  pgm.createTable('Skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    Skill_name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
  });

  // ── 5. Job_listings ───────────────────────────────────────
  pgm.createTable('Job_listings', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    Job: {
      type: 'varchar(255)',
    },
    Min_Salary: {
      type: 'integer',
    },
    Max_Salary: {
      type: 'integer',
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // ── 6. Job_Skills ─────────────────────────────────────────
  pgm.createTable('Job_Skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    Job_listing_id: {
      type: 'uuid',
      notNull: true,
      references: '"Job_listings"(id)',
      onDelete: 'CASCADE',
    },
    Skills_id: {
      type: 'uuid',
      notNull: true,
      references: '"Skills"(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('Job_Skills', 'unique_job_skill', 'UNIQUE ("Job_listing_id", "Skills_id")');

  // ── 7. Career_Matches ─────────────────────────────────────
  pgm.createTable('Career_Matches', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    CV_analysis_id: {
      type: 'uuid',
      notNull: true,
      references: '"CV_Analysis"(id)',
      onDelete: 'CASCADE',
    },
    Job_listing_id: {
      type: 'uuid',
      references: '"Job_listings"(id)',
      onDelete: 'SET NULL',
    },
    Predicted_career: {
      type: 'varchar(255)',
    },
    Match_percentage: {
      type: 'float',
    },
    Matched_Skills: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    Skill_gaps: {
      type: 'jsonb',
      default: pgm.func("'[]'::jsonb"),
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func('NOW()'),
    },
  });

  // ── Indexes ───────────────────────────────────────────────
  pgm.createIndex('CV_uploads',     'users_id',       { name: 'idx_cv_uploads_users_id' });
  pgm.createIndex('CV_Analysis',    'CV_upload_id',   { name: 'idx_cv_analysis_upload_id' });
  pgm.createIndex('Career_Matches', 'CV_analysis_id', { name: 'idx_career_matches_analysis' });
  pgm.createIndex('Career_Matches', 'Job_listing_id', { name: 'idx_career_matches_job' });
  pgm.createIndex('Job_Skills',     'Job_listing_id', { name: 'idx_job_skills_job' });
  pgm.createIndex('Job_Skills',     'Skills_id',      { name: 'idx_job_skills_skill' });
  pgm.createIndex('Users',          'email',          { name: 'idx_users_email' });

  // ── Trigger: auto-update Users.updated_at ─────────────────
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_users_updated_at
      BEFORE UPDATE ON "Users"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

export const down = (pgm) => {
  // Drop in reverse order (respect FK constraints)
  pgm.sql(`DROP TRIGGER IF EXISTS set_users_updated_at ON "Users"`);
  pgm.sql(`DROP FUNCTION IF EXISTS update_updated_at_column`);

  pgm.dropTable('Career_Matches', { ifExists: true });
  pgm.dropTable('Job_Skills',     { ifExists: true });
  pgm.dropTable('Job_listings',   { ifExists: true });
  pgm.dropTable('Skills',         { ifExists: true });
  pgm.dropTable('CV_Analysis',    { ifExists: true });
  pgm.dropTable('CV_uploads',     { ifExists: true });
  pgm.dropTable('Users',          { ifExists: true });
};
