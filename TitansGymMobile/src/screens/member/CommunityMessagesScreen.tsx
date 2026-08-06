import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar,
  TextInput, KeyboardAvoidingView, Platform, Alert, Modal, Animated,
  Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { socialApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];
const POLL_INTERVAL_MS = 6000; // poll every 6s to reduce lag

// ─── Memoised message bubble to prevent re-renders of untouched messages ───
const MessageBubble = memo(({
  msg, isMe, myAvatar, friendAvatar, friendName, userName,
  onLongPress, onReact,
}: any) => {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name[0]).toUpperCase();
  };

  const renderAvatar = (url: string | null, name: string, side: 'left' | 'right') => {
    const s = side === 'right' ? { marginLeft: 8, marginRight: 0 } : {};
    if (url) return <Image source={{ uri: url }} style={[styles.msgAvatar, s]} />;
    return (
      <View style={[styles.msgAvatar, styles.initAvatar, s]}>
        <Text style={styles.initText}>{getInitials(name)}</Text>
      </View>
    );
  };

  const reactionMap = msg.reactions || [];

  if (msg.unsent) {
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.meBubbleWrapper : styles.themBubbleWrapper]}>
        {!isMe && renderAvatar(friendAvatar, friendName, 'left')}
        <View style={[styles.bubble, styles.unsentBubble]}>
          <Text style={styles.unsentText}>
            <Ionicons name="refresh-circle-outline" size={13} /> You unsent a message
          </Text>
        </View>
        {isMe && renderAvatar(myAvatar, userName, 'right')}
      </View>
    );
  }

  return (
    <Pressable
      onLongPress={() => onLongPress(msg)}
      style={[styles.bubbleWrapper, isMe ? styles.meBubbleWrapper : styles.themBubbleWrapper]}
    >
      {!isMe && renderAvatar(friendAvatar, friendName, 'left')}
      <View style={{ maxWidth: '80%' }}>
        <View style={[styles.bubble, isMe ? styles.meBubble : styles.themBubble]}>
          {msg.imageUrl && (
            <Image source={{ uri: msg.imageUrl }} style={styles.msgImage} />
          )}
          {msg.text ? (
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
              {msg.text}
            </Text>
          ) : null}
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeThem]}>
              {msg.time}
            </Text>
            {isMe && (
              <Ionicons
                name={msg.isRead ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={msg.isRead ? '#93C5FD' : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>

        {/* Reactions */}
        {reactionMap.length > 0 && (
          <View style={[styles.reactionsRow, isMe && { justifyContent: 'flex-end' }]}>
            {reactionMap.map((r: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[styles.reactionBadge, r.hasReacted && styles.reactionBadgeActive]}
                onPress={() => onReact(msg.id, r.emoji)}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                <Text style={styles.reactionCount}>{r.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {isMe && renderAvatar(myAvatar, userName, 'right')}
    </Pressable>
  );
});

export default function CommunityMessagesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const friendId = route.params?.friendId || '1';
  const friendName = route.params?.friendName || 'Friend';
  const friendAvatarRaw = route.params?.friendAvatar;
  const friendAvatar = (friendAvatarRaw && friendAvatarRaw !== 'https://via.placeholder.com/150') ? friendAvatarRaw : null;
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Context menu state
  const [contextMsg, setContextMsg] = useState<any | null>(null);
  const [showContext, setShowContext] = useState(false);

  // Reaction picker state
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const myAvatar = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000/storage/${user.avatar}`)
    : null;

  // ─── Load messages (deduplication to avoid flicker) ───
  const loadMessages = useCallback(async (silent = false) => {
    try {
      const data = await socialApi.getMessages(friendId);
      setMessages(prev => {
        // Only update if data actually changed (compare by last id)
        const newLast = data[data.length - 1]?.id;
        const oldLast = prev[prev.length - 1]?.id;
        return newLast !== oldLast ? data : prev;
      });
    } catch (e) {
      if (!silent) console.log('Load messages error:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [friendId]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
      pollRef.current = setInterval(() => loadMessages(true), POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, [loadMessages])
  );

  // Scroll to end when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;
    const txt = inputText.trim();
    const imgData = selectedImage;
    setInputText('');
    setSelectedImage(null);
    setSending(true);

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: user?.id?.toString() || 'me',
      text: txt,
      imageUrl: imgData?.uri,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isRead: false,
      unsent: false,
      reactions: [],
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      await socialApi.sendMessage(parseInt(friendId), txt, imgData?.base64);
      loadMessages(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  // ─── Long-press context menu ───
  const handleLongPress = (msg: any) => {
    setContextMsg(msg);
    setShowContext(true);
  };

  const handleDelete = async () => {
    if (!contextMsg) return;
    setShowContext(false);
    setMessages(prev => prev.filter(m => m.id !== contextMsg.id));
    try { await socialApi.deleteMessage(contextMsg.id); } catch (e) { loadMessages(true); }
    setContextMsg(null);
  };

  const handleUnsend = async () => {
    if (!contextMsg) return;
    setShowContext(false);
    setMessages(prev => prev.map(m => m.id === contextMsg.id ? { ...m, unsent: true, text: null, imageUrl: null } : m));
    try { await socialApi.unsendMessage(contextMsg.id); } catch (e) { loadMessages(true); }
    setContextMsg(null);
  };

  const handleReact = async (msgId: string, emoji: string) => {
    // Optimistic update
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = (m.reactions || []).find((r: any) => r.emoji === emoji);
      let newReactions: any[];
      if (existing?.hasReacted) {
        newReactions = (m.reactions || [])
          .map((r: any) => r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r)
          .filter((r: any) => r.count > 0);
      } else {
        // Remove old reaction first
        const cleaned = (m.reactions || []).map((r: any) => r.hasReacted ? { ...r, count: r.count - 1, hasReacted: false } : r).filter((r: any) => r.count > 0);
        const target = cleaned.find((r: any) => r.emoji === emoji);
        if (target) {
          newReactions = cleaned.map((r: any) => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r);
        } else {
          newReactions = [...cleaned, { emoji, count: 1, hasReacted: true }];
        }
      }
      return { ...m, reactions: newReactions };
    }));
    setShowReactionPicker(false);
    setReactionTarget(null);
    try { await socialApi.reactToMessage(msgId, emoji); } catch (e) { loadMessages(true); }
  };

  const openReactionPicker = () => {
    if (!contextMsg) return;
    setShowContext(false);
    setReactionTarget(contextMsg.id);
    setShowReactionPicker(true);
    setContextMsg(null);
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <MessageBubble
      msg={item}
      isMe={item.isMe}
      myAvatar={myAvatar}
      friendAvatar={friendAvatar}
      friendName={friendName}
      userName={user?.name || 'Me'}
      onLongPress={handleLongPress}
      onReact={handleReact}
    />
  ), [myAvatar, friendAvatar, friendName, user?.name]);

  const keyExtractor = useCallback((item: any) => item.id?.toString() || Math.random().toString(), []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 72, offset: 72 * index, index,
  }), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        {friendAvatar
          ? <Image source={{ uri: friendAvatar }} style={styles.headerAvatar} />
          : (
            <View style={[styles.headerAvatar, styles.initAvatar]}>
              <Text style={styles.initText}>{friendName[0]?.toUpperCase()}</Text>
            </View>
          )
        }
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{friendName}</Text>
          <View style={styles.onlineDot}>
            <View style={styles.onlineDotIndicator} />
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1, alignSelf: 'center' }} />
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews
            ListHeaderComponent={
              <View style={styles.dateBadgeContainer}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>
                    {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySub}>Say hi to {friendName}! 👋</Text>
              </View>
            }
          />
        )}

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imgPreviewBar}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imgPreview} />
            <TouchableOpacity style={styles.removeImgBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={COLORS.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() && !selectedImage) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={(!inputText.trim() && !selectedImage) || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Ionicons name="send" size={16} color="#FFF" style={{ marginLeft: 2 }} />
            }
          </TouchableOpacity>
        </View>
        <View style={{ height: Math.max(insets.bottom, 16) + 60, backgroundColor: COLORS.backgroundSecondary }} />
      </KeyboardAvoidingView>

      {/* ─── Context Menu Modal ─── */}
      <Modal visible={showContext} transparent animationType="fade" onRequestClose={() => { setShowContext(false); setContextMsg(null); }}>
        <Pressable style={styles.ctxOverlay} onPress={() => { setShowContext(false); setContextMsg(null); }}>
          <View style={styles.ctxMenu}>
            <Text style={styles.ctxTitle}>Message Options</Text>

            <TouchableOpacity style={styles.ctxRow} onPress={openReactionPicker}>
              <Text style={styles.ctxEmoji}>😊</Text>
              <Text style={styles.ctxText}>React to Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctxRow} onPress={() => {
              if (contextMsg?.text) {
                setInputText(contextMsg.text);
                setShowContext(false);
                setContextMsg(null);
              }
            }}>
              <Ionicons name="copy-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.ctxText}>Copy Text</Text>
            </TouchableOpacity>

            {contextMsg?.isMe && !contextMsg?.unsent && (
              <TouchableOpacity style={styles.ctxRow} onPress={handleUnsend}>
                <Ionicons name="refresh-circle-outline" size={20} color={COLORS.warning} />
                <Text style={[styles.ctxText, { color: COLORS.warning }]}>Unsend Message</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.ctxRow, styles.ctxRowDanger]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.ctxText, { color: COLORS.danger }]}>Delete for Me</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ─── Reaction Picker Modal ─── */}
      <Modal visible={showReactionPicker} transparent animationType="fade" onRequestClose={() => setShowReactionPicker(false)}>
        <Pressable style={styles.ctxOverlay} onPress={() => setShowReactionPicker(false)}>
          <View style={styles.reactionPickerBox}>
            <Text style={styles.ctxTitle}>React</Text>
            <View style={styles.emojiGrid}>
              {REACTION_EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiBtn}
                  onPress={() => reactionTarget && handleReact(reactionTarget, emoji)}
                >
                  <Text style={styles.emojiGlyph}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 14,
    backgroundColor: COLORS.backgroundSecondary, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  initAvatar: { backgroundColor: COLORS.primary + '40', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary },
  initText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  onlineDot: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDotIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  headerStatus: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  headerAction: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  // List
  listContent: { paddingHorizontal: 12, paddingBottom: 16, flexGrow: 1 },
  dateBadgeContainer: { alignItems: 'center', marginVertical: 16 },
  dateBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
  dateBadgeText: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary },

  // Bubbles
  bubbleWrapper: { flexDirection: 'row', marginBottom: 12 },
  meBubbleWrapper: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  themBubbleWrapper: { alignSelf: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignSelf: 'flex-end' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, maxWidth: '100%' },
  meBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4, marginLeft: 8 },
  themBubble: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.cardBorder, borderBottomLeftRadius: 4, marginRight: 8 },
  unsentBubble: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  unsentText: { fontSize: 13, color: COLORS.textTertiary, fontStyle: 'italic' },
  msgImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextMe: { color: '#FFF' },
  msgTextThem: { color: COLORS.text },
  msgMeta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  msgTime: { fontSize: 10 },
  msgTimeMe: { color: 'rgba(255,255,255,0.65)' },
  msgTimeThem: { color: COLORS.textTertiary },

  // Reactions
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4, marginLeft: 8 },
  reactionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.surface, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reactionBadgeActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  // Input
  imgPreviewBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8,
    backgroundColor: COLORS.backgroundSecondary, position: 'relative',
  },
  imgPreview: { width: 72, height: 72, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary },
  removeImgBtn: { position: 'absolute', top: 0, left: 72, backgroundColor: COLORS.surface, borderRadius: 12 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10,
    backgroundColor: COLORS.backgroundSecondary, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
  },
  attachBtn: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  inputBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 22, paddingHorizontal: 16,
    minHeight: 44, maxHeight: 120, justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  input: { fontSize: 15, color: COLORS.text, paddingTop: 10, paddingBottom: 10 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  sendBtnDisabled: { backgroundColor: COLORS.surface },

  // Context Menu
  ctxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  ctxMenu: {
    backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 20, paddingBottom: 36, paddingHorizontal: 20,
  },
  ctxTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  ctxRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  ctxRowDanger: { borderBottomWidth: 0 },
  ctxEmoji: { fontSize: 20 },
  ctxText: { fontSize: 16, color: COLORS.text, fontWeight: '600' },

  // Reaction Picker
  reactionPickerBox: {
    backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 20, paddingBottom: 36, paddingHorizontal: 20,
  },
  emojiGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  emojiBtn: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface },
  emojiGlyph: { fontSize: 28 },
});
