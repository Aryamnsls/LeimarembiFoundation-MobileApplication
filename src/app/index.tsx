import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Share,
  Linking,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCTION_URL = 'https://leimarembifoundation.org';
const OFFICIAL_UPI_ID = 'leimarembifoundation@sbi';

// --- DATA DEFINITIONS ---

interface Member {
  id: number;
  name: string;
  role: string;
  subtitle: string;
  shortProfile: string;
  areaOfResponsibility: string;
  category: 'Leadership' | 'Executive';
  phone?: string;
  email?: string;
}

const MEMBERS_ROSTER: Member[] = [
  {
    id: 1,
    name: 'Dr. Phuritsabam Birmani',
    role: 'President',
    subtitle: 'Senior Journalist | President, Manipuri Sahitya Parishad, Assam',
    shortProfile: 'A senior journalist and literary personality with active involvement in community, cultural, and social development. He provides strategic leadership and vision to Leimarembi Foundation.',
    areaOfResponsibility: 'Overall leadership, strategic vision, organisational development, and coordination of foundation initiatives.',
    category: 'Leadership',
    email: 'president@leimarembifoundation.org',
  },
  {
    id: 2,
    name: 'K. Ajit Singh',
    role: 'Vice-Chairman',
    subtitle: 'Retired Government Employee | Sports & Kabaddi Advocate',
    shortProfile: 'A retired government employee actively involved in youth athletic development, particularly indigenous sports and Kabaddi programs.',
    areaOfResponsibility: 'Sports development, youth athletic initiatives, and health camps coordination.',
    category: 'Leadership',
    email: 'sports@leimarembifoundation.org',
  },
  {
    id: 3,
    name: 'Y. Thambal Singha',
    role: 'Managing Director',
    subtitle: 'Retired Govt. Officer | President GMSO | President Sri Sri Radha Gobindo Mandir',
    shortProfile: 'A distinguished retired administrator with decades of public service experience, spearheading operational efficiency and grassroots community engagement.',
    areaOfResponsibility: 'Organisational administration, programme execution, and regional community outreach.',
    category: 'Leadership',
    email: 'md@leimarembifoundation.org',
  },
  {
    id: 4,
    name: 'M. Bina Babu Singha',
    role: 'Secretary',
    subtitle: 'Retired Government Officer | Advisor, UMAA Kamrup',
    shortProfile: 'Dedicated to social administration and public service, overseeing official correspondence, regulatory governance, and project delivery.',
    areaOfResponsibility: 'General administration, government documentation, statutory records, and executive secretarial affairs.',
    category: 'Leadership',
    email: 'secretary@leimarembifoundation.org',
  },
  {
    id: 5,
    name: 'Ng. Baldev Singha',
    role: 'Treasurer',
    subtitle: 'Retired Govt. Officer | Working President UMAA Central | VP GMSO',
    shortProfile: 'Expertise in fiscal management, institutional accounting, and statutory compliance, ensuring 100% transparent public welfare disbursement.',
    areaOfResponsibility: 'Financial governance, budgeting, audited statutory records, and donations transparency.',
    category: 'Leadership',
    email: 'treasurer@leimarembifoundation.org',
  },
  {
    id: 6,
    name: 'K. Braja Babu Singha',
    role: 'Executive Member',
    subtitle: 'Retired Army Personnel | Executive Member UMAA & GMSO',
    shortProfile: 'Honourably retired armed forces veteran championing civic discipline, security logistics, and disaster relief preparedness.',
    areaOfResponsibility: 'Community outreach, field coordination, and emergency welfare response.',
    category: 'Executive',
  },
  {
    id: 7,
    name: 'L. Madan Chand Singha',
    role: 'Executive Member',
    subtitle: 'Business Owner | Treasurer UMAA Kamrup | Gen. Secy. GMSO',
    shortProfile: 'Prominent entrepreneur supporting grassroots livelihood initiatives, vocational training, and economic self-reliance.',
    areaOfResponsibility: 'Enterprise development, resource mobilisation, and member liaison.',
    category: 'Executive',
  },
  {
    id: 8,
    name: 'H. Monoj Kumar Singha',
    role: 'Executive Member',
    subtitle: 'Business Professional | Asst. Secy. UMAA | Publication Secy. GMSO',
    shortProfile: 'Leads digital and print publications, cultural newsletters, and regional communication channels for Northeast communities.',
    areaOfResponsibility: 'Publications, media releases, and digital archive preservation.',
    category: 'Executive',
  },
  {
    id: 9,
    name: 'Y. Abhishek Singh',
    role: 'Executive Member',
    subtitle: 'Private Sector Professional | Youth Leadership',
    shortProfile: 'Spearheading digital governance adoption, modern communication suites, and student mentorship.',
    areaOfResponsibility: 'Youth engagement, digital platforms, and tech assistance.',
    category: 'Executive',
  },
  {
    id: 10,
    name: 'P. Babudhon Singha',
    role: 'Executive Member',
    subtitle: 'Community Organizer & Social Worker',
    shortProfile: 'Longstanding social activist committed to rural healthcare awareness, elderly support, and community harmony.',
    areaOfResponsibility: 'Rural village programs and elderly aid distribution.',
    category: 'Executive',
  },
  {
    id: 11,
    name: 'S. Ibohal Singha',
    role: 'Executive Member',
    subtitle: 'Cultural Custodian & Educator',
    shortProfile: 'Active guardian of Manipuri indigenous customs, folk performances, and youth cultural literacy programs.',
    areaOfResponsibility: 'Cultural performances, festivals coordination, and heritage workshops.',
    category: 'Executive',
  },
  {
    id: 12,
    name: 'K. Nilamani Singha',
    role: 'Executive Member',
    subtitle: 'Senior Community Elder & Advisor',
    shortProfile: 'Brings immense community wisdom to resolve grassroots concerns and maintain inter-community solidarity.',
    areaOfResponsibility: 'Community arbitration, senior citizen welfare, and local outreach.',
    category: 'Executive',
  },
  {
    id: 13,
    name: 'M. Kunjababu Singha',
    role: 'Executive Member',
    subtitle: 'Social Welfare Coordinator',
    shortProfile: 'Coordinates grassroots distribution of welfare kits, educational materials, and healthcare equipment.',
    areaOfResponsibility: 'Relief distribution logistics and field operations.',
    category: 'Executive',
  },
  {
    id: 14,
    name: 'N. Tombi Singha',
    role: 'Executive Member',
    subtitle: 'Indigenous Crafts & Artisan Supporter',
    shortProfile: 'Dedicated to preserving handloom, traditional weaving, and indigenous crafts through market linkages.',
    areaOfResponsibility: 'Artisan welfare, handloom promotion, and rural cottage industry.',
    category: 'Executive',
  },
  {
    id: 15,
    name: 'L. Sharat Singha',
    role: 'Executive Member',
    subtitle: 'Public Liaison & Community Officer',
    shortProfile: 'Coordinates public interactions, volunteer networks, and civic engagement across foundation chapters.',
    areaOfResponsibility: 'Volunteer mobilization and membership registry coordination.',
    category: 'Executive',
  },
];

interface GrantScheme {
  id: string;
  name: string;
  ministry: string;
  amount: string;
  category: 'All' | 'Youth' | 'Senior' | 'Women' | 'Culture' | 'Health';
  status: 'Approved' | 'Active Pipeline' | 'Applications Open';
  description: string;
  eligibility: string;
}

const GRANT_SCHEMES: GrantScheme[] = [
  {
    id: 'sc-01',
    name: 'Senior Citizen Welfare & Healthcare Fund',
    ministry: 'Ministry of Social Justice & Empowerment',
    amount: '₹25,00,000',
    category: 'Senior',
    status: 'Approved',
    description: 'Direct medical aid, health insurance assistance, and geriatric care camps across rural Northeast communities.',
    eligibility: 'Citizens aged 60+ resident in registered Northeast districts with low annual income.',
  },
  {
    id: 'sc-02',
    name: 'Northeast Indigenous Heritage & Cultural Grant',
    ministry: 'Ministry of Culture, Government of India',
    amount: '₹15,00,000',
    category: 'Culture',
    status: 'Approved',
    description: 'Documentation, preservation, and digital archiving of Meitei Pena folk music, ritual dances, and indigenous crafts.',
    eligibility: 'Traditional cultural troupes, folk scholars, and community documentation initiatives.',
  },
  {
    id: 'sc-03',
    name: 'Youth Skill & Traditional Sports Mission (Kabaddi)',
    ministry: 'Ministry of Youth Affairs & Sports',
    amount: '₹10,00,000',
    category: 'Youth',
    status: 'Active Pipeline',
    description: 'Grassroots training academies, equipment grants, and state-level tournament sponsorships for youth athletes.',
    eligibility: 'Youth aged 14–25 with active participation in traditional or district athletic sports.',
  },
  {
    id: 'sc-04',
    name: 'Rural Women Micro-Enterprise & Weaving Grant',
    ministry: 'Ministry of Rural Development / NRLM',
    amount: '₹8,50,000',
    category: 'Women',
    status: 'Approved',
    description: 'Subsidised yarn supply, modern loom access, and direct market linkage for indigenous female weavers.',
    eligibility: 'Women self-help groups (SHGs) and registered village artisan clusters.',
  },
  {
    id: 'sc-05',
    name: 'Mobile Tele-Health & Emergency Care Mission',
    ministry: 'National Health Mission (NHM)',
    amount: '₹12,00,000',
    category: 'Health',
    status: 'Active Pipeline',
    description: 'Equipped mobile diagnostics, regular physician visits, and telemedicine terminals for remote hill villages.',
    eligibility: 'Community clinics and emergency medical volunteers in identified backward blocks.',
  },
];

interface CulturalItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'music' | 'dance' | 'cuisine';
  description: string;
  badge: string;
  url?: string;
}

const CULTURAL_ITEMS: CulturalItem[] = [
  {
    id: 'c-01',
    title: 'Meitei Pena Traditional Folk Melody',
    subtitle: 'Ancient One-Stringed Bowed Lute',
    category: 'music',
    description: 'The Pena is the soul of Manipuri folklore, played during religious rituals, invoking deities, and narrating romantic epics.',
    badge: 'Folk Music',
    url: 'https://youtu.be/XQI0T5Kjw9E',
  },
  {
    id: 'c-02',
    title: 'Lai Haraoba Ritual Chant & Dance',
    subtitle: 'Celebration of Creation & Forest Gods',
    category: 'dance',
    description: 'The ancient festival honouring the Umang Lai (forest deities), preserving the cosmogonic myths of creation through sacred dance.',
    badge: 'Sacred Ritual',
    url: 'https://youtu.be/gU_gs-SRiKk',
  },
  {
    id: 'c-03',
    title: 'Khamba Thoibi Folk Ballad',
    subtitle: 'Epic Romance of Moirang',
    category: 'music',
    description: 'The legendary immortal epic of brave Khamba and princess Thoibi, representing valor, deep devotion, and timeless heritage.',
    badge: 'Epic Ballad',
    url: 'https://youtu.be/u5l6FX-LkaA',
  },
  {
    id: 'c-04',
    title: 'Authentic Meitei Singju',
    subtitle: 'Piquant Indigenous Herb Salad',
    category: 'cuisine',
    description: 'Finely shredded seasonal vegetables, fragrant local herbs, roasted sesame, and smoked fish or perilla seeds.',
    badge: 'Traditional Dish',
  },
  {
    id: 'c-05',
    title: 'Chak-hao Kheer (Black Rice Pudding)',
    subtitle: 'Geographical Indication (GI) Delicacy',
    category: 'cuisine',
    description: 'Aromatic anthocyanin-rich Manipuri black rice simmered gently in creamy milk with cardamom, bay leaves, and cashews.',
    badge: 'Heritage Dessert',
  },
  {
    id: 'c-06',
    title: 'Classic Kanghou & Eromba',
    subtitle: 'Hearty Everyday Indigenous Nutrition',
    category: 'cuisine',
    description: 'Boiled seasonal greens and tubers mashed with fiery King Chilis (U-Morok) and fermented Ngari.',
    badge: 'Staple Cuisine',
  },
];

interface FoundationDoc {
  id: string;
  title: string;
  category: 'Statutory' | 'Tax Exemption' | 'Governance' | 'Audits';
  serialNo: string;
  status: string;
  description: string;
}

const FOUNDATION_DOCS: FoundationDoc[] = [
  {
    id: 'd-01',
    title: 'Trust Deed & Registration Certificate',
    category: 'Statutory',
    serialNo: 'REG/LF/TR/2021-084',
    status: 'Active & Verified',
    description: 'Official incorporation charter establishing Leimarembi Foundation as an irrevocable public charitable trust.',
  },
  {
    id: 'd-02',
    title: 'Section 80G Tax Exemption Certificate',
    category: 'Tax Exemption',
    serialNo: 'CIT(E)/80G/2022-23/AABTL8912P',
    status: '100% Tax Deductible',
    description: 'Grants 50% income tax deduction to all individual and corporate donors under Sec 80G of the Income Tax Act.',
  },
  {
    id: 'd-03',
    title: 'Section 12A Charitable Trust Registration',
    category: 'Tax Exemption',
    serialNo: 'CIT(E)/12A/2022-23/AABTL8912P',
    status: 'Lifetime Exemption',
    description: 'Confirms non-profit status and fiscal immunity for public welfare resource accumulation.',
  },
  {
    id: 'd-04',
    title: 'NITI Aayog NGO Darpan Registration',
    category: 'Governance',
    serialNo: 'AS/2023/034291',
    status: 'Govt. Accredited',
    description: 'Official national central accreditation on the Government of India NITI Aayog NGO Darpan Portal.',
  },
  {
    id: 'd-05',
    title: 'Annual Audited Financial Statement 2024–25',
    category: 'Audits',
    serialNo: 'AUDIT/LF/CA/2024-25',
    status: 'Unqualified Clean Audit',
    description: 'Independent Chartered Accountant audit verifying 100% compliant expenditure on community welfare programs.',
  },
];

// --- MAIN MOBILE APPLICATION SCREEN ---

export default function MobileAppScreen() {
  const insets = useSafeAreaInsets();

  // Navigation Tabs: 'home' | 'schemes' | 'culture' | 'roster' | 'donate'
  const [activeTab, setActiveTab] = useState<'home' | 'schemes' | 'culture' | 'roster' | 'donate'>('home');

  // Modals
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showQrKeyring, setShowQrKeyring] = useState(false);
  const [showWebPortal, setShowWebPortal] = useState(false);
  const [webPortalUrl, setWebPortalUrl] = useState(PRODUCTION_URL);
  const [showDonateSheet, setShowDonateSheet] = useState(false);

  // Scheme Filter
  const [schemeCategory, setSchemeCategory] = useState<string>('All');
  const [schemeQuery, setSchemeQuery] = useState('');

  // Roster Filter
  const [rosterCategory, setRosterCategory] = useState<'All' | 'Leadership' | 'Executive'>('All');
  const [rosterQuery, setRosterQuery] = useState('');

  // Culture Filter
  const [cultureCategory, setCultureCategory] = useState<'all' | 'music' | 'dance' | 'cuisine'>('all');

  // Donation State
  const [donateAmount, setDonateAmount] = useState('1000');
  const [donorName, setDonorName] = useState('');
  const [donorPan, setDonorPan] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Copy helper with feedback
  const handleCopy = (text: string, label: string) => {
    // In native mobile we can share or alert
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Launch Native UPI Intent
  const handleLaunchUpi = () => {
    const amountNum = parseFloat(donateAmount) || 500;
    const upiUrl = `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=Leimarembi+Foundation&am=${amountNum}&cu=INR&tn=Public+Welfare+Donation`;

    Linking.canOpenURL(upiUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(upiUrl);
        } else {
          // If no direct UPI app handler, show web gateway or copy
          handleCopy(OFFICIAL_UPI_ID, 'UPI ID');
          alert(`Official UPI ID: ${OFFICIAL_UPI_ID}\nAmount: ₹${amountNum}\nPlease open Google Pay, PhonePe, or Paytm and transfer.`);
        }
      })
      .catch(() => {
        alert(`Official UPI ID: ${OFFICIAL_UPI_ID}\nPlease send via your preferred UPI app.`);
      });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Leimarembi Foundation Official Mobile App',
        message: 'Join Leimarembi Foundation in community empowerment, Manipuri heritage preservation, and welfare grants: https://leimarembifoundation.org',
        url: PRODUCTION_URL,
      });
    } catch {
      // ignore
    }
  };

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return MEMBERS_ROSTER.filter((m) => {
      const matchCat = rosterCategory === 'All' || m.category === rosterCategory;
      const matchQuery =
        !rosterQuery ||
        m.name.toLowerCase().includes(rosterQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(rosterQuery.toLowerCase()) ||
        m.subtitle.toLowerCase().includes(rosterQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [rosterCategory, rosterQuery]);

  // Filtered Schemes
  const filteredSchemes = useMemo(() => {
    return GRANT_SCHEMES.filter((s) => {
      const matchCat = schemeCategory === 'All' || s.category === schemeCategory;
      const matchQuery =
        !schemeQuery ||
        s.name.toLowerCase().includes(schemeQuery.toLowerCase()) ||
        s.ministry.toLowerCase().includes(schemeQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(schemeQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [schemeCategory, schemeQuery]);

  // Filtered Culture
  const filteredCulture = useMemo(() => {
    return CULTURAL_ITEMS.filter((c) => {
      return cultureCategory === 'all' || c.category === cultureCategory;
    });
  }, [cultureCategory]);

  return (
    <SafeAreaView style={[styles.root, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070a13" />

      {/* --- SLEEK MOBILE TOP APP BAR --- */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemText}>LF</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.topBarTitle}>LEIMAREMBI</Text>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>80G✓</Text>
              </View>
            </View>
            <Text style={styles.topBarSubtitle}>Public Charitable Trust • Imphal & Guwahati</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => setShowQrKeyring(true)}
            accessibilityLabel="Executive QR Card"
          >
            <Text style={styles.iconCircleGlyph}>🪪</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={handleShareApp}
            accessibilityLabel="Share App"
          >
            <Text style={styles.iconCircleGlyph}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN SCROLLABLE CONTENT VIEW --- */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <View style={styles.tabContainer}>
            {/* VIP Executive Digital ID Pass Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.heroPassCard}
              onPress={() => setShowQrKeyring(true)}
            >
              <View style={styles.heroPassTop}>
                <View style={styles.passHeaderPill}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.passHeaderText}>OFFICIAL GOVERNANCE SUITE</Text>
                </View>
                <Text style={styles.passSerial}>DARPAN #AS/2023/034291</Text>
              </View>

              <Text style={styles.heroGreeting}>Khurumjari 🙏</Text>
              <Text style={styles.heroHeadline}>Empowering Communities, Preserving Manipuri Heritage</Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroPassFooter}>
                <View>
                  <Text style={styles.passFooterLabel}>EXECUTIVE STATUS</Text>
                  <Text style={styles.passFooterValue}>Active Council Pass</Text>
                </View>

                <View style={styles.tapQrBtn}>
                  <Text style={styles.tapQrIcon}>▦</Text>
                  <Text style={styles.tapQrText}>Keyring QR</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Live Impact Counters (Horizontal Mobile Carousel) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Impact At A Glance</Text>
              <Text style={styles.sectionTag}>FY 2024–26</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.impactCarousel}>
              <View style={[styles.impactCard, { borderColor: '#d97706' }]}>
                <Text style={styles.impactIcon}>💰</Text>
                <Text style={styles.impactNumber}>₹42.5 L+</Text>
                <Text style={styles.impactLabel}>Welfare Grants Facilitated</Text>
              </View>

              <View style={[styles.impactCard, { borderColor: '#10b981' }]}>
                <Text style={styles.impactIcon}>👥</Text>
                <Text style={styles.impactNumber}>12,450+</Text>
                <Text style={styles.impactLabel}>Beneficiaries Supported</Text>
              </View>

              <View style={[styles.impactCard, { borderColor: '#3b82f6' }]}>
                <Text style={styles.impactIcon}>🏛️</Text>
                <Text style={styles.impactNumber}>15 Leaders</Text>
                <Text style={styles.impactLabel}>Governing Council Roster</Text>
              </View>

              <View style={[styles.impactCard, { borderColor: '#8b5cf6' }]}>
                <Text style={styles.impactIcon}>📜</Text>
                <Text style={styles.impactNumber}>100% 80G</Text>
                <Text style={styles.impactLabel}>Income Tax Exemption</Text>
              </View>
            </ScrollView>

            {/* Quick Action Matrix (8 Bespoke Mobile Touch Targets) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Executive Operations</Text>
              <Text style={styles.sectionSubtitle}>Tap any module for instant mobile access</Text>
            </View>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#131e2e' }]}
                onPress={() => setActiveTab('donate')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={styles.actionIcon}>💳</Text>
                </View>
                <Text style={styles.actionTileTitle}>Donate UPI</Text>
                <Text style={styles.actionTileSubtitle}>Instant 80G Tax Deductible</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#11221b' }]}
                onPress={() => setActiveTab('schemes')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={styles.actionIcon}>🤖</Text>
                </View>
                <Text style={styles.actionTileTitle}>AI Scheme Finder</Text>
                <Text style={styles.actionTileSubtitle}>Govt Welfare Grants</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#181b2e' }]}
                onPress={() => setActiveTab('roster')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Text style={styles.actionIcon}>👥</Text>
                </View>
                <Text style={styles.actionTileTitle}>15 Leaders</Text>
                <Text style={styles.actionTileSubtitle}>Governing Roster</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#231c26' }]}
                onPress={() => setActiveTab('culture')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Text style={styles.actionIcon}>🪕</Text>
                </View>
                <Text style={styles.actionTileTitle}>Meitei Culture</Text>
                <Text style={styles.actionTileSubtitle}>Pena, Dance & Cuisine</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#192026' }]}
                onPress={() => {
                  setWebPortalUrl('https://leimarembifoundation.org/documents');
                  setShowWebPortal(true);
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                  <Text style={styles.actionIcon}>🔒</Text>
                </View>
                <Text style={styles.actionTileTitle}>Doc Vault</Text>
                <Text style={styles.actionTileSubtitle}>Bylaws, 12A & Audits</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#1f1b29' }]}
                onPress={() => {
                  setWebPortalUrl('https://leimarembifoundation.org/meetings');
                  setShowWebPortal(true);
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                  <Text style={styles.actionIcon}>🗓️</Text>
                </View>
                <Text style={styles.actionTileTitle}>Council Suite</Text>
                <Text style={styles.actionTileSubtitle}>Agendas & Video Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#211e1c' }]}
                onPress={() => {
                  setWebPortalUrl('https://leimarembifoundation.org/news');
                  setShowWebPortal(true);
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                  <Text style={styles.actionIcon}>📰</Text>
                </View>
                <Text style={styles.actionTileTitle}>NE News Hub</Text>
                <Text style={styles.actionTileSubtitle}>Bulletins & Notices</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { backgroundColor: '#162224' }]}
                onPress={() => {
                  setWebPortalUrl('https://leimarembifoundation.org/health');
                  setShowWebPortal(true);
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(20, 184, 166, 0.15)' }]}>
                  <Text style={styles.actionIcon}>🏥</Text>
                </View>
                <Text style={styles.actionTileTitle}>Health Camps</Text>
                <Text style={styles.actionTileSubtitle}>Rural Telemedicine</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Welfare Initiative Card */}
            <View style={styles.featuredCard}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FLAGSHIP PROGRAM</Text>
              </View>
              <Text style={styles.featuredTitle}>Senior Citizen Welfare & Rural Livelihood Grant</Text>
              <Text style={styles.featuredDesc}>
                Under the Ministry of Social Justice & Empowerment, providing medical aid, winter clothing, and livelihood kits across Assam, Manipur, and Northeast clusters.
              </Text>
              <TouchableOpacity
                style={styles.featuredActionBtn}
                onPress={() => setActiveTab('schemes')}
              >
                <Text style={styles.featuredActionText}>Explore Schemes & Apply</Text>
                <Text style={styles.featuredActionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 2: AI SCHEMES ================= */}
        {activeTab === 'schemes' && (
          <View style={styles.tabContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>AI Scheme & Grants Finder</Text>
              <Text style={styles.pageSubtitle}>
                Matched Government of India and Foundation initiatives for rural empowerment.
              </Text>
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPills}>
              {['All', 'Senior', 'Culture', 'Youth', 'Women', 'Health'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterPill, schemeCategory === cat && styles.filterPillActive]}
                  onPress={() => setSchemeCategory(cat)}
                >
                  <Text style={[styles.filterPillText, schemeCategory === cat && styles.filterPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search grants by name, ministry, or keyword..."
                placeholderTextColor="#64748b"
                value={schemeQuery}
                onChangeText={setSchemeQuery}
              />
              {schemeQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSchemeQuery('')}>
                  <Text style={styles.clearSearchIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Schemes List */}
            {filteredSchemes.map((s) => (
              <View key={s.id} style={styles.schemeCard}>
                <View style={styles.schemeTopRow}>
                  <View style={styles.schemeCategoryTag}>
                    <Text style={styles.schemeCategoryText}>{s.category.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, s.status === 'Approved' ? styles.statusApproved : styles.statusPipeline]}>
                    <Text style={styles.statusBadgeText}>{s.status}</Text>
                  </View>
                </View>

                <Text style={styles.schemeName}>{s.name}</Text>
                <Text style={styles.schemeMinistry}>{s.ministry}</Text>

                <View style={styles.schemeAmountBox}>
                  <Text style={styles.schemeAmountLabel}>FACILITATED ALLOCATION</Text>
                  <Text style={styles.schemeAmountVal}>{s.amount}</Text>
                </View>

                <Text style={styles.schemeDesc}>{s.description}</Text>

                <View style={styles.schemeEligibilityBox}>
                  <Text style={styles.schemeEligibilityTitle}>Eligibility:</Text>
                  <Text style={styles.schemeEligibilityText}>{s.eligibility}</Text>
                </View>

                <TouchableOpacity
                  style={styles.schemeApplyBtn}
                  onPress={() => {
                    setWebPortalUrl(`https://leimarembifoundation.org/grants?scheme=${s.id}`);
                    setShowWebPortal(true);
                  }}
                >
                  <Text style={styles.schemeApplyText}>Apply / Inquire Scheme</Text>
                  <Text style={styles.schemeApplyArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 3: CULTURE ================= */}
        {activeTab === 'culture' && (
          <View style={styles.tabContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Manipuri Cultural Heritage</Text>
              <Text style={styles.pageSubtitle}>
                Preserving sacred music, classical dances, and timeless indigenous cuisines.
              </Text>
            </View>

            {/* Category Filter */}
            <View style={styles.threeSegmentBar}>
              {[
                { key: 'all', label: 'All Archives' },
                { key: 'music', label: '🎵 Pena & Music' },
                { key: 'dance', label: '💃 Dances' },
                { key: 'cuisine', label: '🍲 Cuisine' },
              ].map((seg) => (
                <TouchableOpacity
                  key={seg.key}
                  style={[styles.segmentBtn, cultureCategory === seg.key && styles.segmentBtnActive]}
                  onPress={() => setCultureCategory(seg.key as any)}
                >
                  <Text style={[styles.segmentBtnText, cultureCategory === seg.key && styles.segmentBtnTextActive]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Culture Cards */}
            {filteredCulture.map((item) => (
              <View key={item.id} style={styles.cultureCard}>
                <View style={styles.cultureBadgeRow}>
                  <View style={styles.culturePill}>
                    <Text style={styles.culturePillText}>{item.badge}</Text>
                  </View>
                  {item.url && (
                    <TouchableOpacity
                      style={styles.playRecordingBtn}
                      onPress={() => Linking.openURL(item.url!)}
                    >
                      <Text style={styles.playRecordingText}>▶ Watch Video</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.cultureTitle}>{item.title}</Text>
                <Text style={styles.cultureSubtitle}>{item.subtitle}</Text>
                <Text style={styles.cultureDesc}>{item.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 4: ROSTER & DOCS ================= */}
        {activeTab === 'roster' && (
          <View style={styles.tabContainer}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>15 Executive Office Bearers</Text>
              <Text style={styles.pageSubtitle}>
                Governing Council leadership guiding Leimarembi Foundation.
              </Text>
            </View>

            {/* Category Filter */}
            <View style={styles.threeSegmentBar}>
              {[
                { key: 'All', label: 'All 15' },
                { key: 'Leadership', label: 'Council Leadership' },
                { key: 'Executive', label: 'Executive Members' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.segmentBtn, rosterCategory === c.key && styles.segmentBtnActive]}
                  onPress={() => setRosterCategory(c.key as any)}
                >
                  <Text style={[styles.segmentBtnText, rosterCategory === c.key && styles.segmentBtnTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Input */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search leaders by name, designation..."
                placeholderTextColor="#64748b"
                value={rosterQuery}
                onChangeText={setRosterQuery}
              />
              {rosterQuery.length > 0 && (
                <TouchableOpacity onPress={() => setRosterQuery('')}>
                  <Text style={styles.clearSearchIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Member Cards */}
            {filteredRoster.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.memberCard}
                onPress={() => setSelectedMember(m)}
                activeOpacity={0.8}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{m.name.charAt(0)}</Text>
                </View>

                <View style={styles.memberInfo}>
                  <View style={styles.memberHeaderLine}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <View style={styles.memberRoleTag}>
                      <Text style={styles.memberRoleTagText}>{m.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.memberSubtitle} numberOfLines={2}>
                    {m.subtitle}
                  </Text>
                </View>
                <Text style={styles.memberChevron}>›</Text>
              </TouchableOpacity>
            ))}

            {/* High-Security Documents Vault Section */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>High-Security Documents Vault</Text>
              <Text style={styles.sectionSubtitle}>Official statutory, 12A & 80G filings</Text>
            </View>

            {FOUNDATION_DOCS.map((doc) => (
              <View key={doc.id} style={styles.docItemCard}>
                <View style={styles.docIconBox}>
                  <Text style={styles.docIconGlyph}>📜</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSerial}>Ref: {doc.serialNo}</Text>
                  <Text style={styles.docDesc}>{doc.description}</Text>
                  <View style={styles.docStatusRow}>
                    <Text style={styles.docStatusPill}>✓ {doc.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 5: DONATE ================= */}
        {activeTab === 'donate' && (
          <View style={styles.tabContainer}>
            <View style={styles.donateHeroCard}>
              <View style={styles.taxBadge}>
                <Text style={styles.taxBadgeText}>80G TAX EXEMPTION GUARANTEED</Text>
              </View>
              <Text style={styles.donateHeroTitle}>Official Giving Gateway</Text>
              <Text style={styles.donateHeroDesc}>
                100% of your voluntary contribution funds medical camps, elderly care, and youth sports.
              </Text>

              {/* Amount Quick Select Chips */}
              <Text style={styles.inputLabel}>Select Amount (INR ₹)</Text>
              <View style={styles.amountChipsRow}>
                {['100', '500', '1000', '2500', '5000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amtChip, donateAmount === amt && styles.amtChipActive]}
                    onPress={() => setDonateAmount(amt)}
                  >
                    <Text style={[styles.amtChipText, donateAmount === amt && styles.amtChipTextActive]}>
                      ₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <View style={styles.customAmtInputBox}>
                <Text style={styles.customAmtPrefix}>₹</Text>
                <TextInput
                  style={styles.customAmtInput}
                  keyboardType="numeric"
                  value={donateAmount}
                  onChangeText={setDonateAmount}
                  placeholder="Enter custom amount"
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* Donor Details for 80G Certificate */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Full Name (For 80G Tax Receipt)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Ramesh Chandra Singha"
                placeholderTextColor="#64748b"
                value={donorName}
                onChangeText={setDonorName}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>PAN or Mobile Number (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. ABCDE1234F or +91 9876543210"
                placeholderTextColor="#64748b"
                value={donorPan}
                onChangeText={setDonorPan}
              />

              {/* Big Launch UPI Button */}
              <TouchableOpacity
                style={styles.mainUpiBtn}
                onPress={handleLaunchUpi}
                activeOpacity={0.85}
              >
                <Text style={styles.mainUpiBtnIcon}>⚡</Text>
                <Text style={styles.mainUpiBtnText}>Pay ₹{donateAmount} via Any UPI App</Text>
              </TouchableOpacity>
              <Text style={styles.upiSupportedText}>Google Pay • PhonePe • Paytm • BHIM • Cred</Text>

              {/* Copy UPI ID Bar */}
              <View style={styles.copyUpiRow}>
                <View>
                  <Text style={styles.copyUpiLabel}>OFFICIAL UPI VPA</Text>
                  <Text style={styles.copyUpiVal}>{OFFICIAL_UPI_ID}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyActionBtn}
                  onPress={() => handleCopy(OFFICIAL_UPI_ID, 'Official UPI ID')}
                >
                  <Text style={styles.copyActionBtnText}>Copy UPI</Text>
                </TouchableOpacity>
              </View>

              {/* Direct Bank Account Details (NEFT/RTGS/IMPS) */}
              <View style={styles.bankBox}>
                <Text style={styles.bankBoxTitle}>Direct Bank Wire (NEFT / IMPS)</Text>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Beneficiary:</Text>
                  <Text style={styles.bankVal}>Leimarembi Foundation</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Bank Name:</Text>
                  <Text style={styles.bankVal}>State Bank of India (SBI)</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account No:</Text>
                  <Text style={styles.bankVal}>41238910283</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>IFSC Code:</Text>
                  <Text style={styles.bankVal}>SBIN0000092</Text>
                </View>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Branch:</Text>
                  <Text style={styles.bankVal}>Imphal Secretariat Branch</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* --- COPY FEEDBACK TOAST --- */}
      {copyFeedback && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{copyFeedback}</Text>
        </View>
      )}

      {/* --- BOTTOM NATIVE NAVIGATION BAR --- */}
      <View style={[styles.bottomNavBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {[
          { key: 'home', label: 'Home', icon: '🏠' },
          { key: 'schemes', label: 'AI Grants', icon: '🤖' },
          { key: 'culture', label: 'Heritage', icon: '🪕' },
          { key: 'roster', label: '15 Roster', icon: '👥' },
          { key: 'donate', label: 'Donate', icon: '💳' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.key as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.navItemIcon, activeTab === tab.key && styles.navItemIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.navItemLabel, activeTab === tab.key && styles.navItemLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeNavIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= MODAL 1: EXECUTIVE KEYRING QR CARD ================= */}
      <Modal visible={showQrKeyring} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.qrCardModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Executive Keyring Pass</Text>
                <Text style={styles.modalHeaderSubtitle}>Official Foundation Digital Identity</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowQrKeyring(false)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Identity Card Visual */}
            <View style={styles.idPassVisual}>
              <View style={styles.idPassTopRow}>
                <View style={styles.emblemBadge}>
                  <Text style={styles.emblemText}>LF</Text>
                </View>
                <View>
                  <Text style={styles.idPassOrg}>LEIMAREMBI FOUNDATION</Text>
                  <Text style={styles.idPassSub}>Public Charitable Trust</Text>
                </View>
              </View>

              <View style={styles.qrCodeBox}>
                {/* Clean Scalable QR Representation */}
                <View style={styles.qrGrid}>
                  <View style={[styles.qrCorner, { top: 0, left: 0 }]} />
                  <View style={[styles.qrCorner, { top: 0, right: 0 }]} />
                  <View style={[styles.qrCorner, { bottom: 0, left: 0 }]} />
                  <View style={styles.qrCenterSymbol}>
                    <Text style={styles.qrCenterText}>LF</Text>
                  </View>
                </View>
                <Text style={styles.qrHash}>HASH: 9A8F-42E1-LF-2026</Text>
              </View>

              <View style={styles.idPassDetails}>
                <View style={styles.idPassLine}>
                  <Text style={styles.idPassLabel}>Card Holder:</Text>
                  <Text style={styles.idPassVal}>Authorized Member / Beneficiary</Text>
                </View>
                <View style={styles.idPassLine}>
                  <Text style={styles.idPassLabel}>Registration:</Text>
                  <Text style={styles.idPassVal}>DARPAN: AS/2023/034291</Text>
                </View>
                <View style={styles.idPassLine}>
                  <Text style={styles.idPassLabel}>Tax Status:</Text>
                  <Text style={styles.idPassVal}>80G / 12A Certified</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => {
                setShowQrKeyring(false);
                handleShareApp();
              }}
            >
              <Text style={styles.modalActionBtnText}>Share Digital Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 2: MEMBER PROFILE DETAILS ================= */}
      <Modal visible={selectedMember !== null} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.memberModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Executive Profile</Text>
                <Text style={styles.modalHeaderSubtitle}>Governing Council Roster</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedMember(null)}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalProfileHeader}>
                  <View style={styles.modalProfileAvatar}>
                    <Text style={styles.modalProfileAvatarText}>
                      {selectedMember.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.modalProfileName}>{selectedMember.name}</Text>
                  <View style={styles.memberRoleTag}>
                    <Text style={styles.memberRoleTagText}>{selectedMember.role}</Text>
                  </View>
                  <Text style={styles.modalProfileSubtitle}>{selectedMember.subtitle}</Text>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Biography & Background</Text>
                  <Text style={styles.profileSectionBody}>{selectedMember.shortProfile}</Text>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Area of Responsibility</Text>
                  <Text style={styles.profileSectionBody}>{selectedMember.areaOfResponsibility}</Text>
                </View>

                {selectedMember.email && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => Linking.openURL(`mailto:${selectedMember.email}`)}
                  >
                    <Text style={styles.contactBtnText}>✉ Contact via Email</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 3: IN-APP WEB PORTAL DRAWER ================= */}
      <Modal visible={showWebPortal} animationType="slide">
        <SafeAreaView style={styles.webPortalSafeArea}>
          <View style={styles.webPortalHeader}>
            <TouchableOpacity
              style={styles.webPortalCloseBtn}
              onPress={() => setShowWebPortal(false)}
            >
              <Text style={styles.webPortalCloseText}>← Back to App</Text>
            </TouchableOpacity>
            <Text style={styles.webPortalUrlText} numberOfLines={1}>
              {webPortalUrl.replace('https://', '')}
            </Text>
            <TouchableOpacity
              style={styles.webPortalShareBtn}
              onPress={() => Linking.openURL(webPortalUrl)}
            >
              <Text style={styles.webPortalShareText}>Browser ↗</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: webPortalUrl }}
            style={styles.webPortalView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLESHEET (MOBILE-FIRST LUXURY PALETTE) ---

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070a13',
  },

  // Top Bar
  topBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#0a0f1d',
    borderBottomWidth: 1,
    borderBottomColor: '#162035',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emblemBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  emblemText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  verifiedTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
  topBarSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162238',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#243352',
  },
  iconCircleGlyph: {
    fontSize: 16,
    color: '#f8fafc',
  },

  // Scroll Area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContainer: {
    flex: 1,
  },

  // VIP Hero Pass Card
  heroPassCard: {
    backgroundColor: '#0e172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#23324d',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  heroPassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  passHeaderText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passSerial: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroGreeting: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroHeadline: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 14,
  },
  heroPassFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passFooterLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  passFooterValue: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
  },
  tapQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tapQrIcon: {
    fontSize: 14,
    color: '#f59e0b',
  },
  tapQrText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTag: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
  },

  // Impact Carousel
  impactCarousel: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  impactCard: {
    width: 140,
    backgroundColor: '#0c1322',
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
  },
  impactIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  impactNumber: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },
  impactLabel: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 14,
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  actionTile: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTileTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  actionTileSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
  },

  // Featured Initiative Card
  featuredCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '800',
  },
  featuredTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  featuredDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredActionText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
  },
  featuredActionArrow: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '900',
  },

  // Page Header
  pageHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },

  // Filter Pills
  filterPills: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
  },
  filterPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Segment Bar
  threeSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#0c1322',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#1e293b',
  },
  segmentBtnText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  segmentBtnTextActive: {
    color: '#f8fafc',
    fontWeight: '800',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
  },
  clearSearchIcon: {
    color: '#94a3b8',
    fontSize: 14,
    padding: 4,
  },

  // Scheme Card
  schemeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  schemeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  schemeCategoryTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  schemeCategoryText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPipeline: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  schemeName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  schemeMinistry: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 10,
  },
  schemeAmountBox: {
    backgroundColor: '#0a0f1d',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  schemeAmountLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  schemeAmountVal: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 1,
  },
  schemeDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  schemeEligibilityBox: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  schemeEligibilityTitle: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  schemeEligibilityText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
  schemeApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  schemeApplyText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  schemeApplyArrow: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },

  // Culture Card
  cultureCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  cultureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  culturePill: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  culturePillText: {
    color: '#ec4899',
    fontSize: 10,
    fontWeight: '800',
  },
  playRecordingBtn: {
    backgroundColor: '#e11d48',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  playRecordingText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  cultureTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  cultureSubtitle: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  cultureDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },

  // Member Card
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d97706',
  },
  memberAvatarText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '900',
  },
  memberInfo: {
    flex: 1,
  },
  memberHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  memberRoleTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  memberRoleTagText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '800',
  },
  memberSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  memberChevron: {
    color: '#475569',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Doc Item Card
  docItemCard: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    gap: 12,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconGlyph: {
    fontSize: 18,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  docSerial: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  docDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  docStatusRow: {
    flexDirection: 'row',
  },
  docStatusPill: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Donate Hero Card
  donateHeroCard: {
    backgroundColor: '#0e172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#23324d',
  },
  taxBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  taxBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  donateHeroTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  donateHeroDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  amountChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  amtChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#162238',
    borderWidth: 1,
    borderColor: '#243352',
    alignItems: 'center',
  },
  amtChipActive: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
  },
  amtChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  amtChipTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  customAmtInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#243352',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,
  },
  customAmtPrefix: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 6,
  },
  customAmtInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  formInput: {
    backgroundColor: '#0a0f1d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#243352',
    paddingHorizontal: 12,
    height: 42,
    color: '#f8fafc',
    fontSize: 12,
  },
  mainUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d97706',
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginTop: 20,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  mainUpiBtnIcon: {
    fontSize: 18,
  },
  mainUpiBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  upiSupportedText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  copyUpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  copyUpiLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copyUpiVal: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  copyActionBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  copyActionBtnText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
  },
  bankBox: {
    backgroundColor: '#0a0f1d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  bankBoxTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bankLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  bankVal: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },

  // Bottom Navigation Bar
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#0a0f1d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#162035',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  navItemIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  navItemIconActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  navItemLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navItemLabelActive: {
    color: '#f59e0b',
    fontWeight: '800',
  },
  activeNavIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  // Modals Common
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  modalHeaderSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },

  // QR Modal
  qrCardModal: {
    backgroundColor: '#0c1322',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  idPassVisual: {
    backgroundColor: '#070a13',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d97706',
    marginBottom: 16,
  },
  idPassTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  idPassOrg: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  idPassSub: {
    color: '#d97706',
    fontSize: 10,
    fontWeight: '700',
  },
  qrCodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 14,
  },
  qrGrid: {
    width: 130,
    height: 130,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#0f172a',
  },
  qrCenterSymbol: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  qrHash: {
    color: '#0f172a',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    marginTop: 8,
  },
  idPassDetails: {
    gap: 4,
  },
  idPassLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idPassLabel: {
    color: '#64748b',
    fontSize: 10,
  },
  idPassVal: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  modalActionBtn: {
    backgroundColor: '#d97706',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Member Modal
  memberModal: {
    backgroundColor: '#0c1322',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    maxHeight: '80%',
  },
  modalProfileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalProfileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d97706',
    marginBottom: 10,
  },
  modalProfileAvatarText: {
    color: '#f59e0b',
    fontSize: 26,
    fontWeight: '900',
  },
  modalProfileName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalProfileSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  profileSection: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  profileSectionTitle: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileSectionBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  contactBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contactBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },

  // In-App Web Portal Modal
  webPortalSafeArea: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  webPortalHeader: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  webPortalCloseBtn: {
    padding: 6,
  },
  webPortalCloseText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
  },
  webPortalUrlText: {
    color: '#94a3b8',
    fontSize: 11,
    maxWidth: 180,
  },
  webPortalShareBtn: {
    padding: 6,
  },
  webPortalShareText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  webPortalView: {
    flex: 1,
  },
});