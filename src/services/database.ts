/**
 * Leimarembi Foundation Mobile Application - SQLite Database Service
 * 
 * Provides production-ready, high-performance offline persistence for:
 * 1. User Profiles & Authentication Sessions
 * 2. Cached Official Executive & Committee Directory (15 Members)
 * 3. Offline Donations & Tax-Exemption Receipts
 * 4. Welfare Schemes & Student Grants Catalog
 * 5. App Settings (Theme, Language, Biometric Preferences)
 * 6. Audit & Activity Logs
 */

import { Platform } from 'react-native';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  is_senior_citizen?: number;
  family_members_count?: number;
  membership_no?: string;
  role?: string;
  designation?: string;
  password_hash?: string;
  auth_provider?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CachedMember {
  id: string;
  name: string;
  designation: string;
  role: string;
  phone: string;
  email: string;
  blood_group: string;
  is_senior_citizen: number;
  category: string;
  order_index: number;
}

export interface DonationRecord {
  id: string;
  donor_name: string;
  donor_phone?: string;
  donor_email?: string;
  amount: number;
  purpose?: string;
  payment_mode?: string;
  reference_id?: string;
  receipt_number?: string;
  created_at?: string;
  synced?: number;
}

export interface ActivityLog {
  id?: number;
  type: string;
  user_identifier?: string;
  details: string;
  timestamp: string;
}

const OFFICIAL_MEMBERS_SEED: CachedMember[] = [
  { id: 'LF-EXEC-001', name: 'M. Tombi Babu Singha', designation: 'President', role: 'ADMIN', phone: '9864012345', email: 'tombi.singha@leimarembifoundation.org', blood_group: 'O+', is_senior_citizen: 1, category: 'Executive', order_index: 1 },
  { id: 'LF-EXEC-002', name: 'K. Khogendra Singha', designation: 'Vice-Chairman', role: 'ADMIN', phone: '9864023456', email: 'khogendra.singha@leimarembifoundation.org', blood_group: 'B+', is_senior_citizen: 1, category: 'Executive', order_index: 2 },
  { id: 'LF-EXEC-003', name: 'L. Bira Babu Singha', designation: 'Managing Director', role: 'ADMIN', phone: '9864034567', email: 'birababu.singha@leimarembifoundation.org', blood_group: 'A+', is_senior_citizen: 1, category: 'Executive', order_index: 3 },
  { id: 'LF-EXEC-004', name: 'M. Bina Babu Singha', designation: 'Super Administrator & Founder', role: 'SUPER_ADMIN', phone: '7637087931', email: 'binababu.singha@yahoo.com', blood_group: 'AB+', is_senior_citizen: 1, category: 'Executive', order_index: 4 },
  { id: 'LF-EXEC-005', name: 'M. Nilamani Singha', designation: 'General Secretary', role: 'ADMIN', phone: '9864056789', email: 'nilamani.singha@leimarembifoundation.org', blood_group: 'O+', is_senior_citizen: 0, category: 'Executive', order_index: 5 },
  { id: 'LF-EXEC-006', name: 'M. Babu Singha', designation: 'Joint Secretary', role: 'ADMIN', phone: '9864067890', email: 'babu.singha@leimarembifoundation.org', blood_group: 'B+', is_senior_citizen: 0, category: 'Executive', order_index: 6 },
  { id: 'LF-EXEC-007', name: 'K. Brojendro Singha', designation: 'Treasurer', role: 'ADMIN', phone: '9864078901', email: 'brojendro.singha@leimarembifoundation.org', blood_group: 'A+', is_senior_citizen: 0, category: 'Executive', order_index: 7 },
  { id: 'LF-EXEC-008', name: 'M. Mangi Babu Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864089012', email: 'mangi.singha@leimarembifoundation.org', blood_group: 'AB+', is_senior_citizen: 1, category: 'Committee', order_index: 8 },
  { id: 'LF-EXEC-009', name: 'K. Mani Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864090123', email: 'mani.singha@leimarembifoundation.org', blood_group: 'O-', is_senior_citizen: 1, category: 'Committee', order_index: 9 },
  { id: 'LF-EXEC-010', name: 'K. Sarat Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864101234', email: 'sarat.singha@leimarembifoundation.org', blood_group: 'B-', is_senior_citizen: 0, category: 'Committee', order_index: 10 },
  { id: 'LF-EXEC-011', name: 'L. Mohan Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864112345', email: 'mohan.singha@leimarembifoundation.org', blood_group: 'A-', is_senior_citizen: 0, category: 'Committee', order_index: 11 },
  { id: 'LF-EXEC-012', name: 'L. Ibohal Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864123456', email: 'ibohal.singha@leimarembifoundation.org', blood_group: 'O+', is_senior_citizen: 1, category: 'Committee', order_index: 12 },
  { id: 'LF-EXEC-013', name: 'S. Goura Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864134567', email: 'goura.singha@leimarembifoundation.org', blood_group: 'B+', is_senior_citizen: 0, category: 'Committee', order_index: 13 },
  { id: 'LF-EXEC-014', name: 'M. Brajamani Singha', designation: 'Executive Member', role: 'MEMBER', phone: '9864145678', email: 'brajamani.singha@leimarembifoundation.org', blood_group: 'AB-', is_senior_citizen: 1, category: 'Committee', order_index: 14 },
  { id: 'LF-SA-001', name: 'Aryaman Singha', designation: 'IT Director & Super Admin', role: 'SUPER_ADMIN', phone: '7099659804', email: 'aryamansingha60@gmail.com', blood_group: 'A+', is_senior_citizen: 0, category: 'SuperAdmin', order_index: 15 },
];

let dbInstance: any = null;

function getDatabase() {
  if (dbInstance) return dbInstance;
  if (Platform.OS === 'web') return null;

  try {
    const SQLite = require('expo-sqlite');
    if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
      dbInstance = SQLite.openDatabaseSync('leimarembi_foundation.db');
      return dbInstance;
    }
  } catch (err) {
    console.warn('[SQLite] openDatabaseSync error, falling back:', err);
  }
  return null;
}

/**
 * Initialize all SQLite tables and seed default official committee directory
 */
export function initDatabase(): boolean {
  const db = getDatabase();
  if (!db) return false;

  try {
    // 1. Users Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        blood_group TEXT,
        is_senior_citizen INTEGER DEFAULT 0,
        family_members_count INTEGER DEFAULT 1,
        membership_no TEXT UNIQUE,
        role TEXT DEFAULT 'MEMBER',
        designation TEXT,
        password_hash TEXT,
        auth_provider TEXT DEFAULT 'LOCAL',
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // 2. Cached Official Members Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS cached_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        role TEXT,
        phone TEXT,
        email TEXT,
        blood_group TEXT,
        is_senior_citizen INTEGER DEFAULT 0,
        category TEXT,
        order_index INTEGER
      );
    `);

    // 3. Offline Donations Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        donor_name TEXT,
        donor_phone TEXT,
        donor_email TEXT,
        amount REAL NOT NULL,
        purpose TEXT,
        payment_mode TEXT DEFAULT 'UPI',
        reference_id TEXT,
        receipt_number TEXT UNIQUE,
        created_at TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    // 4. Welfare Schemes Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS schemes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        eligibility TEXT,
        benefit_amount TEXT,
        status TEXT DEFAULT 'ACTIVE'
      );
    `);

    // 5. App Settings Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 6. Activity & Audit Logs Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        user_identifier TEXT,
        details TEXT,
        timestamp TEXT NOT NULL
      );
    `);

    // Pre-seed official members if table is empty
    const countResult = db.getFirstSync('SELECT COUNT(*) as count FROM cached_members;') as { count: number } | null;
    if (!countResult || countResult.count === 0) {
      for (const m of OFFICIAL_MEMBERS_SEED) {
        db.runSync(
          `INSERT OR REPLACE INTO cached_members (id, name, designation, role, phone, email, blood_group, is_senior_citizen, category, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [m.id, m.name, m.designation, m.role, m.phone, m.email, m.blood_group, m.is_senior_citizen, m.category, m.order_index]
        );
      }
    }

    logActivity('DB_INIT', 'SYSTEM', 'SQLite database initialized with all tables & seeded directory');
    return true;
  } catch (err) {
    console.error('[SQLite] Error initializing database:', err);
    return false;
  }
}

/**
 * Save or update a registered/logged-in user into SQLite
 */
export function saveUser(user: Partial<UserRecord>): boolean {
  const db = getDatabase();
  if (!db || !user.email) return false;

  try {
    const now = new Date().toISOString();
    const id = user.id || `usr_${Date.now()}`;
    const name = user.name || 'Member';
    const email = user.email.toLowerCase().trim();
    const phone = user.phone || '';
    const address = user.address || '';
    const blood_group = user.blood_group || '';
    const is_senior_citizen = user.is_senior_citizen ? 1 : 0;
    const family_members_count = user.family_members_count || 1;
    const membership_no = user.membership_no || `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const role = user.role || 'MEMBER';
    const designation = user.designation || 'Member';
    const password_hash = user.password_hash || '';
    const auth_provider = user.auth_provider || 'LOCAL';

    db.runSync(
      `INSERT OR REPLACE INTO users (
        id, name, email, phone, address, blood_group, is_senior_citizen,
        family_members_count, membership_no, role, designation, password_hash,
        auth_provider, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id, name, email, phone, address, blood_group, is_senior_citizen,
        family_members_count, membership_no, role, designation, password_hash,
        auth_provider, user.created_at || now, now
      ]
    );

    logActivity('USER_SAVED', email, `Saved user ${name} (${membership_no}) to local SQLite`);
    return true;
  } catch (err) {
    console.error('[SQLite] Error saving user:', err);
    return false;
  }
}

/**
 * Get user by email or phone number
 */
export function getUser(credential: string): UserRecord | null {
  const db = getDatabase();
  if (!db || !credential) return null;

  try {
    const clean = credential.trim().toLowerCase();
    const cleanPhone = credential.replace(/\D/g, '');

    const result = db.getFirstSync(
      `SELECT * FROM users WHERE LOWER(email) = ? OR (phone != '' AND REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?) LIMIT 1;`,
      [clean, `%${cleanPhone}%`]
    ) as UserRecord | null;

    return result || null;
  } catch (err) {
    console.error('[SQLite] Error getting user:', err);
    return null;
  }
}

/**
 * Get all users stored in SQLite
 */
export function getAllUsers(): UserRecord[] {
  const db = getDatabase();
  if (!db) return [];

  try {
    return (db.getAllSync('SELECT * FROM users ORDER BY updated_at DESC;') as UserRecord[]) || [];
  } catch (err) {
    console.error('[SQLite] Error getting all users:', err);
    return [];
  }
}

/**
 * Save an offline donation receipt
 */
export function saveDonation(donation: DonationRecord): boolean {
  const db = getDatabase();
  if (!db) return false;

  try {
    const id = donation.id || `don_${Date.now()}`;
    const receipt = donation.receipt_number || `LF-REC-${Date.now().toString().slice(-6)}`;
    const now = donation.created_at || new Date().toISOString();

    db.runSync(
      `INSERT OR REPLACE INTO donations (
        id, donor_name, donor_phone, donor_email, amount, purpose,
        payment_mode, reference_id, receipt_number, created_at, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        donation.donor_name || 'Anonymous',
        donation.donor_phone || '',
        donation.donor_email || '',
        donation.amount,
        donation.purpose || 'General Community Welfare',
        donation.payment_mode || 'UPI',
        donation.reference_id || '',
        receipt,
        now,
        donation.synced ? 1 : 0
      ]
    );

    logActivity('DONATION_SAVED', donation.donor_email || 'DONOR', `Donation of ₹${donation.amount} saved (${receipt})`);
    return true;
  } catch (err) {
    console.error('[SQLite] Error saving donation:', err);
    return false;
  }
}

/**
 * Get all offline donations
 */
export function getDonations(): DonationRecord[] {
  const db = getDatabase();
  if (!db) return [];

  try {
    return (db.getAllSync('SELECT * FROM donations ORDER BY created_at DESC;') as DonationRecord[]) || [];
  } catch (err) {
    console.error('[SQLite] Error getting donations:', err);
    return [];
  }
}

/**
 * Get cached official executive members for instant offline viewing
 */
export function getCachedMembers(): CachedMember[] {
  const db = getDatabase();
  if (!db) return OFFICIAL_MEMBERS_SEED;

  try {
    const list = db.getAllSync('SELECT * FROM cached_members ORDER BY order_index ASC;') as CachedMember[];
    return list && list.length > 0 ? list : OFFICIAL_MEMBERS_SEED;
  } catch (err) {
    return OFFICIAL_MEMBERS_SEED;
  }
}

/**
 * Key-Value App Settings store
 */
export function setSetting(key: string, value: string): boolean {
  const db = getDatabase();
  if (!db) return false;

  try {
    db.runSync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);', [key, value]);
    return true;
  } catch (err) {
    return false;
  }
}

export function getSetting(key: string, defaultValue: string = ''): string {
  const db = getDatabase();
  if (!db) return defaultValue;

  try {
    const result = db.getFirstSync('SELECT value FROM app_settings WHERE key = ?;', [key]) as { value: string } | null;
    return result ? result.value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

/**
 * Log activity for audit and telemetry
 */
export function logActivity(type: string, userIdentifier: string, details: string): void {
  const db = getDatabase();
  if (!db) return;

  try {
    const now = new Date().toISOString();
    db.runSync(
      'INSERT INTO activity_logs (type, user_identifier, details, timestamp) VALUES (?, ?, ?, ?);',
      [type, userIdentifier, details, now]
    );
  } catch (err) {
    // Fail silently for logger
  }
}

export function getActivityLogs(limit: number = 50): ActivityLog[] {
  const db = getDatabase();
  if (!db) return [];

  try {
    return (db.getAllSync('SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?;', [limit]) as ActivityLog[]) || [];
  } catch (err) {
    return [];
  }
}
