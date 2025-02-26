import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = [
  '#ffffff', '#f28b82', '#fbbc04', '#fff475', 
  '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', 
  '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
];

const ColorPicker = ({ selectedColor, onColorSelect }) => {
  return (
    <View style={styles.container}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColor === color && styles.selected,
          ]}
          onPress={() => onColorSelect(color)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#000',
  },
});

export default ColorPicker; 