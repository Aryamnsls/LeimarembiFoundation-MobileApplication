import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Tab & Route Mapping Logic
function updateActiveTabFromUrl(url) {
  if (!url) return 'home';
  const lower = url.toLowerCase();
  if (lower.includes('/donate')) {
    return 'donate';
  } else if (lower.includes('/grants') || lower.includes('/activities') || lower.includes('/health')) {
    return 'schemes';
  } else if (lower.includes('/members') || lower.includes('/about') || lower.includes('/culture')) {
    return 'members';
  } else if (
    lower.includes('/portal') ||
    lower.includes('/login') ||
    lower.includes('/register') ||
    lower.includes('/superadmin') ||
    lower.includes('/management')
  ) {
    return 'portal';
  } else {
    return 'home';
  }
}

// Password Strength Evaluator Logic
function evaluatePassword(val) {
  if (!val) {
    return { score: 0, level: 'EMPTY' };
  }
  const hasLen = val.length >= 8;
  const hasUp = /[A-Z]/.test(val);
  const hasNum = /[0-9]/.test(val);
  const hasSym = /[^A-Za-z0-9]/.test(val);

  let score = 0;
  if (val.length >= 6) score++;
  if (hasLen) score++;
  if (hasUp) score++;
  if (hasNum) score++;
  if (hasSym) score++;

  if (score <= 2) {
    return { score, level: 'WEAK' };
  } else if (score <= 4) {
    return { score, level: 'MEDIUM' };
  } else {
    return { score, level: 'STRONG' };
  }
}

// In-Memory Storage Adapter for testing persistence contracts
class MockDatabaseStorage {
  constructor() {
    this.store = {};
    this.OFFICIAL_MEMBERS_SEED = [
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
  }

  initDatabase() {
    this.store['lf_sqlite_members'] = JSON.stringify(this.OFFICIAL_MEMBERS_SEED);
    return true;
  }

  getCachedMembers() {
    const raw = this.store['lf_sqlite_members'];
    return raw ? JSON.parse(raw) : this.OFFICIAL_MEMBERS_SEED;
  }

  saveUser(user) {
    if (!user.email) return false;
    const now = new Date().toISOString();
    const id = user.id || `usr_${Date.now()}`;
    const record = {
      id,
      name: user.name || 'Member',
      email: user.email.toLowerCase().trim(),
      phone: user.phone || '',
      blood_group: user.blood_group || '',
      is_senior_citizen: user.is_senior_citizen ? 1 : 0,
      membership_no: user.membership_no || `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      role: user.role || 'MEMBER',
      created_at: now,
      updated_at: now,
    };
    const users = this.getAllUsers();
    users.unshift(record);
    this.store['lf_sqlite_users'] = JSON.stringify(users);
    return true;
  }

  getUser(credential) {
    const clean = credential.trim().toLowerCase();
    const cleanPhone = credential.replace(/\D/g, '');
    const users = this.getAllUsers();
    return users.find((u) => u.email === clean || (cleanPhone && u.phone.includes(cleanPhone))) || null;
  }

  getAllUsers() {
    const raw = this.store['lf_sqlite_users'];
    return raw ? JSON.parse(raw) : [];
  }

  saveDonation(d) {
    const id = d.id || `don_${Date.now()}`;
    const receipt = d.receipt_number || `LF-REC-${Date.now().toString().slice(-6)}`;
    const isSynced = d.synced === 1 ? 1 : 0;
    const record = {
      id,
      donor_name: d.donor_name || 'Anonymous',
      amount: d.amount,
      purpose: d.purpose || 'General Community Welfare',
      receipt_number: receipt,
      created_at: new Date().toISOString(),
      synced: isSynced,
    };
    const list = this.getDonations();
    const existingIndex = list.findIndex((item) => item.id === id || item.receipt_number === receipt);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.unshift(record);
    }
    this.store['lf_sqlite_donations'] = JSON.stringify(list);
    return true;
  }

  getDonations() {
    const raw = this.store['lf_sqlite_donations'];
    return raw ? JSON.parse(raw) : [];
  }

  setSetting(k, v) {
    this.store[`lf_setting_${k}`] = v;
    return true;
  }

  getSetting(k, def = '') {
    return this.store[`lf_setting_${k}`] ?? def;
  }
}

// Directory Search Filter Logic
function filterMembers(members, query, category = 'All', bloodGroup = 'All') {
  const cleanQ = (query || '').trim().toLowerCase();
  return members.filter((member) => {
    const matchQ =
      !cleanQ ||
      member.name.toLowerCase().includes(cleanQ) ||
      member.designation.toLowerCase().includes(cleanQ) ||
      member.phone.includes(cleanQ) ||
      member.email.toLowerCase().includes(cleanQ) ||
      member.blood_group.toLowerCase().includes(cleanQ);

    const matchCat =
      category === 'All' ||
      member.category.toLowerCase() === category.toLowerCase();

    const matchBg =
      bloodGroup === 'All' ||
      member.blood_group.toUpperCase() === bloodGroup.toUpperCase();

    return matchQ && matchCat && matchBg;
  });
}

// Anti-duplicate submission throttling guard
class SubmissionGuard {
  constructor(timeoutMs = 100) {
    this.submitting = new Set();
    this.timeoutMs = timeoutMs;
  }

  trySubmit(formId) {
    if (this.submitting.has(formId)) {
      return false; // Guarded, prevent duplicate
    }
    this.submitting.add(formId);
    const timer = setTimeout(() => {
      this.submitting.delete(formId);
    }, this.timeoutMs);
    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }
    return true;
  }

  isSubmitting(formId) {
    return this.submitting.has(formId);
  }
}

describe('1. Active Tab and URL Route Mapping', () => {
  test('maps home route correctly', () => {
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/?direct=1'), 'home');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/'), 'home');
    assert.equal(updateActiveTabFromUrl(''), 'home');
  });

  test('maps donation route correctly', () => {
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/donate'), 'donate');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/donate?amount=1000'), 'donate');
  });

  test('maps schemes and welfare routes correctly', () => {
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/grants'), 'schemes');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/activities'), 'schemes');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/health'), 'schemes');
  });

  test('maps members and community culture routes correctly', () => {
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/members'), 'members');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/about'), 'members');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/culture'), 'members');
  });

  test('maps portal and auth routes correctly', () => {
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/portal'), 'portal');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/login'), 'portal');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/register'), 'portal');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/superadmin'), 'portal');
    assert.equal(updateActiveTabFromUrl('https://leimarembifoundation.org/management'), 'portal');
  });
});

describe('2. Password Strength Evaluator', () => {
  test('evaluates empty password as neutral EMPTY', () => {
    const res = evaluatePassword('');
    assert.equal(res.score, 0);
    assert.equal(res.level, 'EMPTY');
  });

  test('evaluates short and simple passwords as WEAK', () => {
    assert.equal(evaluatePassword('pass').level, 'WEAK');
    assert.equal(evaluatePassword('123456').level, 'WEAK');
    assert.equal(evaluatePassword('abcdefgh').level, 'WEAK');
  });

  test('evaluates mixed alphanumeric passwords as MEDIUM', () => {
    assert.equal(evaluatePassword('Pass1234').level, 'MEDIUM');
    assert.equal(evaluatePassword('Foundation2026').level, 'MEDIUM');
  });

  test('evaluates bank-grade high complexity passwords as STRONG', () => {
    const res = evaluatePassword('Leimarembi@2026!');
    assert.equal(res.score, 5);
    assert.equal(res.level, 'STRONG');

    const res2 = evaluatePassword('Govt#Trust80G$');
    assert.equal(res2.score, 5);
    assert.equal(res2.level, 'STRONG');
  });
});

describe('3. Database Service API & Seeding Integrity', () => {
  const db = new MockDatabaseStorage();

  test('initializes database successfully and seeds 15 official executive members', () => {
    const ok = db.initDatabase();
    assert.equal(ok, true);

    const members = db.getCachedMembers();
    assert.equal(Array.isArray(members), true);
    assert.equal(members.length, 15);

    // Verify key executive officers
    const president = members.find((m) => m.id === 'LF-EXEC-001');
    assert.ok(president);
    assert.equal(president.name, 'M. Tombi Babu Singha');
    assert.equal(president.designation, 'President');
    assert.equal(president.role, 'ADMIN');

    const founder = members.find((m) => m.id === 'LF-EXEC-004');
    assert.ok(founder);
    assert.equal(founder.name, 'M. Bina Babu Singha');
    assert.equal(founder.role, 'SUPER_ADMIN');

    const itAdmin = members.find((m) => m.id === 'LF-SA-001');
    assert.ok(itAdmin);
    assert.equal(itAdmin.name, 'Aryaman Singha');
    assert.equal(itAdmin.role, 'SUPER_ADMIN');
  });

  test('saves and retrieves registered member profile', () => {
    const saved = db.saveUser({
      name: 'Sanajaoba Meitei',
      email: 'sanajaoba@example.com',
      phone: '9864998877',
      address: 'Imphal West, Manipur',
      blood_group: 'O+',
      is_senior_citizen: 0,
      role: 'MEMBER',
    });
    assert.equal(saved, true);

    const retrieved = db.getUser('sanajaoba@example.com');
    assert.ok(retrieved);
    assert.equal(retrieved.name, 'Sanajaoba Meitei');
    assert.equal(retrieved.blood_group, 'O+');
    assert.ok(retrieved.membership_no.startsWith('LF-2026-'));

    // Retrieve via phone
    const byPhone = db.getUser('9864998877');
    assert.ok(byPhone);
    assert.equal(byPhone.email, 'sanajaoba@example.com');
  });

  test('records and retrieves offline charitable donation receipt', () => {
    const donSaved = db.saveDonation({
      id: 'don_test_001',
      donor_name: 'Laishram Dev',
      donor_phone: '9876543210',
      donor_email: 'dev@example.com',
      amount: 5000,
      purpose: 'Rural Eye Checkup Camp',
      payment_mode: 'UPI',
    });
    assert.equal(donSaved, true);

    const donations = db.getDonations();
    assert.ok(donations.length > 0);
    const recorded = donations.find((d) => d.id === 'don_test_001');
    assert.ok(recorded);
    assert.equal(recorded.amount, 5000);
    assert.equal(recorded.purpose, 'Rural Eye Checkup Camp');
    assert.ok(recorded.receipt_number.startsWith('LF-REC-'));
  });

  test('persists app settings and preferences', () => {
    db.setSetting('language', 'MEITEI_MAYEK');
    assert.equal(db.getSetting('language'), 'MEITEI_MAYEK');
    assert.equal(db.getSetting('unknown_key', 'DEFAULT_VAL'), 'DEFAULT_VAL');
  });
});

describe('4. Directory Search & Filtering Engine', () => {
  const db = new MockDatabaseStorage();
  db.initDatabase();
  const members = db.getCachedMembers();

  test('filters accurately by search term across name, role, phone, and blood group', () => {
    // Search by name
    const byName = filterMembers(members, 'Aryaman');
    assert.equal(byName.length, 1);
    assert.equal(byName[0].id, 'LF-SA-001');

    // Search by designation
    const byDesig = filterMembers(members, 'Managing Director');
    assert.equal(byDesig.length, 1);
    assert.equal(byDesig[0].name, 'L. Bira Babu Singha');

    // Search by phone snippet
    const byPhone = filterMembers(members, '763708');
    assert.equal(byPhone.length, 1);
    assert.equal(byPhone[0].name, 'M. Bina Babu Singha');

    // Empty search returns all 15 members
    const all = filterMembers(members, '');
    assert.equal(all.length, 15);
  });

  test('filters by Category correctly', () => {
    const executiveOnly = filterMembers(members, '', 'Executive', 'All');
    assert.equal(executiveOnly.length, 7);

    const committeeOnly = filterMembers(members, '', 'Committee', 'All');
    assert.equal(committeeOnly.length, 7);

    const superAdminOnly = filterMembers(members, '', 'SuperAdmin', 'All');
    assert.equal(superAdminOnly.length, 1);
  });

  test('filters by Blood Group correctly', () => {
    const oPlus = filterMembers(members, '', 'All', 'O+');
    assert.ok(oPlus.length >= 2);
    assert.ok(oPlus.every((m) => m.blood_group === 'O+'));

    const bMinus = filterMembers(members, '', 'All', 'B-');
    assert.equal(bMinus.length, 1);
    assert.equal(bMinus[0].name, 'K. Sarat Singha');
  });
});

describe('5. Anti-Duplicate Submission Throttling Guard', () => {
  test('permits initial submission and blocks immediate duplicate submissions', () => {
    const guard = new SubmissionGuard(2000);
    const formKey = 'donation_form_1001';

    // First submit must pass
    const firstAttempt = guard.trySubmit(formKey);
    assert.equal(firstAttempt, true);
    assert.equal(guard.isSubmitting(formKey), true);

    // Rapid second click within debounce window must be rejected
    const secondAttempt = guard.trySubmit(formKey);
    assert.equal(secondAttempt, false);

    // Different form key should still succeed
    const differentForm = guard.trySubmit('registration_form_2002');
    assert.equal(differentForm, true);
  });
});

describe('6. Phone & Email Sanitization Logic', () => {
  function sanitizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  }

  function sanitizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  test('sanitizes telephone strings while preserving country code +', () => {
    assert.equal(sanitizePhone('+91 97074-99079'), '+919707499079');
    assert.equal(sanitizePhone('(0361) 254-8901'), '03612548901');
    assert.equal(sanitizePhone('  +91-7637087931  '), '+917637087931');
    assert.equal(sanitizePhone(''), '');
    assert.equal(sanitizePhone(null), '');
  });

  test('cleans and normalizes email inputs', () => {
    assert.equal(sanitizeEmail('  Tombi.Singha@LeimarembiFoundation.org  '), 'tombi.singha@leimarembifoundation.org');
    assert.equal(sanitizeEmail(''), '');
    assert.equal(sanitizeEmail(null), '');
  });
});

describe('7. Donation Sync Status Integrity & Deduplication', () => {
  test('marks donation as unsynced (synced=0) when unconfirmed by backend', () => {
    const db = new MockDatabaseStorage();
    db.initDatabase();

    db.saveDonation({
      id: 'don_local_01',
      donor_name: 'Local Donor',
      amount: 500,
      receipt_number: 'REC-001',
      synced: undefined, // no server confirmation
    });

    const list = db.getDonations();
    assert.equal(list.length, 1);
    assert.equal(list[0].synced, 0, 'Donation without server confirmation must have synced=0');
  });

  test('marks donation as synced (synced=1) only when backend explicitly confirms', () => {
    const db = new MockDatabaseStorage();
    db.initDatabase();

    db.saveDonation({
      id: 'don_verified_02',
      donor_name: 'Verified Donor',
      amount: 2500,
      receipt_number: 'REC-002',
      synced: 1, // backend confirmed
    });

    const list = db.getDonations();
    assert.equal(list[0].synced, 1, 'Donation with verified backend confirmation must have synced=1');
  });

  test('updates existing receipt rather than duplicating record on retry', () => {
    const db = new MockDatabaseStorage();
    db.initDatabase();

    // First save: offline/unverified
    db.saveDonation({
      id: 'don_id_100',
      donor_name: 'Repeat Donor',
      amount: 1000,
      receipt_number: 'REC-DUPE-01',
      synced: 0,
    });
    assert.equal(db.getDonations().length, 1);

    // Second save with same receipt number: server verified
    db.saveDonation({
      id: 'don_id_100',
      donor_name: 'Repeat Donor',
      amount: 1000,
      receipt_number: 'REC-DUPE-01',
      synced: 1,
    });

    const list = db.getDonations();
    assert.equal(list.length, 1, 'Must not duplicate record with identical id/receipt');
    assert.equal(list[0].synced, 1, 'Sync flag must update to 1');
  });
});

describe('8. Web Storage Safe Quota & Exception Resilience', () => {
  test('gracefully falls back to in-memory store when storage throws error', () => {
    const memoryStore = {};
    let storageThrows = true;

    function safeSetItem(k, v) {
      try {
        if (storageThrows) {
          throw new Error('QuotaExceededError: storage full');
        }
      } catch {
        // Fallback to memory
      }
      memoryStore[k] = v;
    }

    function safeGetItem(k) {
      try {
        if (storageThrows) {
          throw new Error('SecurityError: access denied');
        }
      } catch {
        // Fallback to memory
      }
      return memoryStore[k] ?? null;
    }

    safeSetItem('test_key', 'safe_value');
    assert.equal(safeGetItem('test_key'), 'safe_value');
  });
});

