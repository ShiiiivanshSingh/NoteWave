import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotesList = ({ notes, onNotePress, onNoteLongPress }) => {
  const sortedNotes = [...(notes || [])].sort((a, b) => {
    // Sort by pinned status first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then sort by date
    return new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date);
  });

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.noteCard,
        { backgroundColor: item.backgroundColor || '#fff' }
      ]}
      onPress={() => onNotePress(item)}
      onLongPress={() => onNoteLongPress(item)}
    >
      {item.isPinned && (
        <Icon name="push-pin" size={16} color="#666" style={styles.pinIcon} />
      )}
      <Text 
        style={[styles.noteText, { color: item.color || '#000' }]}
        numberOfLines={3}
      >
        {item.content || item.text}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={sortedNotes}
      renderItem={renderNote}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  noteCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pinIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

export default NotesList; 