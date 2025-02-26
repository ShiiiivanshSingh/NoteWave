import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import ColorPicker from './ColorPicker';
import TagInput from './TagInput';
import RichTextEditor from './RichTextEditor';

const NoteEditor = ({ note, onSave, onClose }) => {
  const [content, setContent] = useState(note?.content || '');
  const [backgroundColor, setBackgroundColor] = useState(note?.backgroundColor || '#ffffff');
  const [color, setColor] = useState(note?.color || '#000000');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [tags, setTags] = useState(note?.tags || []);
  const [images, setImages] = useState(note?.images || []);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [activeFormat, setActiveFormat] = useState('text');

  const handleSave = () => {
    onSave({
      ...note,
      content,
      backgroundColor,
      color,
      isPinned,
      tags,
      images,
      updatedAt: new Date(),
    });
    onClose();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleFormatPress = (format) => {
    setActiveFormat(format === activeFormat ? 'text' : format);
  };

  return (
    <Modal animationType="slide" visible={true}>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={color} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsColorPickerVisible(!isColorPickerVisible)}>
              <Icon name="palette" size={24} color={color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Icon name="image" size={24} color={color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsPinned(!isPinned)}>
              <Icon name={isPinned ? 'push-pin' : 'push-pin-outlined'} size={24} color={color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Icon name="check" size={24} color={color} />
            </TouchableOpacity>
          </View>
        </View>

        {isColorPickerVisible && (
          <ColorPicker
            selectedColor={backgroundColor}
            onColorSelect={setBackgroundColor}
          />
        )}

        <View style={styles.formatBar}>
          <TouchableOpacity onPress={() => setIsBold(!isBold)}>
            <Icon 
              name="format-bold" 
              size={20} 
              color={isBold ? color : '#666'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsItalic(!isItalic)}>
            <Icon 
              name="format-italic" 
              size={20} 
              color={isItalic ? color : '#666'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFormatPress('bullet')}>
            <Icon 
              name="format-list-bulleted" 
              size={20} 
              color={activeFormat === 'bullet' ? color : '#666'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFormatPress('checkbox')}>
            <Icon 
              name="check-box" 
              size={20} 
              color={activeFormat === 'checkbox' ? color : '#666'} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <RichTextEditor
            value={content}
            onChange={setContent}
            style={[
              styles.input,
              { color },
              isBold && styles.boldText,
              isItalic && styles.italicText,
            ]}
          />
          
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <TagInput tags={tags} onTagsChange={setTags} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
  },
  formatBar: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

export default NoteEditor; 