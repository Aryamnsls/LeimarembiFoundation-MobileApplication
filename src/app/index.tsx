import React, { useRef, useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import {
  initDatabase,
  saveUser,
  saveDonation,
  logActivity,
} from '../services/database';

// Safely resolve native WebView
let NativeWebView: any = null;
try {
  const rnw = require('react-native-webview');
  NativeWebView = rnw.WebView || rnw.default;
} catch (err) {
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

// Injected responsive script:
// 1. Standard fluid viewport (width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover)
// 2. Removes desktop QR and welcome barrier dialogs
// 3. Handles login / portal session synchronization
// 4. Injects CSS to optimize mobile layout and prevent horizontal overflow
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

    // ─── 2. BYPASS DESKTOP QR / WELCOME BARRIERS AUTOMATICALLY ───
    sessionStorage.setItem('welcomeShown', 'true');
    sessionStorage.setItem('qrScannedVerified', 'true');
    localStorage.setItem('phoneQrVerified', 'true');

    function dismissGateways() {
      try {
        var dialogs = document.querySelectorAll('div[role="dialog"]');
        dialogs.forEach(function(d) {
          if (d.innerText && (d.innerText.indexOf('EXECUTIVE QR GATEWAY') !== -1 || d.innerText.indexOf('WELCOME TO LEIMAREMBI') !== -1)) {
            var enterBtn = Array.from(d.querySelectorAll('button')).find(function(b) {
              return (b.innerText || '').indexOf('Enter Official Platform') !== -1 || (b.innerText || '').indexOf('Continue to Welcome') !== -1;
            });
            if (enterBtn) {
              enterBtn.click();
            } else {
              d.style.display = 'none';
            }
          }
        });
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      } catch(e) {}
    }
    dismissGateways();
    setTimeout(dismissGateways, 300);
    setTimeout(dismissGateways, 1000);
    setTimeout(dismissGateways, 2500);

    // ─── 3. MOBILE POLISH STYLES (HEADER & OVERFLOW) ───
    var styleId = 'lf-mobile-polish-styles';
    if (!document.getElementById(styleId) && document.head) {
      var style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = [
        'html, body { overflow-x: hidden !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }',
        '* { -webkit-tap-highlight-color: transparent !important; }',
        // Responsive header styling
        'header.header, .header { width: 100% !important; max-width: 100% !important; padding: 4px 8px !important; box-sizing: border-box !important; }',
        '.header-content { padding: 0 4px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; height: 50px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }',
        '.logo-container { gap: 6px !important; display: flex !important; align-items: center !important; min-width: 0 !important; }',
        '.logo-container img { width: 32px !important; height: 32px !important; flex-shrink: 0 !important; }',
        '.logo-container .logo-text { font-size: 0.80rem !important; font-weight: 800 !important; line-height: 1.15 !important; }'
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
    function enhancePasswordFields() {
      try {
        var pwdInputs = document.querySelectorAll('input[type="password"], input[data-is-password="true"]');
        pwdInputs.forEach(function(input) {
          if (input.getAttribute('data-lf-pwd-enhanced') === 'true') return;
          input.setAttribute('data-lf-pwd-enhanced', 'true');

          var parent = input.parentElement;
          if (!parent) return;
          if (window.getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
          }

          // Ensure eye toggle button exists with touch-friendly dimensions
          var existingBtn = parent.querySelector('button[aria-label*="password"], button.lf-eye-toggle');
          if (!existingBtn) {
            var toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'lf-eye-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
            toggleBtn.innerHTML = '👁️';
            toggleBtn.style.cssText = 'position:absolute; right:4px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; z-index:10; opacity:0.75;';
            toggleBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerHTML = '🙈';
              } else {
                input.type = 'password';
                toggleBtn.innerHTML = '👁️';
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
              '  <span style="font-size:11px; font-weight:700; color:#555;">Password Strength:</span>',
              '  <span class="lf-strength-badge" style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px; background:#EF444422; color:#EF4444; border:1px solid #EF444444;">WEAK</span>',
              '</div>',
              '<div style="display:flex; gap:4px; height:5px; margin-bottom:6px;">',
              '  <div class="lf-bar-1" style="flex:1; border-radius:3px; background:#EF4444; transition:background 0.25s;"></div>',
              '  <div class="lf-bar-2" style="flex:1; border-radius:3px; background:rgba(0,0,0,0.1); transition:background 0.25s;"></div>',
              '  <div class="lf-bar-3" style="flex:1; border-radius:3px; background:rgba(0,0,0,0.1); transition:background 0.25s;"></div>',
              '</div>',
              '<div style="display:flex; flex-wrap:wrap; gap:4px; font-size:10px; margin-bottom:4px;">',
              '  <span class="lf-chk-len" style="padding:1px 5px; border-radius:4px; background:rgba(0,0,0,0.06); color:#777;">○ 8+ Chars</span>',
              '  <span class="lf-chk-up" style="padding:1px 5px; border-radius:4px; background:rgba(0,0,0,0.06); color:#777;">○ Uppercase</span>',
              '  <span class="lf-chk-num" style="padding:1px 5px; border-radius:4px; background:rgba(0,0,0,0.06); color:#777;">○ Number</span>',
              '  <span class="lf-chk-sym" style="padding:1px 5px; border-radius:4px; background:rgba(0,0,0,0.06); color:#777;">○ Symbol</span>',
              '</div>',
              '<div class="lf-strength-msg" style="font-size:10px; color:#EF4444; font-weight:600;">Weak: Add numbers, uppercase & symbols</div>'
            ].join('');

            parent.parentNode.insertBefore(meterBox, parent.nextSibling);

            function updateStrength() {
              var val = input.value || '';
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

              var badge = meterBox.querySelector('.lf-strength-badge');
              var bar1 = meterBox.querySelector('.lf-bar-1');
              var bar2 = meterBox.querySelector('.lf-bar-2');
              var bar3 = meterBox.querySelector('.lf-bar-3');
              var chkLen = meterBox.querySelector('.lf-chk-len');
              var chkUp = meterBox.querySelector('.lf-chk-up');
              var chkNum = meterBox.querySelector('.lf-chk-num');
              var chkSym = meterBox.querySelector('.lf-chk-sym');
              var msg = meterBox.querySelector('.lf-strength-msg');

              if (chkLen) { chkLen.innerText = hasLen ? '✓ 8+ Chars' : '○ 8+ Chars'; chkLen.style.background = hasLen ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.06)'; chkLen.style.color = hasLen ? '#059669' : '#777'; }
              if (chkUp) { chkUp.innerText = hasUp ? '✓ Uppercase' : '○ Uppercase'; chkUp.style.background = hasUp ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.06)'; chkUp.style.color = hasUp ? '#059669' : '#777'; }
              if (chkNum) { chkNum.innerText = hasNum ? '✓ Number' : '○ Number'; chkNum.style.background = hasNum ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.06)'; chkNum.style.color = hasNum ? '#059669' : '#777'; }
              if (chkSym) { chkSym.innerText = hasSym ? '✓ Symbol' : '○ Symbol'; chkSym.style.background = hasSym ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.06)'; chkSym.style.color = hasSym ? '#059669' : '#777'; }

              if (score <= 2) {
                if (badge) { badge.innerText = 'WEAK'; badge.style.color = '#EF4444'; badge.style.background = '#EF444422'; badge.style.borderColor = '#EF444444'; }
                if (bar1) bar1.style.background = '#EF4444';
                if (bar2) bar2.style.background = 'rgba(0,0,0,0.1)';
                if (bar3) bar3.style.background = 'rgba(0,0,0,0.1)';
                if (msg) { msg.innerText = 'Weak: Add numbers, uppercase & symbols'; msg.style.color = '#EF4444'; }
              } else if (score <= 4) {
                if (badge) { badge.innerText = 'MEDIUM'; badge.style.color = '#F59E0B'; badge.style.background = '#F59E0B22'; badge.style.borderColor = '#F59E0B44'; }
                if (bar1) bar1.style.background = '#F59E0B';
                if (bar2) bar2.style.background = '#F59E0B';
                if (bar3) bar3.style.background = 'rgba(0,0,0,0.1)';
                if (msg) { msg.innerText = 'Medium: Add special symbols (!@#$%^&*) for Strong'; msg.style.color = '#F59E0B'; }
              } else {
                if (badge) { badge.innerText = 'STRONG'; badge.style.color = '#10B981'; badge.style.background = '#10B98122'; badge.style.borderColor = '#10B98144'; }
                if (bar1) bar1.style.background = '#10B981';
                if (bar2) bar2.style.background = '#10B981';
                if (bar3) bar3.style.background = '#10B981';
                if (msg) { msg.innerText = 'Strong: Excellent high-security password!'; msg.style.color = '#10B981'; }
              }
            }

            input.addEventListener('input', updateStrength);
            updateStrength();
          }
        });
      } catch(e) {}
    }

    enhancePasswordFields();
    setInterval(enhancePasswordFields, 1000);

    // ─── 6. SQLITE BRIDGING FOR USER REGISTRATION & LOCAL STORAGE ───
    function notifyNativeSQLite(type, payload) {
      try {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
        }
      } catch(e) {}
    }

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
  } catch(e) {}
})();
true;
`;

type TabKey = 'home' | 'schemes' | 'donate' | 'members' | 'portal';

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
  url: string;
}

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: '🏛️', url: 'https://leimarembifoundation.org/?direct=1' },
  { key: 'schemes', label: 'Schemes', icon: '📜', url: 'https://leimarembifoundation.org/grants' },
  { key: 'donate', label: 'Donate', icon: '💚', url: 'https://leimarembifoundation.org/donate' },
  { key: 'members', label: 'Directory', icon: '👥', url: 'https://leimarembifoundation.org/members' },
  { key: 'portal', label: 'Portal', icon: '👤', url: 'https://leimarembifoundation.org/portal' },
];

export default function MobileAppScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(PRODUCTION_URL);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialSplash, setIsInitialSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const lastBackPressRef = useRef<number>(0);

  // Elegant 1-second splash animation on launch
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsInitialSplash(false);
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

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
          ToastAndroid.show(`✅ Member ${u.name || ''} registered & cached in SQLite!`, ToastAndroid.LONG);
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
            ToastAndroid.show(`👋 Welcome back, ${u.name || 'Member'}!`, ToastAndroid.SHORT);
          }
        }
      } else if (data.type === 'LF_DONATION_RECORDED') {
        const d = data.payload || {};
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
          synced: 1,
        });
        if (Platform.OS === 'android') {
          ToastAndroid.show('💚 Donation receipt saved in SQLite!', ToastAndroid.LONG);
        }
      }
    } catch (err) {
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
  }, [canGoBack]);

  const handleTabPress = (tab: TabItem) => {
    setActiveTab(tab.key);
    setLoading(true);
    setHasError(false);

    // Smooth navigation inside webview
    const navScript = `
      (function() {
        if (window.location.href !== '${tab.url}') {
          window.location.href = '${tab.url}';
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(navScript);
  };

  const handleReload = useCallback(() => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

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
      ToastAndroid.show('Switching Language...', ToastAndroid.SHORT);
    }
  };

  if (!NativeWebView) {
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
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoWrapper}>
            <Image source={LEIMAREMBI_LOGO} style={styles.headerLogo} resizeMode="contain" />
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitleText}>Leimarembi Foundation</Text>
            <Text style={styles.headerSubtitleText}>Official Platform • ꯂꯩꯃꯔꯦꯝꯕꯤ</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={handleLanguageToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={styles.langBtnText}>🌐 EN / ꯃꯤ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleReload}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={styles.headerIconEmoji}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleShare}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={styles.headerIconEmoji}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. FULL-SCREEN 100% FLUID RESPONSIVE WEBVIEW ─── */}
      <View style={styles.webViewWrapper}>
        <NativeWebView
          ref={webViewRef}
          source={{ uri: PRODUCTION_URL }}
          style={styles.webView}
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
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          pullToRefreshEnabled={true}
          onShouldStartLoadWithRequest={(request: any) => {
            const url = request.url;
            if (
              url.startsWith('tel:') ||
              url.startsWith('mailto:') ||
              url.startsWith('sms:') ||
              url.startsWith('whatsapp:')
            ) {
              Linking.openURL(url).catch(() => {});
              return false;
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
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            setLoading(false);
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Unable to connect to the live platform.');
          }}
          onRenderProcessGone={() => {
            webViewRef.current?.reload();
            return true;
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <Image source={LEIMAREMBI_LOGO} style={styles.loadingLogoImg} resizeMode="contain" />
                <ActivityIndicator size="large" color="#059669" style={{ marginVertical: 14 }} />
                <Text style={styles.loadingTitle}>Leimarembi Foundation</Text>
                <Text style={styles.loadingSubtitle}>Connecting to live portal...</Text>
              </View>
            </View>
          )}
        />

        {/* Branded Offline Fallback Screen */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <View style={styles.errorIconBg}>
                <Text style={styles.errorIcon}>📡</Text>
              </View>
              <Text style={styles.errorTitle}>No Internet Connection</Text>
              <Text style={styles.errorSubtitle}>
                {errorMessage || 'Unable to load content. Please check your data connection and reconnect.'}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleReload} activeOpacity={0.8}>
                <Text style={styles.retryBtnText}>Tap to Reconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* ─── 3. NATIVE BOTTOM NAVIGATION BAR (SAFE AREA COMPLIANT) ─── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isDonate = tab.key === 'donate';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isDonate && styles.tabButtonDonate]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              {isDonate ? (
                <View style={styles.donatePill}>
                  <Text style={styles.donateIcon}>💚</Text>
                  <Text style={styles.donateLabel}>Donate</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                  {isActive && <View style={styles.activeDot} />}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── 4. ELEGANT 1-SECOND BRANDED SPLASH SCREEN (FADE-OUT ON LAUNCH) ─── */}
      {isInitialSplash && (
        <Animated.View style={[styles.splashScreenOverlay, { opacity: splashOpacity }]}>
          <View style={styles.splashCard}>
            <View style={styles.splashGlowRing}>
              <Image source={LEIMAREMBI_LOGO} style={styles.splashEmblem} resizeMode="contain" />
            </View>
            <Text style={styles.splashTitle}>Leimarembi Foundation</Text>
            <Text style={styles.splashSubtitle}>ꯂꯩꯃꯔꯦꯝꯕꯤ ꯐꯥꯎꯟꯗꯦꯁꯟ</Text>
            <View style={styles.splashBadge}>
              <Text style={styles.splashBadgeText}>OFFICIAL MOBILE APPLICATION</Text>
            </View>
            <ActivityIndicator size="small" color="#D97706" style={{ marginTop: 24 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  headerLogoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexShrink: 0,
  },
  headerLogo: {
    width: 25,
    height: 25,
  },
  headerTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
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
    gap: 6,
    flexShrink: 0,
  },
  langBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconEmoji: {
    fontSize: 14,
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
    width: 68,
    height: 68,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3820',
    marginTop: 8,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // ─── Offline Fallback Screen ───
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 56, 32, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  errorIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 30,
  },
  errorTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  splashLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // ─── Bottom Navigation Bar ───
  bottomBar: {
    backgroundColor: '#0B3820',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabButtonDonate: {
    flex: 1.2,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.65,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#34D399',
    marginTop: 3,
  },
  donatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  donateIcon: {
    fontSize: 13,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 16,
  },
  splashEmblem: {
    width: 72,
    height: 72,
  },
  splashTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  splashSubtitle: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  splashBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  splashBadgeText: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});