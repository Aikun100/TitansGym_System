import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Modal, ActivityIndicator, StatusBar, Image, TextInput, Platform, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { cashierApi, shopApi, getApiBaseUrl } from '../../services/api';

const GREEN = '#10B981';
const GREEN_DARK = '#047857';
const GLASS_BG = 'rgba(255, 255, 255, 0.05)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.1)';

// POS-only items that aren't in the shop catalog
const POS_ITEMS = [
  { id: 'session', name: 'Gym Session', price: 60, icon: 'barbell-outline', color: GREEN, category: 'Services' },
  { id: 'locker', name: 'Locker Rental', price: 50, icon: 'lock-closed-outline', color: '#06B6D4', category: 'Services' },
  { id: 'towel', name: 'Towel Rental', price: 30, icon: 'shirt-outline', color: '#A855F7', category: 'Services' },
];

export default function CashierPOS({ navigation, route }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [member, setMember] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState('Services');

  const insets = useSafeAreaInsets();
  const tabBarHeight = Math.max(insets.bottom, 8) + 62;

  useEffect(() => {
    loadShopProducts();
  }, []);

  useEffect(() => {
    if (route.params?.scannedMember) {
      setMember(route.params.scannedMember);
      setCart(prev => prev.map(item =>
        item.id === 'session' ? { ...item, price: route.params.scannedMember.session_fee } : item
      ));
    }
  }, [route.params?.scannedMember]);

  const loadShopProducts = async () => {
    try {
      const url = await getApiBaseUrl();
      setBaseUrl(url.replace(/\/api$/, ''));
      const data = await shopApi.getProducts();
      setShopProducts(data);
    } catch (e) {
      console.log('Product load error:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Merge POS items + shop products into categorized list
  const uniqueShopCats = Array.from(new Set(shopProducts.map(p => p.category || 'Products'))).filter(c => c !== 'Services');
  const allCategories = ['Services', ...uniqueShopCats];

  const displayedItems = activeCategory === 'Services'
    ? POS_ITEMS
    : shopProducts.filter(p => (p.category || 'Products') === activeCategory).map(p => ({
        id: `shop_${p.id}`,
        _productId: p.id,
        name: p.name,
        price: parseFloat(p.price),
        image_url: p.image_url,
        color: '#F59E0B',
        category: p.category,
      }));

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      const price = product.id === 'session' && member ? member.session_fee : product.price;
      return [...prev, { ...product, price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newQty = p.qty + delta;
      return newQty <= 0 ? null : { ...p, qty: newQty };
    }).filter(Boolean) as any[]);
  };

  const clearCart = () => { setCart([]); setMember(null); };
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const lookupMember = async () => {
    if (!memberIdInput.trim()) return;
    setLookingUp(true);
    try {
      const data = await cashierApi.getMember(memberIdInput.trim());
      setMember(data);
      setCart(prev => prev.map(item =>
        item.id === 'session' ? { ...item, price: data.session_fee } : item
      ));
      setMemberIdInput('');
    } catch (e: any) {
      Alert.alert('Not Found', e.message || 'Member not found');
    } finally {
      setLookingUp(false);
    }
  };

  const processPayment = async (method: 'cash' | 'paymongo') => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await cashierApi.createSessionPayment({
        member_id: member?.id || null,
        amount: total,
        description: 'Gym POS Transaction',
        method,
        items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      });
      if (res.type === 'free' || res.type === 'cash') {
        Alert.alert('✅ Success', res.message);
        setShowCheckout(false);
        clearCart();
      } else if (res.type === 'paymongo') {
        setCheckoutUrl(res.checkout_url);
        setCheckoutId(res.checkout_id);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const verifyQR = async () => {
    if (!checkoutId) return;
    setProcessing(true);
    try {
      const res = await cashierApi.verifySessionPayment(checkoutId);
      Alert.alert('✅ Paid!', res.message);
      setCheckoutUrl(null); setCheckoutId(null);
      setShowCheckout(false);
      clearCart();
    } catch {
      Alert.alert('Pending', 'Payment not completed yet. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={[s.container, { paddingBottom: tabBarHeight }]}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Point of Sale</Text>
          <Text style={s.headerSub}>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={s.clearBtn} disabled={cart.length === 0}>
          <Ionicons name="refresh" size={15} color={cart.length > 0 ? COLORS.danger : 'rgba(255,255,255,0.2)'} />
          <Text style={[s.clearText, cart.length === 0 && { color: 'rgba(255,255,255,0.2)' }]}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Member Bar */}
      <View style={s.memberSection}>
        {member ? (
          <View style={s.memberActive}>
            <View style={s.memberAvatar}>
              <Ionicons name="person" size={18} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.memberName}>{member.name}</Text>
              <Text style={s.memberType}>
                {member.membership_type?.toUpperCase()} · Session: {member.session_fee === 0 ? 'FREE' : `₱${member.session_fee}`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMember(null)} style={s.memberRemove}>
              <Ionicons name="close" size={14} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.memberLookup}>
            <View style={s.lookupInput}>
              <Ionicons name="search-outline" size={17} color="rgba(255,255,255,0.3)" />
              <TextInput
                style={s.lookupField}
                placeholder="Search member by ID..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={memberIdInput}
                onChangeText={setMemberIdInput}
                keyboardType="number-pad"
                onSubmitEditing={lookupMember}
              />
              {lookingUp && <ActivityIndicator size="small" color={GREEN} />}
            </View>
            <TouchableOpacity style={s.lookupBtn} onPress={lookupMember} disabled={lookingUp}>
              <Text style={s.lookupBtnText}>Find</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.scanBtn} onPress={() => navigation.navigate('Scanner')}>
              <Ionicons name="qr-code-outline" size={19} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsContent}>
        {allCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.tab, activeCategory === cat && s.tabActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[s.tabText, activeCategory === cat && s.tabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.productsGrid} showsVerticalScrollIndicator={false}>
        {loadingProducts && activeCategory !== 'Services' ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 40 }} />
        ) : (
          <View style={s.grid}>
            {displayedItems.map(p => {
              const imgUrl = (p as any).image_url ? getImageUrl((p as any).image_url) : null;
              const inCart = cart.find(c => c.id === p.id);
              return (
                <TouchableOpacity key={p.id} style={s.productCard} onPress={() => addToCart(p)} activeOpacity={0.75}>
                  {imgUrl ? (
                    <Image source={{ uri: imgUrl }} style={s.productImg} resizeMode="cover" />
                  ) : (
                    <View style={[s.productIconBox, { backgroundColor: (p as any).color + '18' }]}>
                      <Ionicons name={((p as any).icon || 'pricetag-outline') as any} size={26} color={(p as any).color} />
                    </View>
                  )}
                  <View style={s.productInfo}>
                    <Text style={s.productName} numberOfLines={2}>{p.name}</Text>
                    <View style={s.productPriceRow}>
                      <Text style={s.productPrice}>
                        {p.id === 'session' && member
                          ? member.session_fee === 0 ? 'FREE' : `₱${member.session_fee}`
                          : `₱${p.price}`}
                      </Text>
                      <View style={[s.addBadge, inCart && { backgroundColor: GREEN + '40' }]}>
                        {inCart
                          ? <Text style={s.addBadgeCount}>{inCart.qty}</Text>
                          : <Ionicons name="add" size={14} color="#FFF" />}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Cart Footer */}
      <View style={s.cartFooter}>
        {cart.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cartItems}>
            {cart.map(item => (
              <View key={item.id} style={s.cartChip}>
                <Text style={s.cartChipName} numberOfLines={1}>{item.name}</Text>
                <View style={s.cartChipQty}>
                  <TouchableOpacity onPress={() => updateQty(item.id, -1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="remove-circle" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                  <Text style={s.cartChipCount}>{item.qty}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.id, 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="add-circle" size={18} color={GREEN} />
                  </TouchableOpacity>
                </View>
                <Text style={s.cartChipTotal}>₱{(item.price * item.qty).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity
          style={[s.chargeBtn, cart.length === 0 && { opacity: 0.35 }]}
          disabled={cart.length === 0}
          onPress={() => setShowCheckout(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[GREEN, GREEN_DARK]} style={s.chargeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="card-outline" size={20} color="#FFF" />
            <Text style={s.chargeText}>Charge ₱{total.toLocaleString()}</Text>
            <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Checkout Modal */}
      <Modal visible={showCheckout} transparent animationType="slide" statusBarTranslucent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {!checkoutUrl ? (
              <>
                <View style={s.modalHandle} />
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Choose Payment</Text>
                  <TouchableOpacity onPress={() => setShowCheckout(false)} style={s.modalClose}>
                    <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>
                <Text style={s.modalTotal}>₱{total.toLocaleString()}</Text>
                <Text style={s.modalSub}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''} · {member ? member.name : 'Walk-in Guest'}
                </Text>

                <TouchableOpacity style={s.methodBtn} onPress={() => processPayment('cash')} disabled={processing}>
                  <View style={[s.methodIcon, { backgroundColor: GREEN + '18' }]}>
                    <Ionicons name="cash" size={22} color={GREEN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.methodTitle}>Cash</Text>
                    <Text style={s.methodDesc}>Accept cash payment & log immediately</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>

                {total > 0 && (
                  <TouchableOpacity style={s.methodBtn} onPress={() => processPayment('paymongo')} disabled={processing}>
                    <View style={[s.methodIcon, { backgroundColor: COLORS.accent + '18' }]}>
                      <Ionicons name="phone-portrait" size={22} color={COLORS.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.methodTitle}>GCash / Maya</Text>
                      <Text style={s.methodDesc}>Generate PayMongo QR code</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                )}
                {processing && <ActivityIndicator style={{ marginTop: 20 }} color={GREEN} />}
              </>
            ) : (
              <>
                <View style={s.modalHandle} />
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Scan to Pay</Text>
                  <TouchableOpacity onPress={() => { setCheckoutUrl(null); setCheckoutId(null); }} style={s.modalClose}>
                    <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>
                <View style={s.qrBox}>
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(checkoutUrl)}` }}
                    style={{ width: 220, height: 220, borderRadius: 8 }}
                  />
                  <Text style={s.qrAmount}>₱{total.toLocaleString()}</Text>
                  <Text style={s.qrHelp}>Ask member to scan with GCash or Maya app</Text>
                </View>
                <TouchableOpacity style={s.verifyBtn} onPress={verifyQR} disabled={processing}>
                  <LinearGradient colors={[GREEN, GREEN_DARK]} style={s.verifyGradient}>
                    {processing ? <ActivityIndicator color="#FFF" /> : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={s.verifyText}>Verify Payment</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 14 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' },
  clearText: { color: COLORS.danger, fontWeight: '800', fontSize: 10, letterSpacing: 1.5 },

  // Member
  memberSection: { paddingHorizontal: 20, marginBottom: 10 },
  memberActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', padding: 14, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', gap: 12 },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center' },
  memberName: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  memberType: { color: GREEN, fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  memberRemove: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  memberLookup: { flexDirection: 'row', gap: 8 },
  lookupInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: GLASS_BG, borderRadius: 22, paddingHorizontal: 14, height: 46, gap: 10, borderWidth: 1, borderColor: GLASS_BORDER },
  lookupField: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '600' },
  lookupBtn: { backgroundColor: GREEN, borderRadius: 22, paddingHorizontal: 20, height: 46, justifyContent: 'center', alignItems: 'center' },
  lookupBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  scanBtn: { backgroundColor: COLORS.accent, borderRadius: 22, width: 46, height: 46, justifyContent: 'center', alignItems: 'center' },

  // Category Tabs
  tabsScroll: { maxHeight: 44, marginBottom: 6 },
  tabsContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER },
  tabActive: { backgroundColor: GREEN + '22', borderColor: GREEN + '50' },
  tabText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  tabTextActive: { color: GREEN },

  // Products
  productsGrid: { paddingHorizontal: 16, paddingBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCard: { width: '31%', backgroundColor: GLASS_BG, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: GLASS_BORDER },
  productImg: { width: '100%', height: 90, backgroundColor: '#1a1a1a' },
  productIconBox: { width: '100%', height: 90, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 10 },
  productName: { fontSize: 11, fontWeight: '700', color: '#FFF', lineHeight: 15, marginBottom: 8 },
  productPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 13, fontWeight: '900', color: GREEN },
  addBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center' },
  addBadgeCount: { fontSize: 11, fontWeight: '900', color: GREEN },

  // Cart Footer
  cartFooter: { backgroundColor: '#111113', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: 20, borderTopWidth: 1, borderTopColor: GLASS_BORDER },
  cartItems: { marginBottom: 14, maxHeight: 64 },
  cartChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: GLASS_BG, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, gap: 8, borderWidth: 1, borderColor: GLASS_BORDER, maxWidth: 200 },
  cartChipName: { fontSize: 11, color: '#FFF', fontWeight: '700', maxWidth: 70 },
  cartChipQty: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cartChipCount: { fontSize: 13, fontWeight: '900', color: '#FFF', minWidth: 18, textAlign: 'center' },
  cartChipTotal: { fontSize: 12, fontWeight: '900', color: GREEN },
  chargeBtn: { borderRadius: 22, overflow: 'hidden' },
  chargeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 10 },
  chargeText: { color: '#FFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { backgroundColor: '#18181B', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: GLASS_BORDER },
  modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: GLASS_BG, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: GLASS_BORDER },
  modalTotal: { fontSize: 46, fontWeight: '900', color: GREEN, letterSpacing: -2, marginTop: 8 },
  modalSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  methodBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: GLASS_BG, padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: GLASS_BORDER, gap: 16 },
  methodIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  methodTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  methodDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: '500' },
  qrBox: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginVertical: 20 },
  qrAmount: { fontSize: 30, fontWeight: '900', color: '#111', marginTop: 14 },
  qrHelp: { fontSize: 13, color: '#666', marginTop: 8, textAlign: 'center', fontWeight: '600' },
  verifyBtn: { borderRadius: 22, overflow: 'hidden' },
  verifyGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 10 },
  verifyText: { color: '#FFF', fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
});
