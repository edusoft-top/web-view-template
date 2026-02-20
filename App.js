import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [webViewReady, setWebViewReady] = useState(false);
  const webViewRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'ต้องการสิทธิ์เข้าถึงตำแหน่ง',
            'แอพนี้ต้องการเข้าถึงตำแหน่งของคุณเพื่อใช้งานอย่างเต็มรูปแบบ',
            [{ text: 'ตกลง', style: 'default' }]
          );
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 10000,
          timeout: 15000,
        });
        
        setLocation(currentLocation);
        locationRef.current = currentLocation;

        if (webViewReady && webViewRef.current) {
          sendLocationToWebView(currentLocation);
        }

        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 5,
            mayShowUserSettingsDialog: true,
          },
          (newLocation) => {
            setLocation(newLocation);
            locationRef.current = newLocation;
            
            if (webViewReady && webViewRef.current) {
              sendLocationToWebView(newLocation);
            }
          }
        );

        return () => {
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      } catch (error) {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าถึงตำแหน่งได้');
      }
    })();
  }, []);

  useEffect(() => {
    if (webViewReady && locationRef.current && webViewRef.current) {
      sendLocationToWebView(locationRef.current);
    }
  }, [webViewReady]);

  useEffect(() => {
    if (location && webViewReady && webViewRef.current) {
      sendLocationToWebView(location);
    }
  }, [location, webViewReady]);

  const sendLocationToWebView = (locationData) => {
    if (!webViewRef.current) return;
    
    const data = {
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
      accuracy: locationData.coords.accuracy,
      altitude: locationData.coords.altitude,
      heading: locationData.coords.heading,
      speed: locationData.coords.speed,
    };
    
    const jsCode = `
      (function() {
        try {
          const locationData = ${JSON.stringify(data)};
          window.nativeLocation = locationData;
          
          const callbacks = [...(window.geolocationCallbacks || [])];
          window.geolocationCallbacks = [];
          
          callbacks.forEach(callback => {
            try {
              callback(locationData);
            } catch (e) {}
          });
          
          if (window.geolocationWatchers) {
            Object.values(window.geolocationWatchers).forEach(watcher => {
              try {
                watcher.success(locationData);
              } catch (e) {}
            });
          }
          
          const event = new CustomEvent('locationUpdate', { detail: locationData });
          window.dispatchEvent(event);
        } catch (e) {}
      })();
      true;
    `;
    
    webViewRef.current.injectJavaScript(jsCode);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setWebViewReady(true);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setWebViewReady(false);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'REQUEST_LOCATION') {
        if (locationRef.current) {
          sendLocationToWebView(locationRef.current);
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  };

  const Container = Platform.OS === 'ios' ? View : SafeAreaView;
  const topPadding = Platform.OS === 'ios' ? 
    (Platform.constants?.interfaceIdiom === 'pad' ? 40 : 60) : 20; //status bar height (ipad, iphone, android)
  
  return (
    <Container style={[
      styles.container,
      Platform.OS === 'ios' && { paddingTop: topPadding }
    ]}>
      <StatusBar style="light" />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://edusoft.top' }} // Replace with your URL
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          bounces={false}
          cacheEnabled={true}
          incognito={false}
          geolocationEnabled={true}
          allowsBackForwardNavigationGestures={false}
          
          {...(Platform.OS === 'ios' ? {
            allowsLinkPreview: false,
            automaticallyAdjustContentInsets: false,
            contentInsetAdjustmentBehavior: "never",
            hideKeyboardAccessoryView: true,
            keyboardDisplayRequiresUserAction: false,
            suppressMenuItems: ['copy', 'select', 'selectAll', 'paste'],
          } : {})}
          
          injectedJavaScriptBeforeContentLoaded={`
            window.nativeLocation = null;
            window.geolocationCallbacks = [];
            window.geolocationWatchers = {};
            window.watcherIdCounter = 1;
            window.locationRequested = false;

            window.requestLocationFromNative = function() {
              if (!window.locationRequested) {
                window.locationRequested = true;
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'REQUEST_LOCATION'
                  }));
                } catch (e) {}
              }
            };

            (function() {
              function createPositionObject(nativeData) {
                return {
                  coords: {
                    latitude: nativeData.latitude,
                    longitude: nativeData.longitude,
                    accuracy: nativeData.accuracy || 10,
                    altitude: nativeData.altitude,
                    altitudeAccuracy: null,
                    heading: nativeData.heading,
                    speed: nativeData.speed
                  },
                  timestamp: Date.now()
                };
              }

              navigator.geolocation.getCurrentPosition = function(success, error, options) {
                if (window.nativeLocation) {
                  const position = createPositionObject(window.nativeLocation);
                  setTimeout(() => success(position), 0);
                } else {
                  window.requestLocationFromNative();
                  
                  const callback = (locationData) => {
                    const position = createPositionObject(locationData);
                    success(position);
                  };
                  
                  window.geolocationCallbacks.push(callback);
                  
                  const timeout = (options && options.timeout) || 20000;
                  const timeoutId = setTimeout(() => {
                    const index = window.geolocationCallbacks.indexOf(callback);
                    if (index > -1) {
                      window.geolocationCallbacks.splice(index, 1);
                      
                      if (error) {
                        error({
                          code: 3,
                          message: 'Timeout waiting for location',
                          TIMEOUT: 3
                        });
                      }
                    }
                  }, timeout);
                  
                  const originalCallback = callback;
                  window.geolocationCallbacks[window.geolocationCallbacks.length - 1] = function(data) {
                    clearTimeout(timeoutId);
                    originalCallback(data);
                  };
                }
              };

              navigator.geolocation.watchPosition = function(success, error, options) {
                const watcherId = window.watcherIdCounter++;
                
                window.geolocationWatchers[watcherId] = {
                  success: (locationData) => {
                    const position = createPositionObject(locationData);
                    success(position);
                  },
                  error: error
                };
                
                if (window.nativeLocation) {
                  const position = createPositionObject(window.nativeLocation);
                  setTimeout(() => success(position), 0);
                } else {
                  window.requestLocationFromNative();
                }
                
                return watcherId;
              };

              navigator.geolocation.clearWatch = function(watcherId) {
                delete window.geolocationWatchers[watcherId];
              };
            })();

            const metaViewport = document.createElement('meta');
            metaViewport.name = 'viewport';
            metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            
            const existingViewport = document.querySelector('meta[name="viewport"]');
            if (existingViewport) {
              existingViewport.remove();
            }
            
            if (document.head) {
              document.head.appendChild(metaViewport);
            } else {
              document.addEventListener('DOMContentLoaded', () => {
                document.head.appendChild(metaViewport);
              });
            }

            const preventZoom = (e) => {
              if (e.touches && e.touches.length > 1) {
                e.preventDefault();
                return false;
              }
            };

            document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
            document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
            document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
            
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
              const now = Date.now();
              if (now - lastTouchEnd <= 300) {
                e.preventDefault();
              }
              lastTouchEnd = now;
            }, { passive: false });

            document.addEventListener('touchstart', preventZoom, { passive: false });
            document.addEventListener('touchmove', preventZoom, { passive: false });

            window.requestLocationFromNative();
            
            true;
          `}
          
          injectedJavaScript={`
            const processInputs = () => {
              const inputs = document.querySelectorAll('input, textarea, select');
              inputs.forEach(input => {
                input.style.fontSize = '16px';
                input.style.webkitTextSizeAdjust = '100%';
                input.style.textSizeAdjust = '100%';
              });
            };
            
            processInputs();
            
            const observer = new MutationObserver(() => {
              processInputs();
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            true;
          `}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    zIndex: 1000,
  },
});

export default App;