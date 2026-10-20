/**
 * Leimarembi Foundation Mobile Application - Shared Database Types & Official Seed Data
 *
 * Centralized data contracts for native SQLite and Web local-storage persistence adapters.
 */

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

/**
 * Official Seed Roster (15 Executive & Committee Members)
 *
 * NOTE / DATA-QUALITY NOTICE:
 * Several phone numbers in this seed roster follow sequential or illustrative patterns
 * (e.g. 9864012345 .. 9864145678). These are preserved exactly as defined in the
 * initial seed data per repository guidelines, but must not be published or treated as
 * verified official contact numbers without confirmation from authoritative foundation leadership.
 */
export const OFFICIAL_MEMBERS_SEED: CachedMember[] = [
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
