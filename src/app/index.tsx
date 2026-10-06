import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

// Safely resolve native WebView if present in binary, fallback to in-app browser
let NativeWebView: any = null;
try {
  const rnw = require('react-native-webview');
  NativeWebView = rnw.WebView || rnw.default;
} catch (err) {
  NativeWebView = null;
}

const PRODUCTION_URL = 'https://leimarembifoundation.org';

// Mobile User Agent to guarantee 100% mobile responsive rendering from Next.js server
const MOBILE_USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  default: undefined,
});

// Enforce native mobile viewport and disable desktop horizontal overflow
const INJECTED_MOBILE_VIEWPORT = `
  (function() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');

    // Prevent horizontal overflow
    document.documentElement.style.maxWidth = '100vw';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.body.style.overflowX = 'hidden';

    true;
  })();
`;

export default function MobileAppScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback if native RNCWebViewModule is not linked in current APK
  useEffect(() => {
    if (!NativeWebView) {
      WebBrowser.openBrowserAsync(PRODUCTION_URL);
    }
  }, []);

  // Handle hardware back button on Android to navigate website history
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!NativeWebView) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🏛️</Text>
            <Text style={styles.errorTitle}>Leimarembi Foundation</Text>
            <Text style={styles.errorSubtitle}>Opening official mobile portal...</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => WebBrowser.openBrowserAsync(PRODUCTION_URL)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Open Mobile Site</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <NativeWebView
          ref={webViewRef}
          source={{ uri: PRODUCTION_URL }}
          style={styles.webView}
          userAgent={MOBILE_USER_AGENT}
          injectedJavaScript={INJECTED_MOBILE_VIEWPORT}
          injectedJavaScriptBeforeContentLoaded={INJECTED_MOBILE_VIEWPORT}
          // scalesPageToFit MUST be false to ensure 100% native mobile ratio (never desktop scaled)
          scalesPageToFit={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          databaseEnabled={true}
          cacheEnabled={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          pullToRefreshEnabled={true}
          textZoom={100}
          onNavigationStateChange={(navState: any) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => {
            setHasError(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            setLoading(false);
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Failed to connect to leimarembifoundation.org');
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284C7" />
              <Text style={styles.loadingText}>Loading Leimarembi Foundation...</Text>
            </View>
          )}
        />

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🌐</Text>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorSubtitle}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#1B2A57',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});