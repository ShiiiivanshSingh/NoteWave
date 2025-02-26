import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Linking,
  TouchableOpacity,
  BackHandler 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/ShiiiivanshSingh",
    iconName: "logo-github"
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/shivansh-pratap-singh-23b3b92b1",
    iconName: "logo-linkedin"
  },
  {
    name: "Twitter",
    url: "https://x.com/de_mirage_fan",
    iconName: "logo-twitter"
  },
  {
    name: "LeetCode",
    url: "https://leetcode.com/u/ShivanshPratapSingh/",
    iconName: "code-slash-outline"  // Using a code icon for LeetCode since there's no specific LeetCode icon
  }
];

const AboutScreen = ({ navigation, darkMode }) => {
  // Add back handler for Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true; // Prevents default behavior (exit app)
    });

    return () => backHandler.remove(); // Cleanup on unmount
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
        ]}>About NoteWave</Text>
      </View>

      {/* App Logo/Icon */}
      <View style={styles.logoContainer}>
        <Ionicons 
          name="journal-outline" 
          size={80} 
          color={darkMode ? '#4C6FFF' : '#2E4BFF'} 
        />
      </View>

      {/* App Version */}
      <Text style={[
        styles.version,
        darkMode && styles.textDark,
        { fontFamily: FONTS.regular }
      ]}>Version 1.0.0</Text>

      {/* App Description */}
      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>About the App</Text>
        <Text style={[
          styles.sectionText,
          darkMode && styles.textGrayDark,
          { fontFamily: FONTS.regular }
        ]}>
          NoteWave is a simple yet powerful note-taking app designed to help you capture your thoughts and track your moods. With an intuitive interface and helpful features, NoteWave makes it easy to stay organized and mindful.
        </Text>
      </View>

      {/* Features */}
      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Key Features</Text>
        <View style={styles.featuresList}>
          {[
            'Simple note taking',
            'Mood tracking',
            'Dark mode support',
            'AI Assistant integration',
            'Data persistence',
            'Clean minimal design'
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={darkMode ? '#4C6FFF' : '#2E4BFF'} 
              />
              <Text style={[
                styles.featureText,
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.regular }
              ]}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact/Links */}
      <View style={[styles.section, darkMode && styles.sectionDark]}>
        <Text style={[
          styles.sectionTitle,
          darkMode && styles.textDark,
          { fontFamily: FONTS.heavy }
        ]}>Connect With Us</Text>
        
        <View style={styles.socialLinksContainer}>
          {socialLinks.map((link, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.socialLink, darkMode && styles.socialLinkDark]}
              onPress={() => Linking.openURL(link.url)}
            >
              <Ionicons 
                name={link.iconName} 
                size={24} 
                color={darkMode ? '#4C6FFF' : '#2E4BFF'} 
              />
              <Text style={[
                styles.socialLinkText,
                darkMode && styles.textGrayDark,
                { fontFamily: FONTS.regular }
              ]}>{link.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Copyright */}
      <Text style={[
        styles.copyright,
        darkMode && styles.textGrayDark,
        { fontFamily: FONTS.light }
      ]}>made with love by shivansh</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
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
    marginBottom: 12,
    color: '#000',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#666',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  socialLinksContainer: {
    marginTop: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  socialLinkDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  socialLinkText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#666',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    marginBottom: 32,
  },
  textDark: {
    color: '#fff',
  },
  textGrayDark: {
    color: '#888',
  },
});

export default AboutScreen; 