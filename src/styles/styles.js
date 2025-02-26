import { StyleSheet, Dimensions } from 'react-native';
import { FONTS } from '../constants/fonts';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // ... existing styles ...

  // Text styles with Montana fonts
  dayText: {
    fontSize: 32,
    fontFamily: FONTS.heavy,
    color: '#000',
  },
  mainCardTitle: {
    fontSize: 24,
    fontFamily: FONTS.heavy,
    color: '#000',
  },
  noteText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#000',
  },
  noteDate: {
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#666',
    marginTop: 4,
  },
  noteMood: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  settingsSectionTitle: {
    fontSize: 28,
    fontFamily: FONTS.heavy,
    color: '#000',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONTS.heavy,
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontFamily: FONTS.heavy,
    color: '#000',
  },
  userSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.light,
    color: '#666',
  },
  feelingButtonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#000',
  },
  chatbotTitle: {
    fontSize: 20,
    fontFamily: FONTS.heavy,
    color: '#000',
  },
  chatbotDescription: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: 30,
  }
  // ... rest of your styles
}); 