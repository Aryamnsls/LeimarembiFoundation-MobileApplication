/**
 * Leimarembi Foundation Mobile Application - Web Persistence Service
 *
 * Browser-compatible implementation of the database service.
 * Uses localStorage with in-memory fallback for web environments, matching the exact
 * native SQLite API contracts without requiring native binaries or SharedArrayBuffer.
 *
 * NOTE: Browser local storage is client-side device persistence, not secure server storage
 * or a real cloud sync.
 */

import {
  UserRecord,
  CachedMember,
  DonationRecord,
  ActivityLog,
  OFFICIAL_MEMBERS_SEED,
} from './database.types';

export {
  UserRecord,
  CachedMember,
  DonationRecord,
  ActivityLog,
  OFFICIAL_MEMBERS_SEED,
};

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Quota, security, or private-browsing exception
  }
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Quota, security, or private-browsing exception
  }
  memoryStore[key] = value;
}

export function initDatabase(): boolean {
  try {
    const existing = safeGetItem('lf_sqlite_members');
    if (!existing) {
      safeSetItem('lf_sqlite_members', JSON.stringify(OFFICIAL_MEMBERS_SEED));
    }
    logActivity('DB_INIT', 'SYSTEM', 'Web local persistence initialized with seeded directory');
    return true;
  } catch {
    return false;
  }
}

export function saveUser(user: Partial<UserRecord>): boolean {
  if (!user.email) return false;
  try {
    const now = new Date().toISOString();
    const id = user.id || `usr_${Date.now()}`;
    const name = user.name || 'Member';
    const email = user.email.toLowerCase().trim();
    const membership_no = user.membership_no || `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: UserRecord = {
      id,
      name,
      email,
      phone: user.phone || '',
      address: user.address || '',
      blood_group: user.blood_group || '',
      is_senior_citizen: user.is_senior_citizen ? 1 : 0,
      family_members_count: user.family_members_count || 1,
      membership_no,
      role: user.role || 'MEMBER',
      designation: user.designation || 'Member',
      password_hash: user.password_hash || '',
      auth_provider: user.auth_provider || 'LOCAL',
      created_at: user.created_at || now,
      updated_at: now,
    };

    const users = getAllUsers();
    const existingIndex = users.findIndex(
      (u) => (u.email && u.email.toLowerCase() === email) || u.id === id
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...record, updated_at: now };
    } else {
      users.unshift(record);
    }
    safeSetItem('lf_sqlite_users', JSON.stringify(users));
    logActivity('USER_SAVED', email, `Saved user ${name} (${membership_no}) to web storage`);
    return true;
  } catch {
    return false;
  }
}

export function getUser(credential: string): UserRecord | null {
  if (!credential) return null;
  try {
    const clean = credential.trim().toLowerCase();
    const cleanPhone = credential.replace(/\D/g, '');
    const users = getAllUsers();
    return (
      users.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === clean;
        const phoneMatch = cleanPhone && u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone);
        return emailMatch || phoneMatch;
      }) || null
    );
  } catch {
    return null;
  }
}

export function getAllUsers(): UserRecord[] {
  try {
    const raw = safeGetItem('lf_sqlite_users');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDonation(donation: DonationRecord): boolean {
  if (!Number.isFinite(donation.amount) || donation.amount < 0) return false;
  try {
    const id = donation.id || `don_${Date.now()}`;
    const receipt = donation.receipt_number || `LF-REC-${Date.now().toString().slice(-6)}`;
    const now = donation.created_at || new Date().toISOString();
    // Enforce data integrity: never mark synced unless verified by server signal
    const isSynced = donation.synced === 1 ? 1 : 0;

    const record: DonationRecord = {
      id,
      donor_name: donation.donor_name || 'Anonymous',
      donor_phone: donation.donor_phone || '',
      donor_email: donation.donor_email || '',
      amount: donation.amount,
      purpose: donation.purpose || 'General Community Welfare',
      payment_mode: donation.payment_mode || 'UPI',
      reference_id: donation.reference_id || '',
      receipt_number: receipt,
      created_at: now,
      synced: isSynced,
    };

    const donations = getDonations();
    // Anti-duplicate protection: update if receipt or ID already exists
    const existingIndex = donations.findIndex(
      (d) => d.id === id || (d.receipt_number && d.receipt_number === receipt)
    );
    if (existingIndex >= 0) {
      donations[existingIndex] = { ...donations[existingIndex], ...record };
    } else {
      donations.unshift(record);
    }
    safeSetItem('lf_sqlite_donations', JSON.stringify(donations));
    logActivity(
      'DONATION_SAVED',
      donation.donor_email || 'DONOR',
      `Donation of ₹${donation.amount} recorded (${receipt}, synced: ${isSynced})`
    );
    return true;
  } catch {
    return false;
  }
}

export function getDonations(): DonationRecord[] {
  try {
    const raw = safeGetItem('lf_sqlite_donations');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCachedMembers(): CachedMember[] {
  try {
    const raw = safeGetItem('lf_sqlite_members');
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : OFFICIAL_MEMBERS_SEED;
  } catch {
    return OFFICIAL_MEMBERS_SEED;
  }
}

export function setSetting(key: string, value: string): boolean {
  try {
    safeSetItem(`lf_setting_${key}`, value);
    return true;
  } catch {
    return false;
  }
}

export function getSetting(key: string, defaultValue: string = ''): string {
  try {
    const val = safeGetItem(`lf_setting_${key}`);
    return val !== null ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function logActivity(type: string, userIdentifier: string, details: string): void {
  try {
    const now = new Date().toISOString();
    const logs = getActivityLogs(100);
    const newLog: ActivityLog = {
      id: Date.now(),
      type,
      user_identifier: userIdentifier,
      details,
      timestamp: now,
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.length = 100;
    safeSetItem('lf_sqlite_activity_logs', JSON.stringify(logs));
  } catch {
    // Fail silently for logger
  }
}

export function getActivityLogs(limit: number = 50): ActivityLog[] {
  try {
    const raw = safeGetItem('lf_sqlite_activity_logs');
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(logs) ? logs.slice(0, limit) : [];
  } catch {
    return [];
  }
}
