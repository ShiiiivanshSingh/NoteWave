import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
  Linking,
  Image,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Unsplash image URLs
const UNSPLASH_IMAGES = {
  mainCard: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  profile: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  chatbot: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
  notes: [
    'https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    'https://images.unsplash.com/photo-1483546416237-76fd26bbcdd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  ]
};

export default function App() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [currentMood, setCurrentMood] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [userName, setUserName] = useState('User');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  
  // Get current day and hide splash screen after timeout
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    setCurrentDay(days[today]);
    
    // Force hide splash after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    loadUserSettings();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Load notes
  useEffect(() => {
    loadNotes();
  }, []);

  // Load notes from storage
  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes !== null) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };

  // Load user settings
  const loadUserSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setUserName(parsedSettings.name || 'User');
        if (parsedSettings.darkMode !== undefined) {
          setDarkMode(parsedSettings.darkMode);
        }
        setNotificationEnabled(parsedSettings.notifications !== false);
      }
    } catch (error) {
      console.log('Error loading user settings:', error);
    }
  };

  // Save notes to storage
  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  // Save user settings
  const saveUserSettings = async () => {
    try {
      const settings = {
        name: userName,
        darkMode: darkMode,
        notifications: notificationEnabled
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving user settings:', error);
    }
  };

  // Toggle dark mode and save the preference
  const toggleDarkMode = (value) => {
    setDarkMode(value);
    setTimeout(() => {
      saveUserSettings();
    }, 100);
  };

  // Add a new note or update existing note
  const handleAddNote = () => {
    if (note.trim() === '') {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }

    let updatedNotes = [];
    
    if (editingId !== null) {
      // Update existing note
      updatedNotes = notes.map(item => 
        item.id === editingId ? { ...item, text: note } : item
      );
      setEditingId(null);
    } else {
      // Add new note
      const newNote = {
        id: Date.now().toString(),
        text: note,
        date: new Date().toLocaleString(),
        mood: currentMood
      };
      updatedNotes = [...notes, newNote];
    }
    
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNote('');
  };

  // Delete a note
  const handleDeleteNote = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            const updatedNotes = notes.filter(note => note.id !== id);
            setNotes(updatedNotes);
            saveNotes(updatedNotes);
            
            if (editingId === id) {
              setEditingId(null);
              setNote('');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Edit a note
  const handleEditNote = (id) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setNote(noteToEdit.text);
      setEditingId(id);
    }
  };

  // Render each note item
  const renderItem = ({ item }) => (
    <View style={styles.noteItem}>
      <View style={styles.noteContent}>
        <Text style={styles.noteText}>{item.text}</Text>
        <Text style={styles.noteDate}>{item.date}</Text>
        {item.mood && <Text style={styles.noteMood}>Mood: {item.mood}</Text>}
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditNote(item.id)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteNote(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add this new function for the floating action button
  const handleAddButtonPress = () => {
    setNote('');
    setEditingId(null);
    setCurrentMood('');
    // Focus on the input (you would need a ref for this)
  };

  // Render AI Chatbot Screen
  const renderChatbotScreen = () => (
    <View style={[
      styles.chatbotContainer, 
      darkMode ? { backgroundColor: '#121212' } : { backgroundColor: '#fff' }
    ]}>
      <View style={[
        styles.chatbotHeader,
        darkMode ? { backgroundColor: '#1a1a1a', borderBottomColor: '#333' } : { backgroundColor: '#fff', borderBottomColor: '#eee' }
      ]}>
        <Text style={[styles.chatbotTitle, darkMode && styles.textDark]}>AI Assistant</Text>
      </View>
      
      <View style={[
        styles.chatbotContent,
        darkMode ? { backgroundColor: '#121212' } : { backgroundColor: '#fff' }
      ]}>
        <Text style={[
          styles.chatbotDescription, 
          darkMode ? { color: '#ccc' } : { color: '#333' }
        ]}>
          Our AI assistant can help you organize your thoughts, generate ideas, and answer questions.
        </Text>
        
        <Image 
          source={{ uri: UNSPLASH_IMAGES.chatbot }}
          style={styles.chatbotImage}
        />
        
        <Text style={[
          styles.chatbotInstructions,
          darkMode ? { color: '#ccc' } : { color: '#333' }
        ]}>
          Tap the button below to chat with our AI assistant.
        </Text>
        
        <TouchableOpacity 
          style={[styles.chatbotButton, darkMode && styles.buttonDark]}
          onPress={() => Linking.openURL('https://www.chatbase.co/chatbot-iframe/gcmQxoyUWU8k1Nl78Fz-F')}
        >
          <Text style={styles.chatbotButtonText}>Open AI Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render User Profile Screen
  const renderUserScreen = () => (
    <ScrollView style={styles.userScreenContainer} contentContainerStyle={styles.userScreenContent}>
      <ImageBackground 
        source={{ uri: UNSPLASH_IMAGES.profile }}
        style={styles.userHeaderBackground}
        imageStyle={styles.userHeaderBackgroundImage}
      >
        <View style={[
          styles.userHeaderOverlay,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' } // Fixed black overlay
        ]}>
          <View style={styles.userHeader}>
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.userName, { color: '#fff' }]}>{userName}</Text>
            <Text style={[styles.userSubtitle, { color: '#fff' }]}>Your personal notes assistant</Text>
          </View>
        </View>
      </ImageBackground>
      
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.textDark]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: "#4a90e2" }}
            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark]}>Account</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.textDark]}>Name</Text>
          <TextInput
            style={[styles.settingInput, darkMode && styles.inputDark]}
            value={userName}
            onChangeText={setUserName}
            onEndEditing={saveUserSettings}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.textDark]}>Notifications</Text>
          <Switch
            value={notificationEnabled}
            onValueChange={(value) => {
              setNotificationEnabled(value);
              setTimeout(saveUserSettings, 100);
            }}
            trackColor={{ false: "#767577", true: "#4a90e2" }}
            thumbColor={notificationEnabled ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark]}>Statistics</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark]}>{notes.length}</Text>
            <Text style={[styles.statLabel, darkMode && styles.textDark]}>Notes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark]}>
              {notes.filter(note => note.mood).length}
            </Text>
            <Text style={[styles.statLabel, darkMode && styles.textDark]}>Moods</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark]}>7</Text>
            <Text style={[styles.statLabel, darkMode && styles.textDark]}>Days</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => Alert.alert('Logout', 'This would log you out in a real app.')}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Today Screen
  const renderTodayScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.dayContainer}>
        <Text style={[
          styles.dayText, 
          darkMode && styles.textDark
        ]}>
          {currentDay}.
        </Text>
      </View>
      
      {/* Enhanced Main card with background image */}
      <ImageBackground 
        source={{ uri: UNSPLASH_IMAGES.mainCard }} 
        style={styles.mainCard}
        imageStyle={styles.mainCardImage}
      >
        <View style={styles.mainCardOverlay}>
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardTitle}>Let's begin your day</Text>
            
            <TouchableOpacity 
              style={styles.feelingButton}
              onPress={() => setShowMoodModal(true)}
            >
              <Text style={styles.feelingButtonText}>
                {currentMood ? `I feel ${currentMood}` : 'How do you feel?'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.inspirationContainer}>
              {/* Empty for now as requested */}
            </View>
          </View>
        </View>
      </ImageBackground>
      
      {/* Notes section */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>notes.</Text>
        
        {notes.length === 0 ? (
          <View style={styles.emptyNotesContainer}>
            <Text style={styles.emptyNotesText}>No notes yet</Text>
            <Text style={styles.emptyNotesSubtext}>Tap the + button to create a note</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={({ item, index }) => (
              <View style={styles.noteItem}>
                {index % 3 === 0 && (
                  <Image 
                    source={{ uri: UNSPLASH_IMAGES.notes[index % UNSPLASH_IMAGES.notes.length] }} 
                    style={styles.noteImage}
                  />
                )}
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{item.text}</Text>
                  <Text style={styles.noteDate}>{item.date}</Text>
                  {item.mood && <Text style={styles.noteMood}>Mood: {item.mood}</Text>}
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]} 
                    onPress={() => handleEditNote(item.id)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => handleDeleteNote(item.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={item => item.id}
            style={styles.notesList}
            contentContainerStyle={styles.notesListContent}
          />
        )}
      </View>
    </View>
  );

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>NoteWave</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: '#121212' }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Main Content Area */}
      {activeTab === 'today' && renderTodayScreen()}
      {activeTab === 'you' && renderUserScreen()}
      {activeTab === 'chatbot' && renderChatbotScreen()}
      
      {/* Modern Minimal Navbar */}
      <View style={[styles.modernNavbar, darkMode && styles.navbarDark]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('today')}
        >
          <Ionicons 
            name="today-outline" 
            size={24} 
            color={activeTab === 'today' ? (darkMode ? '#fff' : '#000') : '#999'} 
          />
          {activeTab === 'today' && <View style={[styles.activeIndicator, darkMode && styles.activeIndicatorDark]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('chatbot')}
        >
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={24} 
            color={activeTab === 'chatbot' ? (darkMode ? '#fff' : '#000') : '#999'} 
          />
          {activeTab === 'chatbot' && <View style={[styles.activeIndicator, darkMode && styles.activeIndicatorDark]} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('you')}
        >
          <Ionicons 
            name="person-outline" 
            size={24} 
            color={activeTab === 'you' ? (darkMode ? '#fff' : '#000') : '#999'} 
          />
          {activeTab === 'you' && <View style={[styles.activeIndicator, darkMode && styles.activeIndicatorDark]} />}
        </TouchableOpacity>
      </View>
      
      {/* Input container - only show on Today tab */}
      {activeTab === 'today' && (
        <View style={[styles.inputContainer, darkMode && styles.inputContainerDark]}>
          <TextInput
            style={[styles.input, darkMode && styles.inputDark]}
            placeholder="Write a note..."
            placeholderTextColor={darkMode ? "#777" : "#999"}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <TouchableOpacity 
            style={[styles.addButton, darkMode && styles.addButtonDark]} 
            onPress={handleAddNote}
          >
            <Text style={styles.addButtonText}>
              {editingId !== null ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Mood Modal */}
      <Modal
        visible={showMoodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.moodModalContainer, darkMode && styles.modalDark]}>
            <Text style={[styles.moodModalTitle, darkMode && styles.textDark]}>How do you feel today?</Text>
            
            <View style={styles.moodOptionsContainer}>
              {['Happy', 'Calm', 'Focused', 'Tired', 'Anxious', 'Grateful'].map((mood) => (
                <TouchableOpacity 
                  key={mood}
                  style={[
                    styles.moodOption,
                    darkMode && styles.moodOptionDark,
                    currentMood === mood && styles.selectedMoodOption
                  ]}
                  onPress={() => {
                    setCurrentMood(mood);
                    setShowMoodModal(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.moodOptionText,
                      darkMode && styles.textDark,
                      currentMood === mood && styles.selectedMoodOptionText
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[styles.closeModalButton, darkMode && styles.buttonDark]}
              onPress={() => setShowMoodModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Day display
  dayContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // Main card
  mainCard: {
    borderRadius: 16,
    margin: 16,
    height: 200,
    overflow: 'hidden',
  },
  mainCardImage: {
    borderRadius: 16,
  },
  mainCardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    padding: 24,
  },
  mainCardContent: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  mainCardSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 24,
  },
  feelingButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  feelingButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  inspirationContainer: {
    marginTop: 16,
  },
  
  // Section styles
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  
  // Notes section
  notesSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 60, // Space for tab bar
  },
  emptyNotesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyNotesText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 150, // More space for the new navbar and input
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteContent: {
    marginBottom: 10,
  },
  noteText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteMood: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Modern Navbar styles
  modernNavbar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 65,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 60,
    height: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
  
  // Input container
  inputContainer: {
    position: 'absolute',
    bottom: 75, // Above new navbar
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
  },
  addButton: {
    marginLeft: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  
  // Mood modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodModalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
  },
  moodModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodOption: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedMoodOption: {
    backgroundColor: '#000',
  },
  moodOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedMoodOptionText: {
    color: 'white',
  },
  closeModalButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  
  // User Profile Screen styles
  userScreenContainer: {
    flex: 1,
  },
  userScreenContent: {
    paddingBottom: 100,
  },
  userHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  userAvatarContainer: {
    marginBottom: 16,
  },
  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionDark: {
    backgroundColor: '#2a2a2a',
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    padding: 8,
    width: 150,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  
  // Dark mode styles
  textDark: {
    color: '#fff',
  },
  navbarDark: {
    backgroundColor: '#1a1a1a',
    borderTopColor: '#333',
  },
  activeIndicatorDark: {
    backgroundColor: '#fff',
  },
  navAddButtonDark: {
    backgroundColor: '#4a90e2',
  },
  inputContainerDark: {
    backgroundColor: '#2a2a2a',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#fff',
  },
  addButtonDark: {
    backgroundColor: '#4a90e2',
  },
  modalDark: {
    backgroundColor: '#2a2a2a',
  },
  moodOptionDark: {
    backgroundColor: '#333',
  },
  buttonDark: {
    backgroundColor: '#4a90e2',
  },
  
  // Updated chatbot styles
  chatbotContainer: {
    flex: 1,
  },
  chatbotHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  chatbotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  chatbotContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatbotDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  chatbotImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
  },
  chatbotInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  chatbotButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  chatbotButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Updated styles for main card with background image
  screenContainer: {
    flex: 1,
  },
  
  // Note item with image
  noteImage: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 12,
  },
  
  // User profile with background image
  userHeaderBackground: {
    height: 200,
  },
  userHeaderBackgroundImage: {
    opacity: 0.8,
  },
  userHeaderOverlay: {
    height: 200,
    justifyContent: 'center',
  },
});
