import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';

const SettingsScreen = ({ 
  navigation, 
  darkMode, 
  toggleDarkMode, 
  notificationEnabled, 
  setNotificationEnabled,
  saveUserSettings,
  userName
}) => {
  // Add back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <ScrollView 
      style={[styles.container, darkMode && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with back button */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={darkMode ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle, 
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Settings</Text>
      </View>

      {/* Settings Sections */}
      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={[
            styles.settingLabel, 
            darkMode && styles.textDark,
            { fontFamily: FONTS.regular }
          ]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: "#4a90e2" }}
            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
          />
        </View>

        {/* Add Theme Previews */}
        <View style={styles.themePreviewContainer}>
          <TouchableOpacity 
            style={[
              styles.themePreviewCard,
              !darkMode && styles.themePreviewCardActive
            ]}
            onPress={() => toggleDarkMode(false)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.themePreviewTitle,
              { fontFamily: FONTS.regular }
            ]}>Light</Text>
            <View style={styles.themePreviewContent}>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
              <View style={[styles.previewLine, { width: '60%' }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.themePreviewCard,
              styles.themePreviewCardDark,
              darkMode && styles.themePreviewCardActive
            ]}
            onPress={() => toggleDarkMode(true)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.themePreviewTitle,
              styles.themePreviewTitleDark,
              { fontFamily: FONTS.regular }
            ]}>Dark</Text>
            <View style={styles.themePreviewContent}>
              <View style={[styles.previewLine, styles.previewLineDark]} />
              <View style={[styles.previewLine, styles.previewLineDark]} />
              <View style={[styles.previewLine, styles.previewLineDark, { width: '60%' }]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={[
            styles.settingLabel, 
            darkMode && styles.textDark,
            { fontFamily: FONTS.regular }
          ]}>Enable Notifications</Text>
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

      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Account</Text>
        <Text style={[
          styles.accountText,
          darkMode && styles.textGrayDark,
          { fontFamily: FONTS.regular }
        ]}>Coming Soon</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerDark: {
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    marginLeft: 16,
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000',
  },
  accountText: {
    fontSize: 16,
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  textGrayDark: {
    color: '#888',
  },
  themePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  themePreviewCard: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themePreviewCardDark: {
    backgroundColor: '#1A1A1A',
  },
  themePreviewCardActive: {
    borderColor: '#4C6FFF',
  },
  themePreviewTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  themePreviewTitleDark: {
    color: '#fff',
  },
  themePreviewContent: {
    gap: 8,
  },
  previewLine: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '100%',
  },
  previewLineDark: {
    backgroundColor: '#333',
  },
});

export default SettingsScreen; 