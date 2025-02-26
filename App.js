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
import * as Font from 'expo-font';
import { FONTS } from './src/constants/fonts';
import { 
  Surface, 
  IconButton, 
  FAB, 
  Portal,
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';

const { width, height } = Dimensions.get('window');

// Unsplash image URLs
const UNSPLASH_IMAGES = {
  mainCard: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  profile: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  chatbot: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80'
};

// Define custom theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4C6FFF',
    secondary: '#FF4C4C',
    surface: '#FFFFFF',
    background: '#F5F7FA',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2E4BFF',
    secondary: '#CC3333',
    surface: '#1A1A1A',
    background: '#121212',
  },
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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
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
    <Surface 
      style={[
        styles.noteItem,
        darkMode && styles.noteItemDark,
        { elevation: 2 }
      ]}
    >
      <View style={styles.noteContent}>
        <Text style={[
          styles.noteText, 
          { fontFamily: FONTS.regular },
          darkMode && styles.textDark
        ]}>{item.text}</Text>
        
        <View style={styles.noteMetaContainer}>
          <Text style={[
            styles.noteDate, 
            { fontFamily: FONTS.light },
            darkMode && styles.textGrayDark
          ]}>{item.date}</Text>
          
          {item.mood && (
            <View style={styles.moodContainer}>
              <IconButton
                icon="heart"
                size={16}
                iconColor={darkMode ? '#8E8E8E' : '#666'}
              />
              <Text style={[
                styles.noteMood, 
                { fontFamily: FONTS.regular },
                darkMode && styles.textGrayDark
              ]}>{item.mood}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.noteActions}>
        <IconButton
          icon="pencil"
          mode="contained"
          containerColor={darkMode ? '#2E4BFF' : '#4C6FFF'}
          iconColor="#FFF"
          size={20}
          onPress={() => handleEditNote(item.id)}
          style={styles.actionButton}
        />
        <IconButton
          icon="delete"
          mode="contained"
          containerColor={darkMode ? '#CC3333' : '#FF4C4C'}
          iconColor="#FFF"
          size={20}
          onPress={() => handleDeleteNote(item.id)}
          style={styles.actionButton}
        />
      </View>
    </Surface>
  );

  // Add this new function for the floating action button
  const handleAddButtonPress = () => {
    setNote('');
    setEditingId(null);
    setCurrentMood('');
    // Focus on the input (you would need a ref for this)
  };

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Mont-ExtraLightDEMO': require('./assets/Montserrat-Bold.ttf'),
          'Mont-HeavyDEMO': require('./assets/Mont-HeavyDEMO.otf'),
          'Montana': require('./assets/Montserrat-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
      }
    }
    loadFonts();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

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
        <Text style={[styles.chatbotTitle, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>AI Assistant</Text>
      </View>
      
      <View style={[
        styles.chatbotContent,
        darkMode ? { backgroundColor: '#121212' } : { backgroundColor: '#fff' }
      ]}>
        <Text style={[
          styles.chatbotDescription, 
          darkMode ? { color: '#ccc' } : { color: '#333' },
          { fontFamily: FONTS.regular }
        ]}>
          Our AI assistant can help you organize your thoughts, generate ideas, and answer questions.
        </Text>
        
        <Image 
          source={{ uri: UNSPLASH_IMAGES.chatbot }}
          style={styles.chatbotImage}
        />
        
        <Text style={[
          styles.chatbotInstructions,
          darkMode ? { color: '#ccc' } : { color: '#333' },
          { fontFamily: FONTS.regular }
        ]}>
          Tap the button below to chat with our AI assistant.
        </Text>
        
        <TouchableOpacity 
          style={[styles.chatbotButton, darkMode && styles.buttonDark]}
          onPress={() => Linking.openURL('https://www.chatbase.co/chatbot-iframe/gcmQxoyUWU8k1Nl78Fz-F')}
        >
          <Text style={[styles.chatbotButtonText, { fontFamily: FONTS.regular }]}>Open AI Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render User Profile Screen
  const renderUserScreen = () => (
    <ScrollView 
      style={[
        styles.userScreenContainer, 
        darkMode && styles.containerDark
      ]} 
      contentContainerStyle={styles.userScreenContent}
    >
      {/* Projects Section */}
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>Projects</Text>
          <TouchableOpacity>
            <Text style={[styles.sectionAction, darkMode && styles.textDark, { fontFamily: FONTS.regular }]}>Recents</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.projectsList}>
          <TouchableOpacity style={[styles.projectItem, darkMode && styles.projectItemDark]}>
            <View style={[styles.projectIcon, { backgroundColor: '#a29bfe' }]}>
              <Ionicons name="layers-outline" size={24} color="white" />
            </View>
            <View style={styles.projectInfo}>
              <Text style={[styles.projectTitle, darkMode && styles.textDark, { fontFamily: FONTS.regular }]}>Web Redesign</Text>
              <Text style={[styles.projectMeta, darkMode && styles.textGrayDark, { fontFamily: FONTS.regular }]}>
                1 member • {userName}'s First Team • 
                <Ionicons name="lock-closed" size={12} color={darkMode ? '#888' : '#666'} />
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.projectItem, darkMode && styles.projectItemDark]}>
            <View style={[styles.projectIcon, { backgroundColor: '#00b894' }]}>
              <Ionicons name="cube-outline" size={24} color="white" />
            </View>
            <View style={styles.projectInfo}>
              <Text style={[styles.projectTitle, darkMode && styles.textDark, { fontFamily: FONTS.regular }]}>Product Development</Text>
              <Text style={[styles.projectMeta, darkMode && styles.textGrayDark, { fontFamily: FONTS.regular }]}>
                1 member • {userName}'s First Team • 
                <Ionicons name="lock-closed" size={12} color={darkMode ? '#888' : '#666'} />
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.seeAllButton, darkMode && styles.seeAllButtonDark]}>
            <Text style={[styles.seeAllText, darkMode && styles.textGrayDark, { fontFamily: FONTS.regular }]}>See all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Section */}
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>Settings</Text>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.textDark, { fontFamily: FONTS.regular }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: "#4a90e2" }}
            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.textDark, { fontFamily: FONTS.regular }]}>Notifications</Text>
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

      {/* Statistics Section */}
      <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>{notes.length}</Text>
            <Text style={[styles.statLabel, darkMode && styles.textGrayDark, { fontFamily: FONTS.light }]}>Notes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>
              {notes.filter(note => note.mood).length}
            </Text>
            <Text style={[styles.statLabel, darkMode && styles.textGrayDark, { fontFamily: FONTS.light }]}>Moods</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>7</Text>
            <Text style={[styles.statLabel, darkMode && styles.textGrayDark, { fontFamily: FONTS.light }]}>Days</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, darkMode && styles.logoutButtonDark]}
        onPress={() => Alert.alert('Logout', 'This would log you out in a real app.')}
      >
        <Text style={[styles.logoutButtonText, { fontFamily: FONTS.regular }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Today Screen
  const renderTodayScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.dayContainer}>
        <Text style={[
          styles.dayText, 
          { fontFamily: FONTS.heavy },
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
            <Text style={[
              styles.mainCardTitle,
              { fontFamily: FONTS.heavy }
            ]}>Let's begin your day</Text>
            
            <TouchableOpacity 
              style={styles.feelingButton}
              onPress={() => setShowMoodModal(true)}
            >
              <Text style={[
                styles.feelingButtonText,
                { fontFamily: FONTS.regular }
              ]}>
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
        <Text style={[styles.sectionTitle, darkMode && { color: '#fff' }]}>notes.</Text>
        {notes.length === 0 ? (
          <View style={styles.emptyNotesContainer}>
            <Text style={[styles.emptyNotesText, darkMode && { color: '#fff' }]}>No notes yet</Text>
            <Text style={[styles.emptyNotesSubtext, darkMode && { color: '#ccc' }]}>Tap the ADD button to create a note</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderItem}
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
    <PaperProvider theme={darkMode ? darkTheme : lightTheme}>
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
              style={[styles.input, { fontFamily: FONTS.regular }, darkMode && styles.inputDark]}
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
              <Text style={[styles.addButtonText, { fontFamily: FONTS.regular }]}>
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
              <Text style={[styles.moodModalTitle, darkMode && styles.textDark, { fontFamily: FONTS.heavy }]}>How do you feel today?</Text>
              
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
                        currentMood === mood && styles.selectedMoodOptionText,
                        { fontFamily: FONTS.regular }
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
                <Text style={[styles.closeModalButtonText, { fontFamily: FONTS.regular }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Floating Action Button */}
       
      </SafeAreaView>
    </PaperProvider>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteItemDark: {
    backgroundColor: '#1A1A1A',
  },
  noteContent: {
    flex: 1,
    marginRight: 12,
  },
  noteMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 70,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fabDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#333',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  noteMood: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#f5f5f5',
  },
  userScreenContent: {
    padding: 20,
  },
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
  userHeader: {
    padding: 20,
  },
  userAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4834d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  userSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingsSectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  
  // User profile with background image
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    color: '#666',
  },
  projectsList: {
    marginTop: 12,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 12,
    color: '#666',
  },
  seeAllButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  seeAllText: {
    color: '#666',
    fontSize: 14,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  sectionDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  textGrayDark: {
    color: '#888',
  },
  projectItemDark: {
    backgroundColor: '#2a2a2a',
  },
  seeAllButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  logoutButtonDark: {
    backgroundColor: '#c0392b',
  },
});

// Helper function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};
