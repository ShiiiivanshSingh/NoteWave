import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RichTextEditor = ({ value, onChange, style }) => {
  const [lines, setLines] = useState(value.split('\n').map(text => ({
    text,
    type: 'text' // can be 'text', 'bullet', 'checkbox', 'checkbox-checked'
  })));

  const handleLineChange = (index, newText) => {
    const newLines = [...lines];
    newLines[index].text = newText;
    
    const combinedText = newLines.map(line => {
      if (line.type === 'bullet') return `• ${line.text}`;
      if (line.type === 'checkbox') return `☐ ${line.text}`;
      if (line.type === 'checkbox-checked') return `☑ ${line.text}`;
      return line.text;
    }).join('\n');
    
    onChange(combinedText);
    setLines(newLines);
  };

  const toggleLineType = (index, newType) => {
    const newLines = [...lines];
    const line = newLines[index];
    
    if (line.type === newType) {
      line.type = 'text';
    } else {
      line.type = newType;
    }
    
    setLines(newLines);
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => (
        <View key={index} style={styles.lineContainer}>
          <View style={styles.linePrefix}>
            {line.type === 'bullet' && <Text>•</Text>}
            {line.type === 'checkbox' && <Icon name="check-box-outline-blank" size={16} />}
            {line.type === 'checkbox-checked' && <Icon name="check-box" size={16} />}
          </View>
          <TextInput
            style={[styles.input, style]}
            value={line.text}
            onChangeText={(text) => handleLineChange(index, text)}
            multiline
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  linePrefix: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 2,
  },
});

export default RichTextEditor; 