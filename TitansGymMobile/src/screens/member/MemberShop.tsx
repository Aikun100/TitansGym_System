import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Modal, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { shopApi, getApiBaseUrl } from '../../services/api';

export default function MemberShopScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const url = await getApiBaseUrl();
      // Remove '/api' from the end
      setBaseUrl(url.replace(/\/api$/, ''));
      loadProducts();
    };
    init();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await shopApi.getProducts();
      const sessionProduct = {
        id: 'session',
        name: '1 Day Gym Session',
        category: 'Services',
        price: '60.00',
        image_url: null,
      };
      setProducts([sessionProduct, ...data]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    Alert.alert(
      'Payment Method',
      'How would you like to pay?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Cash at Counter', onPress: () => processCheckout('cash') },
        { text: 'GCash / Maya', onPress: () => processCheckout('paymongo') }
      ]
    );
  };

  const processCheckout = async (method: 'cash' | 'paymongo') => {
    try {
      setCheckoutLoading(true);
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.qty
      }));
      
      const res = await shopApi.checkoutOrder(items, method);
      
      if (method === 'paymongo' && res.checkout_url) {
        // Open the PayMongo URL in browser so they can pay
        Linking.openURL(res.checkout_url);
      }

      if (res.order && res.order.qr_code) {
        setQrCode(res.order.qr_code);
        setCart([]); // Clear cart
      }
    } catch (e: any) {
      console.log(e);
      Alert.alert('Checkout Failed', e.message || 'Something went wrong.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundSecondary} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Titans Shop</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => setShowCart(true)}>
          <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.reduce((s, i) => s + i.qty, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionDesc}>Fuel your workout. Order here and pick up at the counter.</Text>
          
          <View style={styles.gridContainer}>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                {product.id === 'session' ? (
                  <View style={[styles.productImg, { backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="barbell" size={40} color={COLORS.primary} />
                  </View>
                ) : (
                  <Image source={{ uri: getImageUrl(product.image_url) }} style={styles.productImg} />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productCat}>{product.category}</Text>
                  <View style={styles.productBottomRow}>
                    <Text style={styles.productPrice}>₱{parseFloat(product.price).toFixed(2)}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)}>
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>
            
            {cart.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="cart-outline" size={48} color={COLORS.border} />
                <Text style={{ color: COLORS.textTertiary, marginTop: 12 }}>Your cart is empty.</Text>
              </View>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 400 }}>
                  {cart.map(item => (
                    <View key={item.product.id} style={styles.cartItem}>
                      {item.product.id === 'session' ? (
                        <View style={[styles.cartItemImg, { backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="barbell" size={20} color={COLORS.primary} />
                        </View>
                      ) : (
                        <Image source={{ uri: getImageUrl(item.product.image_url) }} style={styles.cartItemImg} />
                      )}
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.product.name}</Text>
                        <Text style={styles.cartItemPrice}>₱{parseFloat(item.product.price).toFixed(2)}</Text>
                      </View>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity onPress={() => updateQty(item.product.id, -1)} style={styles.qtyBtn}>
                          <Ionicons name="remove" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                        <TouchableOpacity onPress={() => updateQty(item.product.id, 1)} style={styles.qtyBtn}>
                          <Ionicons name="add" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={{ marginLeft: 12 }}>
                          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.cartFooter}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₱{totalAmount.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={checkoutLoading}>
                    {checkoutLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.checkoutBtnText}>Checkout & Get QR</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal visible={!!qrCode} animationType="fade" transparent>
        <View style={styles.qrOverlay}>
          <View style={styles.qrContent}>
            <View style={styles.qrHeader}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              <Text style={styles.qrTitle}>Order Placed!</Text>
            </View>
            <Text style={styles.qrDesc}>Show this QR code to the cashier to pay and claim your items.</Text>
            
            <View style={styles.qrBox}>
              {qrCode && (
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}` }} 
                  style={{ width: 200, height: 200 }} 
                />
              )}
            </View>
            <Text style={styles.qrCodeText}>{qrCode}</Text>

            <TouchableOpacity style={styles.qrDoneBtn} onPress={() => { setQrCode(null); setShowCart(false); }}>
              <Text style={styles.qrDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.backgroundSecondary, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  cartBtn: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 0, right: -5, backgroundColor: COLORS.danger, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  
  scrollContent: { padding: 20, paddingBottom: SIZES.tabBarHeight + 100 },
  sectionDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: COLORS.cardBg, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, ...SHADOWS.small },
  productImg: { width: '100%', height: 120, backgroundColor: COLORS.surface },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: COLORS.text, height: 40 },
  productCat: { fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  productBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  productPrice: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cartItemImg: { width: 50, height: 50, borderRadius: 8, backgroundColor: COLORS.surface },
  cartItemInfo: { flex: 1, marginLeft: 12 },
  cartItemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cartItemPrice: { fontSize: 14, color: COLORS.primary, fontWeight: '800', marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginHorizontal: 10 },
  
  cartFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: COLORS.textSecondary },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  checkoutBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  qrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrContent: { backgroundColor: COLORS.cardBg, width: '100%', borderRadius: 24, padding: 30, alignItems: 'center' },
  qrHeader: { alignItems: 'center', marginBottom: 16 },
  qrTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 8 },
  qrDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  qrBox: { padding: 20, backgroundColor: '#FFF', borderRadius: 16 },
  qrCodeText: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginTop: 16, letterSpacing: 2 },
  qrDoneBtn: { marginTop: 30, backgroundColor: COLORS.surface, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 },
  qrDoneText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
});
