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
  ImageBackground,
  Animated
} from 'react-native';
import WebView from 'react-native-webview';
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
import AboutScreen from './src/screens/AboutScreen';
import NoteEditor from './src/components/NoteEditor';
import NotesList from './src/components/NotesList';

const { width, height } = Dimensions.get('window');

// stock photos coz why not??
const UNSPLASH_IMAGES = {
  mainCard: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  profile: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
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
  // Group all useState hooks together at the top
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
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Group all useRef hooks together
  const fadeAnim = useRef(new Animated.Value(0));
  const scaleAnim = useRef(new Animated.Value(0.95));

  // Group all useEffect hooks together
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    setCurrentDay(days[today]);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim.current, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim.current, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
    
    // Hide splash after delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim.current, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2000);
    
    loadUserSettings();
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    loadNotes();
  }, []);

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

  // Load notes
  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes !== null) {
        const parsedNotes = JSON.parse(storedNotes);
        // Ensure all notes have the required properties
        const normalizedNotes = parsedNotes.map(note => ({
          id: note.id,
          content: note.content || note.text || '', // Support old format
          backgroundColor: note.backgroundColor || '#ffffff',
          color: note.color || '#000000',
          isPinned: note.isPinned || false,
          tags: note.tags || [],
          images: note.images || [],
          date: note.date,
          updatedAt: note.updatedAt || note.date,
          mood: note.mood || ''
        }));
        setNotes(normalizedNotes);
      }
    } catch (error) {
      console.log('Error loading notes:', error);
      setNotes([]); // Set empty array if there's an error
    }
  };

  // Load user settings
  const loadUserSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setUserName(parsedSettings.name || 'User');
        setDarkMode(parsedSettings.darkMode === true);
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
  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      const parsedSettings = settings ? JSON.parse(settings) : {};
      await AsyncStorage.setItem('userSettings', JSON.stringify({
        ...parsedSettings,
        darkMode: value,
        name: userName,
        notifications: notificationEnabled
      }));
    } catch (error) {
      console.log('Error saving dark mode setting:', error);
    }
  };

  // Update the note structure in handleAddNote
  const handleAddNote = (noteData) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (editingId !== null) {
      const updatedNotes = notes.map(n => 
        n.id === editingId 
          ? { 
              ...n, 
              content: noteData.content || '',
              backgroundColor: noteData.backgroundColor || '#ffffff',
              color: noteData.color || '#000000',
              isPinned: noteData.isPinned || false,
              tags: noteData.tags || [],
              images: noteData.images || [],
              date: formattedDate,
              updatedAt: currentDate,
              mood: currentMood || ''
            } 
          : n
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setEditingId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        content: noteData.content || '',
        backgroundColor: noteData.backgroundColor || '#ffffff',
        color: noteData.color || '#000000',
        isPinned: noteData.isPinned || false,
        tags: noteData.tags || [],
        images: noteData.images || [],
        date: formattedDate,
        updatedAt: currentDate,
        mood: currentMood || ''
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    }
    setNote('');
    setCurrentMood('');
    setShowNoteEditor(false);
  };

  // Add handler for opening note editor
  const handleOpenNoteEditor = (note = null) => {
    if (note) {
      setSelectedNote(note);
      setEditingId(note.id);
    } else {
      setSelectedNote(null);
      setEditingId(null);
    }
    setShowNoteEditor(true);
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

  // Render AI Chatbot Screen
  const renderChatbotScreen = () => (
    <View style={[styles.chatbotContainer, darkMode && styles.containerDark]}>
      <View style={[styles.chatbotHeader, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.chatbotTitle, 
          { fontFamily: FONTS.heavy },
          darkMode && styles.textDark
        ]}>AI Assistant</Text>
      </View>
      
      <WebView
        source={{ uri: 'https://www.chatbase.co/chatbot-iframe/gcmQxoyUWU8k1Nl78Fz-F' }}
        style={styles.chatWebView}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={darkMode ? "#4C6FFF" : "#2E4BFF"} />
          </View>
        )}
      />
    </View>
  );

  // Add these helper functions at the bottom of the file
  const getNoteStats = (notes) => {
    return {
      total: notes.length,
      thisWeek: notes.filter(note => {
        const noteDate = new Date(note.date);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return noteDate >= weekAgo;
      }).length,
      withMood: notes.filter(note => note.mood).length
    };
  };

  // Update the helper function to analyze mood patterns without dates
  const getMoodStats = (notes) => {
    const moodCounts = notes.reduce((acc, note) => {
      if (note.mood) {
        acc[note.mood] = (acc[note.mood] || 0) + 1;
      }
      return acc;
    }, {});

    // Get the last 7 moods without dates
    const last7Days = notes
      .filter(note => note.mood)
      .slice(-7)
      .map(note => ({
        mood: note.mood
      }));

    return {
      moodCounts,
      last7Days,
      mostFrequent: Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No mood data'
    };
  };

  // Update the renderUserScreen function
  const renderUserScreen = () => {
    const stats = getNoteStats(notes);
    const moodStats = getMoodStats(notes);
    const recentNotes = notes.slice(-3).reverse();

    return (
      <ScrollView 
        style={[styles.userScreenContainer, darkMode && styles.containerDark]}
        contentContainerStyle={styles.userScreenContentContainer}
      >
        {/* User Stats Section */}
        <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
          <Text style={[
            styles.settingsSectionTitle, 
            darkMode && styles.textDark,
            { fontFamily: FONTS.heavy }
          ]}>Your Activity</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber, 
                darkMode && styles.textDark,
                { fontFamily: FONTS.heavy }
              ]}>{stats.total}</Text>
              <Text style={[
                styles.statLabel, 
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.light }
              ]}>Total Notes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber, 
                darkMode && styles.textDark,
                { fontFamily: FONTS.heavy }
              ]}>{stats.thisWeek}</Text>
              <Text style={[
                styles.statLabel, 
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.light }
              ]}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber, 
                darkMode && styles.textDark,
                { fontFamily: FONTS.heavy }
              ]}>{stats.withMood}</Text>
              <Text style={[
                styles.statLabel, 
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.light }
              ]}>With Mood</Text>
            </View>
          </View>
        </View>

        {/* Recent Notes Section */}
        <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.settingsSectionTitle, 
              darkMode && styles.textDark,
              { fontFamily: FONTS.heavy }
            ]}>Recent Notes</Text>
            <TouchableOpacity onPress={() => setActiveTab('today')}>
              <Text style={[
                styles.sectionAction, 
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.regular }
              ]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentNotes.map((note) => (
            <View key={note.id} style={[styles.recentNoteItem, darkMode && styles.recentNoteItemDark]}>
              <Text style={[
                styles.recentNoteText, 
                darkMode && styles.textDark,
                { fontFamily: FONTS.regular }
              ]} numberOfLines={2}>
                {note.text}
              </Text>
              <View style={styles.recentNoteFooter}>
                <Text style={[
                  styles.recentNoteDate, 
                  darkMode && styles.textGrayDark,
                  { fontFamily: FONTS.light }
                ]}>{note.date}</Text>
                {note.mood && (
                  <View style={styles.moodTag}>
                    <Ionicons name="heart" size={12} color={darkMode ? '#8E8E8E' : '#666'} />
                    <Text style={[
                      styles.moodTagText, 
                      darkMode && styles.textGrayDark,
                      { fontFamily: FONTS.regular }
                    ]}>{note.mood}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Mood Infographic Section */}
        <View style={[styles.settingsSection, darkMode && styles.sectionDark]}>
          <Text style={[
            styles.settingsSectionTitle, 
            darkMode && styles.textDark,
            { fontFamily: FONTS.heavy }
          ]}>Mood Patterns</Text>
          
          {/* Most Frequent Mood */}
          <View style={styles.moodSummary}>
            <View style={styles.moodSummaryIcon}>
              <Ionicons 
                name="heart" 
                size={24} 
                color={darkMode ? '#4C6FFF' : '#2E4BFF'} 
              />
            </View>
            <View>
              <Text style={[
                styles.moodSummaryTitle,
                darkMode && styles.textDark,
                { fontFamily: FONTS.regular }
              ]}>Most Frequent Mood</Text>
              <Text style={[
                styles.moodSummaryValue,
                darkMode && styles.textDark,
                { fontFamily: FONTS.heavy }
              ]}>{moodStats.mostFrequent}</Text>
            </View>
          </View>

          {/* Weekly Mood Timeline */}
          <Text style={[
            styles.moodSummaryTitle,
            darkMode && styles.textDark,
            { fontFamily: FONTS.regular }
          ]}>Weekly Mood Timeline</Text>
          <View style={styles.moodTimeline}>
            {moodStats.last7Days.map((day, index) => (
              <View key={index} style={styles.moodTimelineDay}>
                <View style={[
                  styles.moodTimelineDot,
                  { backgroundColor: darkMode ? '#4C6FFF' : '#2E4BFF' }
                ]} />
                <Text style={[
                  styles.moodTimelineMood,
                  darkMode && styles.textGrayDark,
                  { fontFamily: FONTS.regular }
                ]}>{day.mood}</Text>
              </View>
            ))}
          </View>

          {/* Mood Distribution */}
          <View style={styles.moodDistribution}>
            {Object.entries(moodStats.moodCounts).map(([mood, count], index) => (
              <View key={index} style={styles.moodDistributionItem}>
                <View style={styles.moodDistributionBar}>
                  <View 
                    style={[
                      styles.moodDistributionFill,
                      { 
                        width: `${(count / stats.total) * 100}%`,
                        backgroundColor: darkMode ? '#4C6FFF' : '#2E4BFF'
                      }
                    ]} 
                  />
                </View>
                <Text style={[
                  styles.moodDistributionLabel,
                  darkMode && styles.textGrayDark,
                  { fontFamily: FONTS.regular }
                ]}>{mood} ({count})</Text>
              </View>
            ))}
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
          <Text style={[styles.logoutButtonText, { fontFamily: FONTS.regular }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* About Button */}
        <TouchableOpacity 
          style={[styles.aboutButton, darkMode && styles.aboutButtonDark]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.aboutButtonText, darkMode && styles.textGrayDark, { fontFamily: FONTS.regular }]}>
            About NoteWave
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Update renderTodayScreen to use NotesList component
  const renderTodayScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.dayContainer}>
        <Text style={[
          styles.dayText, 
          { fontFamily: FONTS.heavy },
          darkMode && styles.textDark
        ]}>
          it's {currentDay}.
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
            <Text style={[styles.emptyNotesSubtext, darkMode && { color: '#ccc' }]}>
              Tap the ADD button to create a note
            </Text>
          </View>
        ) : (
          <NotesList
            notes={notes}
            onNotePress={handleOpenNoteEditor}
            onNoteLongPress={(note) => {
              Alert.alert(
                'Note Options',
                'What would you like to do?',
                [
                  {
                    text: 'Edit',
                    onPress: () => handleOpenNoteEditor(note)
                  },
                  {
                    text: 'Delete',
                    onPress: () => handleDeleteNote(note.id),
                    style: 'destructive'
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            }}
          />
        )}
      </View>

      {/* Note Editor Modal */}
      {showNoteEditor && (
        <NoteEditor
          note={selectedNote}
          onSave={handleAddNote}
          onClose={() => {
            setShowNoteEditor(false);
            setSelectedNote(null);
            setEditingId(null);
          }}
        />
      )}

      {/* Add Floating Action Button */}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          darkMode && styles.fabDark
        ]}
        color={darkMode ? '#fff' : '#000'}
        onPress={() => handleOpenNoteEditor()}
      />
    </View>
  );

  // Add the splash screen component
  const renderSplashScreen = () => (
    <View style={[styles.splashContainer, darkMode && styles.containerDark]}>
      <Animated.View 
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim.current,
            transform: [{ scale: scaleAnim.current }]
          }
        ]}
      >
        <Text style={[
          styles.splashTitle,
          { fontFamily: FONTS.heavy }
        ]}>NoteWave</Text>
        <Text style={[
          styles.splashSubtitle,
          { fontFamily: FONTS.light }
        ]}>Your thoughts, organized.</Text>
      </Animated.View>
    </View>
  );

  if (showSplash) {
    return renderSplashScreen();
  }

  return (
    <PaperProvider theme={darkMode ? darkTheme : lightTheme}>
      <SafeAreaView style={[styles.container, darkMode && { backgroundColor: '#121212' }]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        
        {/* Main Content Area */}
        {activeTab === 'today' && renderTodayScreen()}
        {activeTab === 'you' && renderUserScreen()}
        {activeTab === 'chatbot' && renderChatbotScreen()}
        {activeTab === 'about' && <AboutScreen navigation={{ goBack: () => setActiveTab('you') }} darkMode={darkMode} />}
        
        {/* Modern Minimal Navbar */}
        {activeTab !== 'about' && (
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
        )}
        
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 48,
    color: '#4C6FFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: 18,
    color: '#666',
    letterSpacing: 0.5,
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
    textTransform: 'lowercase',
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
  userScreenContentContainer: {
    paddingBottom: 100, // Add padding at bottom to prevent navbar overlap
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
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20, // Increase bottom margin
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
    backgroundColor: '#fff',
  },
  chatbotHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  chatbotTitle: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
  },
  chatWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
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
  recentNoteItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recentNoteItemDark: {
    backgroundColor: '#2a2a2a',
  },
  recentNoteText: {
    fontSize: 14,
    marginBottom: 8,
  },
  recentNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentNoteDate: {
    fontSize: 12,
    color: '#666',
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodTagText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
  moodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  moodSummaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 111, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodSummaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moodSummaryValue: {
    fontSize: 20,
    color: '#000',
  },
  moodTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  moodTimelineDay: {
    alignItems: 'center',
  },
  moodTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  moodTimelineMood: {
    fontSize: 12,
    color: '#666',
  },
  moodDistribution: {
    marginTop: 16,
  },
  moodDistributionItem: {
    marginBottom: 12,
  },
  moodDistributionBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    marginBottom: 4,
  },
  moodDistributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodDistributionLabel: {
    fontSize: 12,
    color: '#666',
  },
  aboutButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  aboutButtonDark: {
    backgroundColor: 'transparent',
  },
  aboutButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

// Helper function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};
