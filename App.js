import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import DocumentPicker from 'react-native-document-picker';

function App() {
    const [musicList, setMusicList] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState();

    useEffect(() => {
        const loadMusic = async () => {
            const storedMusic = await AsyncStorage.getItem('musicList');
            console.log("Stored Music:", storedMusic); // Debugging line
            if (storedMusic) {
                setMusicList(JSON.parse(storedMusic));
            } else {
                console.log("No music found in local storage."); // Debugging line
            }
        };

        loadMusic();
    }, []);

    const playTrack = async (track) => {
        const { sound } = await Audio.Sound.createAsync(
            { uri: track.url }
        );
        setSound(sound);
        await sound.playAsync();
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const stopTrack = async () => {
        if (sound) {
            await sound.stopAsync();
            setCurrentTrack(null);
            setIsPlaying(false);
        }
    };

    const selectDirectory = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio],
            });
            console.log("Selected file:", res);
            // Here you can add logic to read the selected file and update the musicList
            // For example, you can add the selected file to the musicList state
            const newTrack = {
                name: res.name,
                url: res.uri,
                albumArt: "https://www.example.com/defaultAlbumArt.jpg" // Placeholder for album art
            };
            setMusicList(prevList => [...prevList, newTrack]);
            await AsyncStorage.setItem('musicList', JSON.stringify([...musicList, newTrack]));
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User cancelled the picker");
            } else {
                console.error("Error picking file:", err);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Offline Music Player</Text>
            <Button title="Add Music" onPress={selectDirectory} />
            <FlatList
                data={musicList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.trackContainer}>
                        <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
                        <Text style={styles.trackName}>{item.name}</Text>
                        <Button title="Play" onPress={() => playTrack(item)} />
                    </View>
                )}
            />
            {isPlaying && currentTrack && (
                <View style={styles.nowPlaying}>
                    <Text style={styles.nowPlayingText}>Now Playing: {currentTrack.name}</Text>
                    <Button title="Stop" onPress={stopTrack} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: '#1DB954',
        marginBottom: 20,
    },
    trackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    trackName: {
        flex: 1,
        color: '#FFFFFF',
    },
    nowPlaying: {
        marginTop: 20,
    },
    nowPlayingText: {
        fontSize: 18,
        color: '#1DB954',
    },
});

export default App;
