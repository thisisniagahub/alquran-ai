import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { bookmarkAPI } from '../../lib/api';

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarkAPI.getBookmarks();
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    try {
      await bookmarkAPI.deleteBookmark(bookmarkId);
      setBookmarks(bookmarks.filter((b: any) => b._id !== bookmarkId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete bookmark');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookmarks</Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptySubtext}>Bookmark your favorite verses to find them easily</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }: any) => (
            <TouchableOpacity 
              style={styles.bookmarkCard}
              onPress={() => router.push({
                pathname: '/(tabs)/read',
                params: { surah: item.surah_number }
              })}
            >
              <View style={styles.bookmarkHeader}>
                <View style={styles.bookmarkLeft}>
                  <MaterialCommunityIcons name="bookmark" size={20} color="#10b981" />
                  <Text style={styles.bookmarkSurah}>
                    Surah {item.surah_number}:{item.ayat_number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      'Delete Bookmark',
                      'Are you sure you want to delete this bookmark?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteBookmark(item._id) }
                      ]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
              {item.note && (
                <Text style={styles.bookmarkNote}>{item.note}</Text>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  list: {
    padding: 20,
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkSurah: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  bookmarkNote: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
