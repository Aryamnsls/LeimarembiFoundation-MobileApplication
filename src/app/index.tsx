import React, { useRef, useState, useEffect, useCallback, useMemo, useDeferredValue, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  BackHandler,
  Platform,
  StatusBar,
  TouchableOpacity,
  Share,
  Linking,
  ToastAndroid,
  Animated,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import * as WebBrowser from 'expo-web-browser';
import { BrandColors } from '../constants/theme';
import {
  initDatabase,
  saveUser,
  saveDonation,
  logActivity,
  getCachedMembers,
  CachedMember,
} from '../services/database';

// Safely resolve native WebView
let NativeWebView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rnw = require('react-native-webview');
  NativeWebView = rnw.WebView || rnw.default;
} catch {
  NativeWebView = null;
}

const PRODUCTION_URL = 'https://leimarembifoundation.org/?direct=1';

// Standard mobile browser user-agent to avoid desktop misclassification and Google OAuth blocks
const CHROME_MOBILE_UA = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  default: undefined,
});

// Official logo image asset
const LEIMAREMBI_LOGO = require('../../assets/images/leimarembi_official_logo.png');

const EMERGENCY_HOTLINES = [
  { label: 'Guwahati Head Office (Primary)', phone: '+919707499079' },
  { label: 'General Administration', phone: '+918134997237' },
  { label: 'Trustee Emergency Support', phone: '+917637087931' },
  { label: 'Welfare & Health Helpline', phone: '+919864801906' },
];

const BLOOD_GROUPS = ['All', 'O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

// Injected responsive script:
// 1. Fluid viewport (width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover)
// 2. Restricts sensitive auth bridging & password enhancers exclusively to trusted first-party domains
// 3. Handles login / portal session synchronization
// 4. Injects CSS to optimize mobile layout and prevent horizontal overflow
// 5. Accessible password eye toggle with right padding & real-time strength meter (Text-based, zero emoji)
// 6. Anti-duplicate submission debouncing for mobile buttons
// 7. Throttled MutationObserver (180ms) with re-entrancy / mutation loop protection
const INJECTED_RESPONSIVE_SCRIPT = `
(function() {
  try {
    // ─── 1. STANDARD 100% FLUID MOBILE VIEWPORT ───
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta && document.head) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Ensure 100% fluid width and prevent horizontal scrolling
    if (document.documentElement) {
      document.documentElement.style.width = '100%';
      document.documentElement.style.maxWidth = '100%';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
    }
    if (document.body) {
      document.body.style.width = '100%';
      document.body.style.maxWidth = '100%';
      document.body.style.overflowX = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }

    // ─── 2. DOMAIN SECURITY CHECK: RESTRICT TO TRUSTED FIRST-PARTY DOMAINS ───
    var host = (window.location.hostname || '').toLowerCase();
    var isFirstParty =
      host === 'leimarembifoundation.org' ||
      host.endsWith('.leimarembifoundation.org') ||
      host === 'localhost' ||
      host === '127.0.0.1';

    if (!isFirstParty) {
      // Do not inject authentication bridges, storage interceptors, or form analyzers into third-party origins
      return;
    }

    // ─── 3. MOBILE POLISH STYLES (HEADER & OVERFLOW) ───
    var styleId = 'lf-mobile-polish-styles';
    if (!document.getElementById(styleId) && document.head) {
      var style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = [
        'html, body { overflow-x: hidden !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }',
        '* { -webkit-tap-highlight-color: transparent !important; }',
        'header.header, .header { width: 100% !important; max-width: 100% !important; padding: 4px 8px !important; box-sizing: border-box !important; }',
        '.header-content { padding: 0 4px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; height: 50px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }',
        '.logo-container { gap: 6px !important; display: flex !important; align-items: center !important; min-width: 0 !important; }',
        '.logo-container img { width: 32px !important; height: 32px !important; flex-shrink: 0 !important; }',
        '.logo-container .logo-text { font-size: 0.80rem !important; font-weight: 800 !important; line-height: 1.15 !important; }',
        'input[type="password"], input[data-is-password="true"] { padding-right: 54px !important; }'
      ].join('\\n');
      document.head.appendChild(style);
    }

    // ─── 4. AUTHENTICATION WATCHER & SESSION SYNC ───
    var isRedirecting = false;
    function handleAuthSuccess(token, user) {
      if (!token || isRedirecting) return;
      try {
        var expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = 'lf_token=' + token + '; path=/; expires=' + expires + '; SameSite=Lax; Secure';
        document.cookie = 'lf_token=' + token + '; path=/; max-age=604800; SameSite=Lax';

        var targetPath = '/portal';
        var u = user;
        if (!u) {
          try {
            var uStr = localStorage.getItem('lf_user');
            if (uStr) u = JSON.parse(uStr);
          } catch(err) {}
        }
        if (u) {
          var r = (u.role || '').toUpperCase();
          var e = (u.email || '').toLowerCase();
          if (r === 'SUPER_ADMIN' || e === 'aryamansingha60@gmail.com' || e === 'binababu.singha@yahoo.com') {
            targetPath = '/superadmin';
          } else if (r === 'ADMIN') {
            targetPath = '/management';
          }
        }
        var searchParams = new URLSearchParams(window.location.search);
        var redirectParam = searchParams.get('redirect');
        if (redirectParam && redirectParam.startsWith('/')) {
          targetPath = redirectParam;
        }
        var currentPath = window.location.pathname;
        if (currentPath.indexOf('/login') !== -1 || currentPath.indexOf('/register') !== -1) {
          isRedirecting = true;
          setTimeout(function() {
            window.location.href = targetPath;
          }, 100);
        }
      } catch(err) {}
    }

    // ─── 5. PASSWORD VISIBILITY TOGGLE & STRENGTH METER ENHANCER ───
    var isEnhancing = false;
    function enhancePasswordFields() {
      if (isEnhancing) return;
      isEnhancing = true;
      try {
        var pwdInputs = document.querySelectorAll('input[type="password"], input[data-is-password="true"]');
        pwdInputs.forEach(function(input) {
          if (input.getAttribute('data-lf-pwd-enhanced') === 'true') return;
          input.setAttribute('data-lf-pwd-enhanced', 'true');
          input.style.paddingRight = '54px';

          var parent = input.parentElement;
          if (!parent) return;
          if (window.getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
          }

          // Clean, accessible text-based toggle button (Zero emoji, avoids duplicate if portal provides one)
          var existingBtn = parent.querySelector('button[aria-label*="password" i], button.lf-eye-toggle, [data-password-toggle]');
          if (!existingBtn) {
            var toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'lf-eye-toggle';
            toggleBtn.setAttribute('aria-label', 'Show password');
            toggleBtn.innerText = 'Show';
            toggleBtn.style.cssText = 'position:absolute; right:8px; top:50%; transform:translateY(-50%); background:#F1F5F9; border:1px solid #CBD5E1; border-radius:6px; cursor:pointer; padding:4px 8px; font-size:11px; font-weight:700; color:#475569; z-index:10;';
            toggleBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerText = 'Hide';
                toggleBtn.setAttribute('aria-label', 'Hide password');
              } else {
                input.type = 'password';
                toggleBtn.innerText = 'Show';
                toggleBtn.setAttribute('aria-label', 'Show password');
              }
            });
            parent.appendChild(toggleBtn);
          }

          // Check if this input belongs to a registration form
          var isRegisterForm = false;
          var form = input.closest('form');
          var placeholder = (input.placeholder || '').toLowerCase();
          var nameAttr = (input.name || '').toLowerCase();
          if (placeholder.indexOf('create') !== -1 || placeholder.indexOf('register') !== -1 || placeholder.indexOf('strong') !== -1 || nameAttr.indexOf('reg') !== -1) {
            isRegisterForm = true;
          }
          if (form && (form.innerText.indexOf('Register') !== -1 || form.innerText.indexOf('Create Membership') !== -1 || form.innerText.indexOf('Blood Group') !== -1)) {
            isRegisterForm = true;
          }

          if (isRegisterForm && !parent.parentNode.querySelector('.lf-pwd-meter-box')) {
            var meterBox = document.createElement('div');
            meterBox.className = 'lf-pwd-meter-box';
            meterBox.style.cssText = 'margin-top:6px; padding:8px 10px; background:rgba(0,0,0,0.03); border-radius:8px; border:1px solid rgba(0,0,0,0.1); font-family:system-ui,-apple-system,sans-serif;';
            meterBox.innerHTML = [
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">',
              '  <span style="font-size:11px; font-weight:700; color:#475569;">Password Security:</span>',
              '  <span class="lf-strength-badge" style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:6px; background:rgba(0,0,0,0.06); color:#64748B; border:1px solid rgba(0,0,0,0.1);">Enter Password</span>',
              '</div>',
              '<div style="display:flex; gap:4px; height:4px; margin-bottom:6px;">',
              '  <div class="lf-bar-1" style="flex:1; border-radius:2px; background:rgba(0,0,0,0.1); transition:background 0.25s;"></div>',
              '  <div class="lf-bar-2" style="flex:1; border-radius:2px; background:rgba(0,0,0,0.1); transition:background 0.25s;"></div>',
              '  <div class="lf-bar-3" style="flex:1; border-radius:2px; background:rgba(0,0,0,0.1); transition:background 0.25s;"></div>',
              '</div>',
              '<div style="display:flex; flex-wrap:wrap; gap:4px; font-size:10px; margin-bottom:4px;">',
              '  <span class="lf-chk-len" style="padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.06); color:#64748B;">8+ Chars</span>',
              '  <span class="lf-chk-up" style="padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.06); color:#64748B;">Uppercase</span>',
              '  <span class="lf-chk-num" style="padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.06); color:#64748B;">Number</span>',
              '  <span class="lf-chk-sym" style="padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.06); color:#64748B;">Symbol</span>',
              '</div>',
              '<div class="lf-strength-msg" style="font-size:10px; color:#64748B; font-weight:600;">Minimum 8 characters, uppercase letter, number and symbol</div>'
            ].join('');

            parent.parentNode.insertBefore(meterBox, parent.nextSibling);

            function updateStrength() {
              var val = input.value || '';
              if (!val) {
                var badge = meterBox.querySelector('.lf-strength-badge');
                var bar1 = meterBox.querySelector('.lf-bar-1');
                var bar2 = meterBox.querySelector('.lf-bar-2');
                var bar3 = meterBox.querySelector('.lf-bar-3');
                var msg = meterBox.querySelector('.lf-strength-msg');
                if (badge) { badge.innerText = 'Enter Password'; badge.style.color = '#64748B'; badge.style.background = 'rgba(0,0,0,0.06)'; badge.style.borderColor = 'rgba(0,0,0,0.1)'; }
                if (bar1) bar1.style.background = 'rgba(0,0,0,0.1)';
                if (bar2) bar2.style.background = 'rgba(0,0,0,0.1)';
                if (bar3) bar3.style.background = 'rgba(0,0,0,0.1)';
                if (msg) { msg.innerText = 'Minimum 8 characters, uppercase letter, number and symbol'; msg.style.color = '#64748B'; }
                return;
              }

              var hasLen = val.length >= 8;
              var hasUp = /[A-Z]/.test(val);
              var hasNum = /[0-9]/.test(val);
              var hasSym = /[^A-Za-z0-9]/.test(val);

              var score = 0;
              if (val.length >= 6) score++;
              if (hasLen) score++;
              if (hasUp) score++;
              if (hasNum) score++;
              if (hasSym) score++;

              var badge2 = meterBox.querySelector('.lf-strength-badge');
              var bar12 = meterBox.querySelector('.lf-bar-1');
              var bar22 = meterBox.querySelector('.lf-bar-2');
              var bar32 = meterBox.querySelector('.lf-bar-3');
              var chkLen = meterBox.querySelector('.lf-chk-len');
              var chkUp = meterBox.querySelector('.lf-chk-up');
              var chkNum = meterBox.querySelector('.lf-chk-num');
              var chkSym = meterBox.querySelector('.lf-chk-sym');
              var msg2 = meterBox.querySelector('.lf-strength-msg');

              if (chkLen) { chkLen.innerText = '8+ Chars'; chkLen.style.background = hasLen ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.06)'; chkLen.style.color = hasLen ? '#059669' : '#64748B'; }
              if (chkUp) { chkUp.innerText = 'Uppercase'; chkUp.style.background = hasUp ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.06)'; chkUp.style.color = hasUp ? '#059669' : '#64748B'; }
              if (chkNum) { chkNum.innerText = 'Number'; chkNum.style.background = hasNum ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.06)'; chkNum.style.color = hasNum ? '#059669' : '#64748B'; }
              if (chkSym) { chkSym.innerText = 'Symbol'; chkSym.style.background = hasSym ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.06)'; chkSym.style.color = hasSym ? '#059669' : '#64748B'; }

              if (score <= 2) {
                if (badge2) { badge2.innerText = 'WEAK'; badge2.style.color = '#DC2626'; badge2.style.background = '#FEE2E2'; badge2.style.borderColor = '#FECACA'; }
                if (bar12) bar12.style.background = '#DC2626';
                if (bar22) bar22.style.background = 'rgba(0,0,0,0.1)';
                if (bar32) bar32.style.background = 'rgba(0,0,0,0.1)';
                if (msg2) { msg2.innerText = 'Weak: Add numbers, uppercase and symbols'; msg2.style.color = '#DC2626'; }
              } else if (score <= 4) {
                if (badge2) { badge2.innerText = 'MEDIUM'; badge2.style.color = '#D97706'; badge2.style.background = '#FEF3C7'; badge2.style.borderColor = '#FDE68A'; }
                if (bar12) bar12.style.background = '#F59E0B';
                if (bar22) bar22.style.background = '#F59E0B';
                if (bar32) bar32.style.background = 'rgba(0,0,0,0.1)';
                if (msg2) { msg2.innerText = 'Medium: Add special symbols (!@#$%^&*) for Strong'; msg2.style.color = '#D97706'; }
              } else {
                if (badge2) { badge2.innerText = 'STRONG'; badge2.style.color = '#059669'; badge2.style.background = '#ECFDF5'; badge2.style.borderColor = '#A7F3D0'; }
                if (bar12) bar12.style.background = '#059669';
                if (bar22) bar22.style.background = '#059669';
                if (bar32) bar32.style.background = '#059669';
                if (msg2) { msg2.innerText = 'Strong: Excellent high-security password'; msg2.style.color = '#059669'; }
              }
            }

            input.addEventListener('input', updateStrength);
            input.addEventListener('change', updateStrength);
            updateStrength();
          }
        });
      } catch(e) {}
      finally {
        isEnhancing = false;
      }
    }

    enhancePasswordFields();

    // Debounced MutationObserver (180ms) with recursion loop and node filter guard
    var observerTimer = null;
    function debouncedEnhance(mutations) {
      if (isEnhancing) return;
      var hasCandidate = false;
      if (mutations && mutations.length) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.addedNodes && m.addedNodes.length) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n.nodeType === 1) {
                if (n.classList && (n.classList.contains('lf-eye-toggle') || n.classList.contains('lf-pwd-meter-box'))) {
                  continue;
                }
                if (n.tagName === 'INPUT' || (n.querySelector && n.querySelector('input'))) {
                  hasCandidate = true;
                  break;
                }
              }
            }
          }
          if (hasCandidate) break;
        }
      } else {
        hasCandidate = true;
      }
      if (!hasCandidate) return;

      if (observerTimer) clearTimeout(observerTimer);
      observerTimer = setTimeout(enhancePasswordFields, 180);
    }

    if (window.MutationObserver) {
      var observer = new MutationObserver(debouncedEnhance);
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    // ─── 6. ANTI-DUPLICATE FORM SUBMISSION GUARD ───
    if (!window.__lf_form_guarded) {
      window.__lf_form_guarded = true;
      document.addEventListener('submit', function(e) {
        try {
          var form = e.target;
          var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
          if (submitBtn) {
            if (submitBtn.getAttribute('data-lf-submitting') === 'true') {
              e.preventDefault();
              return false;
            }
            submitBtn.setAttribute('data-lf-submitting', 'true');
            submitBtn.style.opacity = '0.65';
            submitBtn.style.pointerEvents = 'none';
            setTimeout(function() {
              submitBtn.removeAttribute('data-lf-submitting');
              submitBtn.style.opacity = '';
              submitBtn.style.pointerEvents = '';
            }, 3000);
          }
        } catch(err) {}
      }, true);
    }

    // ─── 7. SQLITE BRIDGING FOR USER REGISTRATION & LOCAL STORAGE ───
    function notifyNativeSQLite(type, payload) {
      try {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
        }
      } catch(e) {}
    }

    if (!Storage.prototype.__lf_patched) {
      var originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v) {
        originalSetItem.apply(this, arguments);
        if (k === 'lf_token') {
          var uStr = localStorage.getItem('lf_user');
          var u = null;
          try { u = uStr ? JSON.parse(uStr) : null; } catch(e) {}
          handleAuthSuccess(v, u);
        } else if (k === 'lf_user') {
          var t = localStorage.getItem('lf_token');
          var parsedUser = null;
          try { parsedUser = v ? JSON.parse(v) : null; } catch(e) {}
          if (t) handleAuthSuccess(t, parsedUser);
          if (parsedUser) notifyNativeSQLite('LF_USER_LOGIN', parsedUser);
        } else if (k === 'lf_local_users') {
          try {
            var users = JSON.parse(v);
            if (Array.isArray(users) && users.length > 0) {
              var latest = users[users.length - 1];
              notifyNativeSQLite('LF_USER_REGISTERED', latest);
            }
          } catch(e) {}
        }
      };
      Storage.prototype.__lf_patched = true;
    }
  } catch(e) {}
})();
true;
`;

type TabKey = 'home' | 'schemes' | 'donate' | 'members' | 'portal';

interface TabItem {
  key: TabKey;
  label: string;
  url: string;
}

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', url: 'https://leimarembifoundation.org/?direct=1' },
  { key: 'schemes', label: 'Schemes', url: 'https://leimarembifoundation.org/grants' },
  { key: 'donate', label: 'Donate', url: 'https://leimarembifoundation.org/donate' },
  { key: 'members', label: 'Directory', url: 'https://leimarembifoundation.org/members' },
  { key: 'portal', label: 'Portal', url: 'https://leimarembifoundation.org/portal' },
];

// Memoized Officer Card for offline modal: 120fps smooth scrolling without unnecessary re-renders
interface ModalOfficerCardProps {
  officer: CachedMember;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
}

const ModalOfficerCard = memo(function ModalOfficerCard({ officer, onCall, onEmail }: ModalOfficerCardProps) {
  const initials = useMemo(() => {
    return officer.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }, [officer.name]);

  return (
    <View style={styles.modalOfficerCard}>
      <View style={styles.modalOfficerTop}>
        <View style={styles.modalAvatar}>
          <Text style={styles.modalAvatarText}>{initials}</Text>
        </View>
        <View style={styles.modalOfficerInfo}>
          <Text style={styles.modalOfficerName}>{officer.name}</Text>
          <Text style={styles.modalOfficerDesignation}>{officer.designation}</Text>
          <View style={styles.modalBadges}>
            <View style={styles.modalRolePill}>
              <Text style={styles.modalRolePillText}>{officer.role}</Text>
            </View>
            <View style={styles.modalBloodPill}>
              <Text style={styles.modalBloodPillText}>Group {officer.blood_group}</Text>
            </View>
            {officer.is_senior_citizen === 1 && (
              <View style={styles.modalSeniorPill}>
                <Text style={styles.modalSeniorPillText}>Senior Citizen</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.modalCardActions}>
        <TouchableOpacity
          style={styles.modalCallBtn}
          onPress={() => onCall(officer.phone)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={`Call ${officer.name} at ${officer.phone}`}
        >
          <Text style={styles.modalCallBtnText}>Call {officer.phone}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalEmailBtn}
          onPress={() => onEmail(officer.email)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={`Email ${officer.name}`}
        >
          <Text style={styles.modalEmailBtnText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function MobileAppScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(PRODUCTION_URL);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [loading, setLoading] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialSplash, setIsInitialSplash] = useState(true);
  const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryBloodFilter, setDirectoryBloodFilter] = useState('All');
  const [isNetworkOffline, setIsNetworkOffline] = useState(false);

  // Animated Top Progress Bar (Zero Flicker navigation experience)
  const [loadProgress] = useState(() => new Animated.Value(0));
  const [progressBarVisible, setProgressBarVisible] = useState(false);

  // Stable Animated Value for launch splash fade-out
  const [splashOpacity] = useState(() => new Animated.Value(1));
  const splashDismissedRef = useRef<boolean>(false);
  const splashFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBackPressRef = useRef<number>(0);

  // React 19 Concurrent Deferred Value for 120fps non-blocking offline modal search
  const deferredSearchQuery = useDeferredValue(directorySearchQuery);

  // Responsive splash dismissal: dismiss immediately when loaded without artificial delay
  const dismissSplash = useCallback(() => {
    if (splashDismissedRef.current) return;
    splashDismissedRef.current = true;
    if (splashFallbackTimerRef.current) {
      clearTimeout(splashFallbackTimerRef.current);
      splashFallbackTimerRef.current = null;
    }

    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsInitialSplash(false);
    });
  }, [splashOpacity]);

  // Bounded safety fallback (8s) only in case WebView never fires load callbacks
  useEffect(() => {
    splashFallbackTimerRef.current = setTimeout(() => {
      dismissSplash();
    }, 8000);

    return () => {
      if (splashFallbackTimerRef.current) {
        clearTimeout(splashFallbackTimerRef.current);
        splashFallbackTimerRef.current = null;
      }
    };
  }, [dismissSplash]);

  // Progress bar animator
  const handleLoadProgress = useCallback(
    (progress: number) => {
      if (progress > 0 && progress < 1) {
        setProgressBarVisible(true);
        Animated.timing(loadProgress, {
          toValue: progress,
          duration: 150,
          useNativeDriver: false,
        }).start();
      } else if (progress >= 1) {
        Animated.timing(loadProgress, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }).start(() => {
          setTimeout(() => {
            setProgressBarVisible(false);
            loadProgress.setValue(0);
          }, 200);
        });
      }
    },
    [loadProgress]
  );

  // Initialize SQLite Database and record launch event
  useEffect(() => {
    try {
      const initialized = initDatabase();
      if (initialized) {
        logActivity('APP_LAUNCH', 'MOBILE', `Leimarembi Foundation Mobile App launched on ${Platform.OS}`);
      }
    } catch (e) {
      console.warn('[SQLite] Init warning:', e);
    }
  }, []);

  const handleReload = useCallback(() => {
    setHasError(false);
    setLoading(true);
    setProgressBarVisible(true);
    loadProgress.setValue(0.2);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, [loadProgress]);

  // Monitor Network Connectivity & Auto-Reconnect when online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsNetworkOffline(offline);
      if (!offline && hasError) {
        handleReload();
      }
    });

    return () => unsubscribe();
  }, [hasError, handleReload]);

  // Handle messages posted from the WebView (Registration, Login, Donations)
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      if (!event?.nativeEvent?.data) return;
      const data = JSON.parse(event.nativeEvent.data);
      if (!data || !data.type) return;

      if (data.type === 'LF_USER_REGISTERED') {
        const u = data.payload || {};
        saveUser({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address,
          blood_group: u.bloodGroup,
          is_senior_citizen: u.isSeniorCitizen ? 1 : 0,
          family_members_count: u.familyMembersCount || 1,
          membership_no: u.membershipNo,
          role: u.role || 'MEMBER',
          designation: u.designation || 'Member',
          auth_provider: u.authProvider || 'LOCAL',
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show(`Member ${u.name || ''} registered in offline cache`, ToastAndroid.LONG);
        }
      } else if (data.type === 'LF_USER_LOGIN') {
        const u = data.payload || {};
        if (u.email || u.id) {
          saveUser({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            address: u.address,
            blood_group: u.bloodGroup,
            is_senior_citizen: u.isSeniorCitizen ? 1 : 0,
            family_members_count: u.familyMembersCount || 1,
            membership_no: u.membershipNo,
            role: u.role || 'MEMBER',
            designation: u.designation,
            auth_provider: u.authProvider || 'LOCAL',
          });
          if (Platform.OS === 'android') {
            ToastAndroid.show(`Welcome, ${u.name || 'Member'}`, ToastAndroid.SHORT);
          }
        }
      } else if (data.type === 'LF_DONATION_RECORDED') {
        const d = data.payload || {};
        const isVerifiedBackendSync = d.synced === true || d.synced === 1;
        saveDonation({
          id: d.id,
          donor_name: d.donorName || 'Anonymous Donor',
          donor_phone: d.donorPhone,
          donor_email: d.donorEmail,
          amount: Number(d.amount) || 0,
          purpose: d.purpose || 'General Community Welfare',
          payment_mode: d.paymentMode || 'UPI',
          reference_id: d.referenceId,
          receipt_number: d.receiptNumber,
          synced: isVerifiedBackendSync ? 1 : 0,
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            isVerifiedBackendSync
              ? 'Donation receipt verified & recorded'
              : 'Donation saved in offline cache (pending server verification)',
            ToastAndroid.LONG
          );
        }
      }
    } catch {
      // ignore non-JSON messages
    }
  }, []);

  // Sync bottom active tab with the webview URL
  const updateActiveTabFromUrl = useCallback((url: string) => {
    if (!url) return;
    const lower = url.toLowerCase();
    if (lower.includes('/donate')) {
      setActiveTab('donate');
    } else if (lower.includes('/grants') || lower.includes('/activities') || lower.includes('/health')) {
      setActiveTab('schemes');
    } else if (lower.includes('/members') || lower.includes('/about') || lower.includes('/culture')) {
      setActiveTab('members');
    } else if (
      lower.includes('/portal') ||
      lower.includes('/login') ||
      lower.includes('/register') ||
      lower.includes('/superadmin') ||
      lower.includes('/management')
    ) {
      setActiveTab('portal');
    } else {
      setActiveTab('home');
    }
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // If offline modal is open, close it first
      if (isOfflineModalVisible) {
        setIsOfflineModalVisible(false);
        return true;
      }

      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }

      // If at root page, double back to exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressRef.current = now;
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack, isOfflineModalVisible]);

  // Tab press with instant visual progress and active tab guard (prevents redundant reloading)
  const handleTabPress = useCallback(
    (tab: TabItem) => {
      if (activeTab === tab.key && currentUrl === tab.url) {
        return; // Guard against redundant reloads
      }

      setActiveTab(tab.key);
      setCurrentUrl(tab.url);
      setHasError(false);

      // Instant visual feedback via top progress bar
      handleLoadProgress(0.25);

      if (Platform.OS === 'web') {
        return;
      }

      // Smooth navigation inside webview
      const navScript = `
        (function() {
          var target = '${tab.url}';
          if (window.location.href !== target && window.location.origin + window.location.pathname !== target) {
            window.location.href = target;
          }
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(navScript);
    },
    [activeTab, currentUrl, handleLoadProgress]
  );

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Leimarembi Foundation Official Mobile App',
        message:
          'Explore official community programs, welfare schemes, and initiatives by Leimarembi Foundation: https://leimarembifoundation.org',
        url: 'https://leimarembifoundation.org',
      });
    } catch {}
  };

  const handleLanguageToggle = () => {
    const langScript = `
      (function() {
        var langBtn = document.querySelector('button[aria-label="Select language"], .desktop-action-bar button[aria-haspopup="listbox"]');
        if (langBtn) {
          langBtn.click();
        } else if (window.toggleLanguage) {
          window.toggleLanguage();
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(langScript);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Language toggled (English / Meitei Mayek)', ToastAndroid.SHORT);
    }
  };

  const cachedOfficers: CachedMember[] = useMemo(() => {
    return getCachedMembers();
  }, []);

  const filteredOfficers = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    return cachedOfficers.filter((m) => {
      const matchQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.blood_group.toLowerCase().includes(q);

      const matchBg =
        directoryBloodFilter === 'All' ||
        m.blood_group.toUpperCase() === directoryBloodFilter.toUpperCase();

      return matchQ && matchBg;
    });
  }, [cachedOfficers, deferredSearchQuery, directoryBloodFilter]);

  const handleOfficerCall = useCallback((phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`).catch(() => {});
  }, []);

  const handleOfficerEmail = useCallback((email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  }, []);

  // Graceful Native Fallback if WebView package is completely absent on native platforms
  if (!NativeWebView && Platform.OS !== 'web') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0B3820" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Image source={LEIMAREMBI_LOGO} style={styles.splashLogo} resizeMode="contain" />
            <Text style={styles.errorTitle}>Leimarembi Foundation</Text>
            <Text style={styles.errorSubtitle}>Connecting to live portal...</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => WebBrowser.openBrowserAsync('https://leimarembifoundation.org')}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B3820" translucent={false} />

      {/* ─── 1. NATIVE BRANDED APP HEADER (SAFE AREA COMPLIANT) ─── */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.headerLogoWrapper}>
              <Image source={LEIMAREMBI_LOGO} style={styles.headerLogo} resizeMode="contain" />
            </View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitleText} numberOfLines={1}>
                Leimarembi Foundation
              </Text>
              <Text style={styles.headerSubtitleText} numberOfLines={1}>
                Public Charitable Trust • Estd. 2001
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.langBtn}
              onPress={handleLanguageToggle}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Switch Language between English and Meitei Mayek"
            >
              <Text style={styles.langBtnText}>EN / ꯃꯤ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleReload}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Reload Portal"
            >
              <Text style={styles.headerActionBtnText}>Reload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleShare}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Share Application"
            >
              <Text style={styles.headerActionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── Top Animated Progress Bar (Zero Flicker Navigation) ─── */}
      {progressBarVisible && (
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: loadProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}

      {/* ─── Offline Banner ─── */}
      {isNetworkOffline && (
        <View style={styles.offlineNetworkBanner}>
          <Text style={styles.offlineNetworkBannerText}>
            Offline Mode — Browsing Cached Foundation Directory
          </Text>
        </View>
      )}

      {/* ─── 2. FULL-SCREEN FLUID RESPONSIVE WEBVIEW / WEB PORTAL ─── */}
      <View style={styles.webViewWrapper}>
        {Platform.OS === 'web' ? (
          <View style={styles.webView}>
            {!hasInitialLoaded && loading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                  <Image source={LEIMAREMBI_LOGO} style={styles.loadingLogoImg} resizeMode="contain" />
                  <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 14 }} />
                  <Text style={styles.loadingTitle}>Leimarembi Foundation</Text>
                  <Text style={styles.loadingSubtitle}>Connecting to official platform...</Text>
                </View>
              </View>
            )}
            <iframe
              src={currentUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#FFFFFF',
              }}
              title="Leimarembi Foundation Official Portal"
              onLoad={() => {
                setLoading(false);
                setHasInitialLoaded(true);
                handleLoadProgress(1);
                dismissSplash();
              }}
            />
          </View>
        ) : (
          <NativeWebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webView}
            injectedJavaScriptBeforeContentLoaded={INJECTED_RESPONSIVE_SCRIPT}
            injectedJavaScript={INJECTED_RESPONSIVE_SCRIPT}
            onMessage={handleWebViewMessage}
            userAgent={CHROME_MOBILE_UA}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            databaseEnabled={true}
            cacheEnabled={true}
            scalesPageToFit={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={true}
            originWhitelist={['*']}
            startInLoadingState={!hasInitialLoaded}
            allowsBackForwardNavigationGestures={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            pullToRefreshEnabled={true}
            textZoom={100}
            overScrollMode="never"
            mixedContentMode="compatibility"
            onShouldStartLoadWithRequest={(request: any) => {
              const url = request.url;
              if (!url) return true;

              // Protocols: open native external handlers
              if (
                url.startsWith('tel:') ||
                url.startsWith('mailto:') ||
                url.startsWith('sms:') ||
                url.startsWith('whatsapp:') ||
                url.startsWith('upi:') ||
                url.startsWith('phonepe:') ||
                url.startsWith('paytmmp:') ||
                url.startsWith('tez:')
              ) {
                Linking.openURL(url).catch(() => {});
                return false;
              }

              try {
                const parsed = new URL(url);
                const host = parsed.hostname.toLowerCase();

                // Keep first-party domain and subdomains in WebView
                if (
                  host === 'leimarembifoundation.org' ||
                  host.endsWith('.leimarembifoundation.org') ||
                  host === 'localhost' ||
                  host === '127.0.0.1'
                ) {
                  return true;
                }

                // Keep verified payment gateways and OAuth in WebView
                const isAuthOrPayment =
                  host.includes('razorpay.com') ||
                  host.includes('cashfree.com') ||
                  host.includes('payu.in') ||
                  host.includes('accounts.google.com') ||
                  host.includes('googleapis.com');

                if (isAuthOrPayment) {
                  return true;
                }

                // Unrelated external HTTP(S) links: open in system browser
                if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                  WebBrowser.openBrowserAsync(url).catch(() => {
                    Linking.openURL(url).catch(() => {});
                  });
                  return false;
                }
              } catch {
                return true;
              }

              return true;
            }}
            onNavigationStateChange={(navState: any) => {
              setCanGoBack(navState.canGoBack);
              if (navState.url) {
                setCurrentUrl(navState.url);
                updateActiveTabFromUrl(navState.url);
              }
            }}
            onLoadStart={() => {
              setHasError(false);
              setLoading(true);
              handleLoadProgress(0.25);
            }}
            onLoadProgress={({ nativeEvent }: any) => {
              handleLoadProgress(nativeEvent.progress);
            }}
            onLoadEnd={() => {
              setLoading(false);
              setHasInitialLoaded(true);
              handleLoadProgress(1);
              dismissSplash();
            }}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;
              setLoading(false);
              setHasError(true);
              setErrorMessage(nativeEvent.description || 'Unable to connect to the live platform.');
              handleLoadProgress(1);
              dismissSplash();
            }}
            onRenderProcessGone={() => {
              webViewRef.current?.reload();
              return true;
            }}
            renderLoading={() => {
              if (hasInitialLoaded) return null;
              return (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingCard}>
                    <Image source={LEIMAREMBI_LOGO} style={styles.loadingLogoImg} resizeMode="contain" />
                    <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 14 }} />
                    <Text style={styles.loadingTitle}>Leimarembi Foundation</Text>
                    <Text style={styles.loadingSubtitle}>Connecting to official platform...</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Branded Offline Fallback Screen with Instant Directory Access */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <View style={styles.errorStatusBadge}>
                <Text style={styles.errorStatusText}>Offline Mode</Text>
              </View>
              <Text style={styles.errorTitle}>Unable to Connect to Portal</Text>
              <Text style={styles.errorSubtitle}>
                {errorMessage ||
                  'The live platform is currently unreachable. You can continue accessing all official officers, emergency hotlines, and records offline.'}
              </Text>

              <View style={styles.errorActionsRow}>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={handleReload}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryBtnText}>Retry Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.offlineDirectoryBtn}
                  onPress={() => setIsOfflineModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.offlineDirectoryBtnText}>
                    Browse Offline Directory
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ─── 3. NATIVE BOTTOM NAVIGATION BAR (SAFE AREA COMPLIANT) ─── */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        <View style={styles.bottomBarInner}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDonate = tab.key === 'donate';

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isDonate && styles.tabButtonDonate]}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                {/* Active Indicator Line */}
                {isActive && !isDonate && <View style={styles.activeTopLine} />}

                {isDonate ? (
                  <View style={[styles.donatePill, isActive && styles.donatePillActive]}>
                    <Text style={styles.donateLabel}>Donate</Text>
                  </View>
                ) : (
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── 4. OFFLINE DIRECTORY MODAL (SQLITE BACKED & CONCURRENT SEARCH) ─── */}
      <Modal
        visible={isOfflineModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOfflineModalVisible(false)}
      >
        <SafeAreaView style={styles.modalRoot}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={styles.modalTitle}>Executive Directory</Text>
              <Text style={styles.modalSubtitle}>Official Officers & Welfare Committee (15 Members)</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsOfflineModalVisible(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close Directory"
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Search & Filters */}
          <View style={styles.modalSearchSection}>
            <View style={styles.modalSearchBox}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search officer name, designation, phone..."
                placeholderTextColor={BrandColors.textMuted}
                value={directorySearchQuery}
                onChangeText={setDirectorySearchQuery}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
              {directorySearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setDirectorySearchQuery('')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Blood Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              <View style={styles.modalFilterRow}>
                <Text style={styles.modalBloodLabel}>Blood Group:</Text>
                {BLOOD_GROUPS.map((bg) => {
                  const sel = directoryBloodFilter === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.modalBloodChip, sel && styles.modalBloodChipActive]}
                      onPress={() => setDirectoryBloodFilter(bg)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modalBloodChipText, sel && styles.modalBloodChipTextActive]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Member List with Keyboard Dismiss on Drag */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            {filteredOfficers.length === 0 ? (
              <View style={styles.modalEmptyBox}>
                <Text style={styles.modalEmptyTitle}>No Officers Found</Text>
                <Text style={styles.modalEmptyText}>No officers match your query.</Text>
                <TouchableOpacity
                  style={styles.modalResetBtn}
                  onPress={() => {
                    setDirectorySearchQuery('');
                    setDirectoryBloodFilter('All');
                  }}
                >
                  <Text style={styles.modalResetBtnText}>Reset Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredOfficers.map((officer) => (
                <ModalOfficerCard
                  key={officer.id}
                  officer={officer}
                  onCall={handleOfficerCall}
                  onEmail={handleOfficerEmail}
                />
              ))
            )}

            {/* Emergency Hotline Section in Modal */}
            <View style={styles.modalEmergencyBox}>
              <Text style={styles.modalEmergencyTitle}>Headquarters Emergency Contacts</Text>
              <Text style={styles.modalEmergencySubtitle}>Guwahati Head Office • 24/7 Relief Helpline</Text>
              {EMERGENCY_HOTLINES.map((h, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.modalEmergencyRow}
                  onPress={() => Linking.openURL(`tel:${h.phone.replace(/\D/g, '')}`).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalEmergencyLabel}>{h.label}</Text>
                  <Text style={styles.modalEmergencyPhone}>{h.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── 5. BRANDED LAUNCH SCREEN (FAST FADE-OUT ON FIRST LOAD) ─── */}
      {isInitialSplash && (
        <Animated.View
          style={[styles.splashScreenOverlay, { opacity: splashOpacity }]}
          pointerEvents={isInitialSplash ? 'auto' : 'none'}
        >
          <View style={styles.splashCard}>
            <View style={styles.splashGlowRing}>
              <Image source={LEIMAREMBI_LOGO} style={styles.splashEmblem} resizeMode="contain" />
            </View>
            <Text style={styles.splashTitle}>Leimarembi Foundation</Text>
            <Text style={styles.splashSubtitle}>ꯂꯩꯃꯔꯦꯝꯕꯤ ꯐꯥꯎꯟꯗꯦꯁꯟ</Text>
            <View style={styles.splashBadge}>
              <Text style={styles.splashBadgeText}>OFFICIAL APPLICATION • ESTD. 2001</Text>
            </View>
            <ActivityIndicator size="small" color="#F59E0B" style={{ marginTop: 24 }} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B3820',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0B3820',
  },

  // ─── Branded Header Bar ───
  headerBar: {
    backgroundColor: '#0B3820',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    maxWidth: 1024,
    width: '100%',
    alignSelf: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  headerLogoWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  headerLogo: {
    width: 24,
    height: 24,
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
    color: '#34D399',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  langBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerActionBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBtnText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },

  // ─── Top Animated Progress Bar ───
  progressBarTrack: {
    height: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },

  offlineNetworkBanner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineNetworkBannerText: {
    color: '#062314',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ─── WebView Area ───
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },

  // ─── Loading Screen ───
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 24,
  },
  loadingLogoImg: {
    width: 60,
    height: 60,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B3820',
    marginTop: 10,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // ─── Offline Fallback Screen ───
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 56, 32, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  errorStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  errorStatusText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  errorActionsRow: {
    width: '100%',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  offlineDirectoryBtn: {
    backgroundColor: '#0B3820',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  offlineDirectoryBtnText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  splashLogo: {
    width: 70,
    height: 70,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // ─── Bottom Navigation Bar ───
  bottomBarContainer: {
    backgroundColor: '#0B3820',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
    minHeight: 46,
  },
  tabButtonDonate: {
    flex: 1.15,
  },
  activeTopLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2.5,
    backgroundColor: '#34D399',
    borderRadius: 1.5,
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  donatePill: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donatePillActive: {
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  donateLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ─── Initial Splash Screen Overlay ───
  splashScreenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B3820',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  splashCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashGlowRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginBottom: 16,
  },
  splashEmblem: {
    width: 64,
    height: 64,
  },
  splashTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  splashSubtitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  splashBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  splashBadgeText: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // ─── Modal Styles ───
  modalRoot: {
    flex: 1,
    backgroundColor: '#0B3820',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSearchSection: {
    backgroundColor: '#0F472A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearSearchText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  modalFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBloodLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  modalBloodChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBloodChipActive: {
    backgroundColor: '#059669',
  },
  modalBloodChipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  modalBloodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalBodyContent: {
    padding: 14,
    paddingBottom: 36,
  },
  modalEmptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  modalEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalEmptyText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 12,
  },
  modalResetBtn: {
    backgroundColor: '#0B3820',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalResetBtnText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOfficerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  modalOfficerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0B3820',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOfficerInfo: {
    flex: 1,
  },
  modalOfficerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalOfficerDesignation: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 1,
  },
  modalBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  modalRolePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalRolePillText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  modalBloodPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalBloodPillText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '700',
  },
  modalSeniorPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalSeniorPillText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '700',
  },
  modalCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCallBtn: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalEmailBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalEmailBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  modalEmergencyBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modalEmergencyTitle: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '800',
  },
  modalEmergencySubtitle: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
    marginBottom: 8,
  },
  modalEmergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.12)',
  },
  modalEmergencyLabel: {
    color: '#7F1D1D',
    fontSize: 11,
    fontWeight: '600',
  },
  modalEmergencyPhone: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
});