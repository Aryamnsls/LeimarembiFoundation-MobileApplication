import React, { useState, useMemo, useDeferredValue, memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { getCachedMembers, CachedMember, OFFICIAL_MEMBERS_SEED } from '@/services/database';

const LEIMAREMBI_LOGO = require('@/assets/images/leimarembi_official_logo.png');

interface OfficerCardProps {
  member: CachedMember;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
}

const OfficerCard = memo(function OfficerCard({ member, onCall, onEmail }: OfficerCardProps) {
  const initials = useMemo(() => {
    return member.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }, [member.name]);

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberCardTop}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberNameText}>{member.name}</Text>
            {member.is_senior_citizen === 1 && (
              <View style={styles.seniorTag}>
                <Text style={styles.seniorTagText}>Senior Citizen</Text>
              </View>
            )}
          </View>

          <Text style={styles.memberDesignationText}>{member.designation}</Text>

          <View style={styles.memberBadgesRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{member.role}</Text>
            </View>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodBadgeText}>Group {member.blood_group}</Text>
            </View>
            <Text style={styles.memberIdText}>{member.id}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: Clean 1-Tap Call and Email (Zero emoji) */}
      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={styles.actionBtnCall}
          onPress={() => onCall(member.phone)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel={`Call ${member.name} at ${member.phone}`}
        >
          <Text style={styles.actionBtnText}>Call {member.phone}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnEmail}
          onPress={() => onEmail(member.email)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel={`Email ${member.name} at ${member.email}`}
        >
          <Text style={styles.actionBtnEmailText} numberOfLines={1}>
            Email
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function DirectoryExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [members, setMembers] = useState<CachedMember[]>(() => {
    try {
      const data = getCachedMembers();
      return data && data.length > 0 ? data : OFFICIAL_MEMBERS_SEED;
    } catch {
      return OFFICIAL_MEMBERS_SEED;
    }
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');

  // React 19 Concurrent Deferred Value prevents typing lag
  const deferredQuery = useDeferredValue(searchQuery);

  const loadDirectoryData = useCallback(() => {
    try {
      setLoadError(null);
      const data = getCachedMembers();
      if (!data || data.length === 0) {
        setMembers(OFFICIAL_MEMBERS_SEED);
      } else {
        setMembers(data);
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load cached directory records.');
    }
  }, []);

  // Derived filter lists based strictly on data actually present
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(members.map((m) => m.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [members]);

  const availableBloodGroups = useMemo(() => {
    const bgs = Array.from(new Set(members.map((m) => m.blood_group).filter(Boolean)));
    return ['All', ...bgs.sort()];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.designation.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.blood_group.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'All' ||
        member.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesBloodGroup =
        selectedBloodGroup === 'All' ||
        member.blood_group.toUpperCase() === selectedBloodGroup.toUpperCase();

      return matchesSearch && matchesCategory && matchesBloodGroup;
    });
  }, [members, deferredQuery, selectedCategory, selectedBloodGroup]);

  // Sanitized phone call handler
  const handleCall = useCallback((phone: string) => {
    if (!phone) return;
    const sanitized = phone.replace(/[^\d+]/g, '');
    if (!sanitized) return;
    Linking.openURL(`tel:${sanitized}`).catch((err) => {
      console.warn('[Linking] Dialer unavailable for:', sanitized, err);
    });
  }, []);

  // Sanitized email handler
  const handleEmail = useCallback((email: string) => {
    if (!email) return;
    const clean = email.trim();
    if (!clean) return;
    Linking.openURL(`mailto:${clean}`).catch((err) => {
      console.warn('[Linking] Email client unavailable for:', clean, err);
    });
  }, []);

  const handleShareDirectory = useCallback(async () => {
    try {
      await Share.share({
        title: 'Leimarembi Foundation Executive Directory',
        message:
          'Official Executive Directory & Community Welfare Portal of Leimarembi Foundation: https://leimarembifoundation.org/members',
      });
    } catch {}
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: BrandColors.primary }]}>
      {/* ─── Top Header Bar ─── */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <Image source={LEIMAREMBI_LOGO} style={styles.headerLogo} contentFit="contain" />
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitleText} numberOfLines={1}>
                Foundation Directory
              </Text>
              <Text style={styles.headerSubtitleText} numberOfLines={1}>
                Executive Officers & Committee
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerShareBtn}
            onPress={handleShareDirectory}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Share Directory"
          >
            <Text style={styles.headerShareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.containerBounds}>
          {/* ─── Trust Credentials Card ─── */}
          <View style={styles.credentialsCard}>
            <View style={styles.credentialsHeader}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Public Charitable Trust</Text>
              </View>
              <Text style={styles.estdText}>Estd. 2001</Text>
            </View>
            <Text style={styles.trustTitle}>Leimarembi Foundation</Text>
            <Text style={styles.trustSubtitle}>
              Manipuri Rajbari, Guwahati-781007, Assam, India
            </Text>

            <View style={styles.credRow}>
              <View style={styles.credPill}>
                <Text style={styles.credPillLabel}>NGO Darpan ID</Text>
                <Text style={styles.credPillValue}>AS/2023/034291</Text>
              </View>
              <View style={styles.credPill}>
                <Text style={styles.credPillLabel}>Tax Status</Text>
                <Text style={styles.credPillValue}>80G & 12A Certified</Text>
              </View>
            </View>
          </View>

          {/* ─── Data Advisory Notice ─── */}
          <View style={styles.advisoryCard}>
            <Text style={styles.advisoryText}>
              Note: Member contact numbers are preserved from the local registry cache. Direct official verification with foundation administration is recommended.
            </Text>
          </View>

          {/* ─── Search & Filter Bar ─── */}
          <View style={styles.searchSection}>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search member name, designation, phone..."
                placeholderTextColor={BrandColors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                accessibilityLabel="Search member directory"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search input"
                >
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Department / Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${cat} category`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Blood Group Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                <Text style={styles.filterPrefixLabel}>Blood Group:</Text>
                {availableBloodGroups.map((bg) => {
                  const isSelected = selectedBloodGroup === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
                      onPress={() => setSelectedBloodGroup(bg)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by blood group ${bg}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.bloodChipText, isSelected && styles.bloodChipTextActive]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ─── Directory Count Header ─── */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              Leadership Directory ({filteredMembers.length})
            </Text>
            <View style={styles.offlineStatusTag}>
              <Text style={styles.offlineStatusLabel}>Offline Cache</Text>
            </View>
          </View>

          {/* ─── Recoverable Error State ─── */}
          {loadError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxTitle}>Error Loading Directory</Text>
              <Text style={styles.errorBoxText}>{loadError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={loadDirectoryData}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Retry loading directory data"
              >
                <Text style={styles.retryBtnText}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── Member Cards List ─── */}
          {!loadError && filteredMembers.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateTitle}>No Members Found</Text>
              <Text style={styles.emptyStateText}>
                No entries match &quot;{searchQuery}&quot; with selected filters.
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedBloodGroup('All');
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters and search query"
              >
                <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            !loadError &&
            filteredMembers.map((member) => (
              <OfficerCard
                key={member.id}
                member={member}
                onCall={handleCall}
                onEmail={handleEmail}
              />
            ))
          )}

          {/* ─── Community Programs & Schemes Overview ─── */}
          <View style={styles.programsCard}>
            <Text style={styles.programsHeaderTitle}>Charitable Welfare Focus</Text>
            <Text style={styles.programsHeaderSubtitle}>
              Registered trust initiatives serving communities across Northeast India
            </Text>

            <View style={styles.programItem}>
              <View style={styles.programIndexBadge}>
                <Text style={styles.programIndexText}>1</Text>
              </View>
              <View style={styles.programTextBox}>
                <Text style={styles.programItemTitle}>Rural Health Camps & Blood Registry</Text>
                <Text style={styles.programItemDesc}>
                  Medical clinics, senior health checkups, and emergency voluntary blood donor network coordination.
                </Text>
              </View>
            </View>

            <View style={styles.programItem}>
              <View style={styles.programIndexBadge}>
                <Text style={styles.programIndexText}>2</Text>
              </View>
              <View style={styles.programTextBox}>
                <Text style={styles.programItemTitle}>Meitei Mayek & Heritage Preservation</Text>
                <Text style={styles.programItemDesc}>
                  Preserving indigenous literature, script education workshops, and classical cultural documentation.
                </Text>
              </View>
            </View>

            <View style={styles.programItem}>
              <View style={styles.programIndexBadge}>
                <Text style={styles.programIndexText}>3</Text>
              </View>
              <View style={styles.programTextBox}>
                <Text style={styles.programItemTitle}>Merit Scholarships & Education Support</Text>
                <Text style={styles.programItemDesc}>
                  Educational grants, learning materials, and mentorship for meritorious youth from underprivileged backgrounds.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    backgroundColor: BrandColors.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    flexShrink: 0,
  },
  headerTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  headerSubtitleText: {
    color: BrandColors.mint,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  headerShareBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerShareText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  scrollBody: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  scrollContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  containerBounds: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },

  // Credentials Card
  credentialsCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  credentialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: BrandColors.emeraldUltraLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    color: BrandColors.emeraldDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  estdText: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },
  trustTitle: {
    color: BrandColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  trustSubtitle: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  credRow: {
    flexDirection: 'row',
    gap: 8,
  },
  credPill: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  credPillLabel: {
    color: BrandColors.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },
  credPillValue: {
    color: BrandColors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  // Data Advisory Notice
  advisoryCard: {
    backgroundColor: BrandColors.emeraldUltraLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  advisoryText: {
    color: BrandColors.primarySurface,
    fontSize: 11,
    lineHeight: 16,
  },

  // Search Section
  searchSection: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.canvas,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.text,
    paddingVertical: 0,
  },
  clearSearchText: {
    color: BrandColors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  chipsScroll: {
    marginTop: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: BrandColors.primary,
  },
  chipText: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPrefixLabel: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  bloodChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  bloodChipActive: {
    backgroundColor: BrandColors.secondaryEmerald,
  },
  bloodChipText: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  offlineStatusTag: {
    backgroundColor: BrandColors.emeraldUltraLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offlineStatusLabel: {
    color: BrandColors.emeraldDark,
    fontSize: 10,
    fontWeight: '700',
  },

  // Member Card
  memberCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  memberCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.secondaryEmerald,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberNameText: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  seniorTag: {
    backgroundColor: BrandColors.emeraldUltraLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  seniorTagText: {
    color: BrandColors.emeraldDark,
    fontSize: 9,
    fontWeight: '700',
  },
  memberDesignationText: {
    color: BrandColors.secondaryEmerald,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  memberBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: BrandColors.secondaryText,
    fontSize: 9,
    fontWeight: '700',
  },
  bloodBadge: {
    backgroundColor: BrandColors.goldSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bloodBadgeText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '700',
  },
  memberIdText: {
    color: BrandColors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnCall: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.secondaryEmerald,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnEmail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnEmailText: {
    color: BrandColors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty & Error States
  emptyStateBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emptyStateTitle: {
    color: BrandColors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyStateText: {
    color: BrandColors.secondaryText,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  resetFiltersBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetFiltersBtnText: {
    color: BrandColors.mint,
    fontSize: 12,
    fontWeight: '700',
  },

  errorBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: BrandColors.dangerSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },
  errorBoxTitle: {
    color: BrandColors.dangerDark,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  errorBoxText: {
    color: '#991B1B',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: BrandColors.dangerDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Programs Card
  programsCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    marginTop: 12,
  },
  programsHeaderTitle: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  programsHeaderSubtitle: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 14,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  programIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.emeraldUltraLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  programIndexText: {
    color: BrandColors.emeraldDark,
    fontSize: 11,
    fontWeight: '800',
  },
  programTextBox: {
    flex: 1,
  },
  programItemTitle: {
    color: BrandColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  programItemDesc: {
    color: BrandColors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});
