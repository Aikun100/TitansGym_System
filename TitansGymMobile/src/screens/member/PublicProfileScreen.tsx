import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { socialApi } from '../../services/api';
import SectionHeader from '../../components/SectionHeader';
import { useApp } from '../../context/AppContext';

export default function PublicProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Comment State
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await socialApi.getPublicProfile(userId);
      setProfile(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      await socialApi.addFriend(userId);
      loadProfile();
    } catch (e) {
      console.log(e);
    }
  };

  const handleAcceptFriend = async () => {
    try {
      await socialApi.acceptFriend(userId);
      loadProfile();
    } catch (e) {
      console.log(e);
    }
  };

  const handleToggleLike = async (actId: number) => {
    try {
      await socialApi.toggleLike(actId);
      loadProfile(); // refresh likes
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeCommentId) return;
    try {
      await socialApi.addComment(activeCommentId, commentText.trim());
      setCommentText('');
      setShowCommentModal(false);
      setActiveCommentId(null);
      loadProfile(); // refresh activities
    } catch (e) {
      console.log(e);
    }
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <Image source={{ uri: profile.avatar_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.memberTypeBadge}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.memberTypeText}>{profile.membership_type} Member</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            {profile.friendship_status === 'accepted' ? (
              <TouchableOpacity style={styles.messageBtn} onPress={() => navigation.navigate('CommunityMessages', { friendId: profile.id, friendName: profile.name, friendAvatar: profile.avatar_url })}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            ) : profile.friendship_status === 'sent' ? (
              <TouchableOpacity style={[styles.messageBtn, { backgroundColor: COLORS.surface }]} disabled>
                <Text style={styles.messageBtnText}>Request Sent</Text>
              </TouchableOpacity>
            ) : profile.friendship_status === 'pending' ? (
              <TouchableOpacity style={[styles.messageBtn, { backgroundColor: COLORS.success }]} onPress={handleAcceptFriend}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.messageBtnText}>Accept Request</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.messageBtn} onPress={handleAddFriend}>
                <Ionicons name="person-add" size={20} color="#FFF" />
                <Text style={styles.messageBtnText}>Add Friend</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={styles.contentSection}>
          <SectionHeader title="Recent Activity" />
          
          {profile.activities.length === 0 && (
            <Text style={{ color: COLORS.textTertiary, textAlign: 'center', marginTop: 20 }}>No public activities yet.</Text>
          )}

          {profile.activities.map((act: any) => (
            <View key={act.id} style={styles.actCard}>
              <View style={styles.actHeader}>
                <Image source={{ uri: act.userAvatar || 'https://via.placeholder.com/150' }} style={styles.actAvatarSmall} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.actUserName}>{act.userName}</Text>
                  <Text style={styles.actType}>{act.title || act.type}</Text>
                  <Text style={styles.actTime}>{new Date(act.date).toLocaleDateString()} • {act.duration} mins</Text>
                </View>
              </View>
              {act.notes && <Text style={styles.actNotes}>{act.notes}</Text>}
              {act.photoUri && (
                <Image source={{ uri: act.photoUri }} style={styles.actPhoto} />
              )}
              <View style={styles.actActions}>
                <TouchableOpacity style={styles.actActionBtn} onPress={() => handleToggleLike(act.id)}>
                  <Ionicons name={act.isLiked ? "heart" : "heart-outline"} size={20} color={act.isLiked ? COLORS.danger : COLORS.textSecondary} />
                  <Text style={[styles.actActionText, act.isLiked && { color: COLORS.danger }]}>{act.likes > 0 ? act.likes : 'Like'}</Text>
                </TouchableOpacity>
                
                {profile.friendship_status === 'accepted' && (
                  <TouchableOpacity style={[styles.actActionBtn, { marginLeft: 20 }]} onPress={() => { setActiveCommentId(act.id); setShowCommentModal(true); }}>
                    <Ionicons name="chatbox-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.actActionText}>{act.comments?.length > 0 ? act.comments.length : 'Comment'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {act.comments && act.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  {act.comments.slice(0, 2).map((c: any) => (
                    <View key={c.id} style={styles.commentRow}>
                      <Text style={styles.commentUser}>{c.userName}:</Text>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  ))}
                  {act.comments.length > 2 && (
                    <TouchableOpacity onPress={() => { setActiveCommentId(act.id); setShowCommentModal(true); }}>
                      <Text style={styles.viewAllComments}>View all {act.comments.length} comments</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add Comment Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              {activeCommentId && profile.activities.find((a: any) => a.id === activeCommentId)?.comments?.map((c: any) => (
                <View key={c.id} style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Image source={{ uri: c.userAvatar || 'https://via.placeholder.com/150' }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                  <View style={{ flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>{c.userName}</Text>
                      <Text style={{ fontSize: 10, color: COLORS.textTertiary }}>{c.time}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20 }}>
              <TextInput style={{ flex: 1, color: COLORS.text, fontSize: 15 }} placeholder="Add a comment..." placeholderTextColor={COLORS.textTertiary} value={commentText} onChangeText={setCommentText} />
              <TouchableOpacity onPress={handleAddComment} disabled={!commentText.trim()} style={{ backgroundColor: commentText.trim() ? COLORS.primary : COLORS.border, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="send" size={16} color="#FFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { paddingTop: 56, paddingBottom: 30, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  memberTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.warning + '18', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  memberTypeText: { fontSize: 12, fontWeight: '700', color: COLORS.warning, textTransform: 'uppercase' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  messageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, gap: 8, ...SHADOWS.medium },
  messageBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  
  contentSection: { padding: 20 },
  
  actCard: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  actHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actAvatarSmall: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  actUserName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  actType: { fontSize: 12, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  actTime: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  actNotes: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  actPhoto: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
  actActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  actActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actActionText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  commentsSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  commentRow: { flexDirection: 'row', marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginRight: 6 },
  commentText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  viewAllComments: { fontSize: 13, color: COLORS.textTertiary, marginTop: 6, fontWeight: '600' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: SIZES.spacingXl, paddingTop: 20, paddingBottom: 20, maxHeight: '90%', ...SHADOWS.large },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
});
