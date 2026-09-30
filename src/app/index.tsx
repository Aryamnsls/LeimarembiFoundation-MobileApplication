import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const PRODUCTION_URL = 'https://leimarembifoundation.org';

export default function MobileAppScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(PRODUCTION_URL);
  const [hasError, setHasError] = useState(false);

  // Handle hardware back button on Android
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

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleGoHome = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.injectJavaScript(`window.location.href = '${PRODUCTION_URL}'; true;`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Leimarembi Foundation',
        message: `Official Digital Governance & Community Development Platform: ${currentUrl}`,
        url: currentUrl,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Sleek Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <TouchableOpacity onPress={handleGoHome} activeOpacity={0.8} style={styles.logoBtn}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>LF</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Leimarembi Foundation</Text>
              <Text style={styles.headerSubtitle}>Digital Governance Platform</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.ctrlBtn, !canGoBack && styles.ctrlBtnDisabled]}
            disabled={!canGoBack}
            onPress={() => webViewRef.current?.goBack()}
            accessibilityLabel="Back"
          >
            <Text style={[styles.ctrlBtnText, !canGoBack && styles.ctrlBtnTextDisabled]}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, !canGoForward && styles.ctrlBtnDisabled]}
            disabled={!canGoForward}
            onPress={() => webViewRef.current?.goForward()}
            accessibilityLabel="Forward"
          >
            <Text style={[styles.ctrlBtnText, !canGoForward && styles.ctrlBtnTextDisabled]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={handleReload}
            accessibilityLabel="Reload"
          >
            <Text style={styles.ctrlBtnIcon}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={handleShare}
            accessibilityLabel="Share"
          >
            <Text style={styles.ctrlBtnIcon}>⎋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main WebView Rendering Full Website Clone */}
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: PRODUCTION_URL }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
            setCurrentUrl(navState.url);
          }}
          onLoadStart={() => {
            setLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <View style={styles.loadingLogo}>
                  <Text style={styles.loadingLogoText}>LF</Text>
                </View>
                <ActivityIndicator size="large" color="#d97706" style={{ marginVertical: 12 }} />
                <Text style={styles.loadingTitle}>Leimarembi Foundation</Text>
                <Text style={styles.loadingSubtitle}>Connecting to Official Governance Suite...</Text>
              </View>
            </View>
          )}
        />

        {/* Offline / Connection Error Banner */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorEmoji}>🌐</Text>
              <Text style={styles.errorTitle}>Unable to Reach Foundation Portal</Text>
              <Text style={styles.errorDesc}>
                Please check your internet connection or verify access to leimarembifoundation.org.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
                <Text style={styles.retryBtnText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: 52,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctrlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnDisabled: {
    opacity: 0.4,
  },
  ctrlBtnText: {
    color: '#f8fafc',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  ctrlBtnTextDisabled: {
    color: '#64748b',
  },
  ctrlBtnIcon: {
    color: '#f8fafc',
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: 24,
  },
  loadingLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingLogoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  loadingTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    maxWidth: 340,
    width: '100%',
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDesc: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  retryBtn: {
    backgroundColor: '#d97706',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});