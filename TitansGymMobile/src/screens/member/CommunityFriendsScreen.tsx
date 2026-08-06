import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { socialApi } from '../../services/api';

export default function CommunityFriendsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [potential, setPotential] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const data = await socialApi.getFriends();
      setFriends(data.friends || []);
      setRequests(data.requests || []);
      setPotential(data.potential || []);
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddFriend = async (id: number) => {
    try {
      await socialApi.addFriend(id);
      loadData();
    } catch (e) {
      console.log(e);
    }
  };

  const handleAcceptFriend = async (id: number) => {
    try {
      await socialApi.acceptFriend(id);
      loadData();
    } catch (e) {
      console.log(e);
    }
  };

  const filtered = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Friends</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="person-add" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Online Now Row */}
        <Text style={styles.sectionTitle}>Online Now ({friends.filter(f => f.status === 'Online').length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.onlineScroll}>
          {friends.filter(f => f.status === 'Online').map(friend => (
            <TouchableOpacity key={friend.id} style={styles.onlineAvatarContainer} activeOpacity={0.8}
              onPress={() => navigation.navigate('CommunityMessages', { friendId: friend.id, friendName: friend.name, friendAvatar: friend.avatar_url })}>
              <Image source={{ uri: friend.avatar_url || 'https://via.placeholder.com/150' }} style={styles.onlineAvatar} />
              <View style={styles.onlineDot} />
              <Text style={styles.onlineName} numberOfLines={1}>{friend.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* Friend Requests */}
        {requests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Friend Requests ({requests.length})</Text>
            {requests.map(req => (
              <View key={req.id} style={styles.friendCard}>
                <TouchableOpacity style={styles.friendAvatarContainer} activeOpacity={0.8} onPress={() => navigation.navigate('PublicProfile', { userId: req.id })}>
                  <Image source={{ uri: req.avatar_url || 'https://via.placeholder.com/150' }} style={styles.friendAvatar} />
                </TouchableOpacity>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{req.name}</Text>
                  <Text style={styles.friendAction}>Wants to be friends</Text>
                </View>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={[styles.chatBtn, { backgroundColor: COLORS.success + '20' }]} onPress={() => handleAcceptFriend(req.id)}>
                    <Ionicons name="checkmark" size={20} color={COLORS.success} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.divider} style={{ marginTop: 10, marginBottom: 20, height: 1, backgroundColor: COLORS.border }} />
          </>
        )}

        {/* All Friends List */}
        <Text style={styles.sectionTitle}>My Friends</Text>
        {filtered.map(friend => (
          <TouchableOpacity key={friend.id} style={styles.friendCard} activeOpacity={0.8}
            onPress={() => navigation.navigate('PublicProfile', { userId: friend.id })}>
            <View style={styles.friendAvatarContainer}>
              <Image source={{ uri: friend.avatar_url || 'https://via.placeholder.com/150' }} style={styles.friendAvatar} />
              {friend.status === 'Online' && <View style={styles.onlineDotList} />}
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendAction}>{friend.action || friend.membership_type}</Text>
            </View>
            <View style={styles.actionBtns}>
              <View style={styles.chatBtn}>
                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={{ color: COLORS.textTertiary, textAlign: 'center', marginTop: 20 }}>No friends found.</Text>
        )}

        <View style={styles.divider} style={{ marginTop: 20, marginBottom: 20, height: 1, backgroundColor: COLORS.border }} />

        {/* Discover */}
        <Text style={styles.sectionTitle}>Discover Members</Text>
        {potential.map(p => (
          <TouchableOpacity key={p.id} style={styles.friendCard} activeOpacity={0.8} onPress={() => navigation.navigate('PublicProfile', { userId: p.id })}>
            <View style={styles.friendAvatarContainer}>
              <Image source={{ uri: p.avatar_url || 'https://via.placeholder.com/150' }} style={styles.friendAvatar} />
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{p.name}</Text>
              <Text style={styles.friendAction}>Titan Member</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={() => handleAddFriend(p.id)}>
              <Ionicons name="person-add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: SIZES.spacingLg, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { padding: SIZES.spacingLg, paddingBottom: 100 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, height: 50, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  onlineScroll: { flexDirection: 'row', marginBottom: 24 },
  onlineAvatarContainer: { alignItems: 'center', marginRight: 16, width: 70 },
  onlineAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary },
  onlineDot: { position: 'absolute', bottom: 20, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.background },
  onlineName: { marginTop: 8, fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 24 },
  
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, ...SHADOWS.small },
  friendAvatarContainer: { position: 'relative', marginRight: 15 },
  friendAvatar: { width: 50, height: 50, borderRadius: 25 },
  onlineDotList: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.cardBg },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  friendAction: { fontSize: 13, color: COLORS.textTertiary },
  actionBtns: { flexDirection: 'row', gap: 10 },
  chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
});
