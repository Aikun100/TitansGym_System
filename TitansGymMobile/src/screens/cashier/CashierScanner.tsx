import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { cashierApi } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const SCANNER_COLOR = '#10B981'; // Emerald Green

export default function CashierScanner({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanLineAnim] = useState(new Animated.Value(0));
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Animate the scan line up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 200,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Don't auto simulate scan anymore, let them manually click simulate or enter code
  }, []);

  const handleSimulateMember = async () => {
    try {
      setLoading(true);
      const member = await cashierApi.simulateScan();
      Alert.alert('Scan Successful', `Found Member: ${member.name}`);
      navigation.navigate('POS', { scannedMember: member });
    } catch (e: any) {
      Alert.alert('Scan Failed', e.message || 'No member found.');
    } finally {
      setLoading(false);
    }
  };


  const handleScanFromImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);
      const asset = result.assets[0];

      // Upload to api.qrserver.com to decode
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'qrcode.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data && data[0] && data[0].symbol && data[0].symbol[0].data) {
        const decodedText = data[0].symbol[0].data;
        if (!decodedText) {
          Alert.alert('Error', 'Could not detect any QR code in the image.');
          return;
        }
        
        // Populate the manual entry field and submit
        setManualCode(decodedText);
        
        // Wait a tiny bit for state to update then submit
        setTimeout(() => {
          // Re-use manual submit logic by calling it directly with the decoded text
          processCode(decodedText);
        }, 500);
      } else {
        Alert.alert('Error', 'Could not read QR code. Please try a clearer screenshot.');
      }
    } catch (error) {
      console.log('QR Read Error:', error);
      Alert.alert('Error', 'Failed to process image.');
    } finally {
      setLoading(false);
    }
  };

  const processCode = async (codeToProcess: string) => {
    const code = codeToProcess.trim().toUpperCase();
    try {
      setLoading(true);
      if (code.startsWith('ORD-')) {
        const res = await cashierApi.verifyOrderQr(code);
        Alert.alert(
          'Order Verified',
          `Order from: ${res.order.user.name}\nTotal: ₱${res.order.total_amount}\n\nPay with cash?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
            { 
              text: 'Complete Payment', 
              onPress: async () => {
                try {
                  await cashierApi.completeOrder(code, 'cash');
                  Alert.alert('Success', 'Order completed and inventory updated!', [
                    { text: 'OK', onPress: () => { setScanned(false); navigation.goBack(); } }
                  ]);
                  setManualCode('');
                } catch (e: any) {
                  Alert.alert('Error', 'Failed to complete order.', [{ text: 'OK', onPress: () => setScanned(false) }]);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Invalid', `Read code: ${code}\nOnly ORD- codes are supported for manual entry right now.`, [{ text: 'OK', onPress: () => setScanned(false) }]);
      }
    } catch (e: any) {
      Alert.alert('Scan Failed', e.message || 'Invalid QR Code.', [{ text: 'OK', onPress: () => setScanned(false) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    processCode(manualCode);
  };

  const handleBarcodeScanned = ({ type, data }: any) => {
    setScanned(true);
    processCode(data);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.helperText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.simulateBtn} onPress={requestPermission}>
          <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.4)']} style={styles.simulateBtnGradient}>
            <Text style={styles.simulateBtnText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Member QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.scannerBox}>
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        </View>

        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
      </View>

      <Text style={styles.helperText}>
        Position the QR code inside the frame.
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 40 }}>
        <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateMember} disabled={loading}>
          <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.4)']} style={styles.simulateBtnGradient}>
            {loading ? <ActivityIndicator color={SCANNER_COLOR} /> : (
              <>
                <Ionicons name="scan-outline" size={18} color={SCANNER_COLOR} />
                <Text style={styles.simulateBtnText}>Simulate</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.simulateBtn} onPress={handleScanFromImage} disabled={loading}>
          <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.4)']} style={styles.simulateBtnGradient}>
            <Ionicons name="image-outline" size={18} color="#60A5FA" />
            <Text style={[styles.simulateBtnText, { color: '#60A5FA' }]}>Upload QR</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.manualEntryBox}>
        <Text style={styles.manualLabel}>Or Enter Code Manually (e.g. ORD-12345)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter Code..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit} disabled={loading || !manualCode.trim()}>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 1, textTransform: 'uppercase' },
  
  scannerBox: { width: 260, height: 260, position: 'relative', marginTop: 80, marginBottom: 40, justifyContent: 'center', alignItems: 'center' },
  cameraWrapper: { width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden' },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 50, height: 50, borderTopWidth: 5, borderLeftWidth: 5, borderColor: SCANNER_COLOR, borderTopLeftRadius: 20 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 50, height: 50, borderTopWidth: 5, borderRightWidth: 5, borderColor: SCANNER_COLOR, borderTopRightRadius: 20 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 50, height: 50, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: SCANNER_COLOR, borderBottomLeftRadius: 20 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 50, height: 50, borderBottomWidth: 5, borderRightWidth: 5, borderColor: SCANNER_COLOR, borderBottomRightRadius: 20 },
  
  scanLine: { width: '100%', height: 3, backgroundColor: SCANNER_COLOR, position: 'absolute', top: 25, shadowColor: SCANNER_COLOR, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 15, elevation: 10, zIndex: 10 },
  
  helperText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22, marginBottom: 30, fontWeight: '500' },
  
  simulateBtn: { borderRadius: 30, marginBottom: 40, overflow: 'hidden' },
  simulateBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14 },
  simulateBtnText: { color: SCANNER_COLOR, fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  
  manualEntryBox: { width: '100%', paddingHorizontal: 30, alignItems: 'center' },
  manualLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  input: { flex: 1, height: 54, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 27, paddingHorizontal: 24, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 12, fontWeight: '600' },
  submitBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: SCANNER_COLOR, justifyContent: 'center', alignItems: 'center', shadowColor: SCANNER_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
});
