import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image, TextInput } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { YouTube } from 'react-native-youtube-iframe';

const API_KEY = 'AIzaSyCXsoDwxwma6xDENufcLFY-E35ttAYPjvs'; // Replace with your YouTube API key

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [videoList, setVideoList] = useState([]);
    const [playingVideoId, setPlayingVideoId] = useState(null);

    const requestPermissions = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
        } else {
            console.log('Media library access granted');
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    const searchYouTube = async () => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&key=${API_KEY}`
            );
            const data = await response.json();
            console.log("YouTube API Response:", data); // Log the response
            if (data.items && data.items.length > 0) {
                const videos = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                }));
                setVideoList(videos);
            } else {
                console.error("No videos found for the search query.");
                alert("No videos found for the search query.");
            }
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
        }
    };

    const playVideo = (videoId) => {
        console.log("Playing video ID:", videoId); // Log the video ID
        setPlayingVideoId(videoId);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>YouTube Music Player</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search for music..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <Button title="Search" onPress={searchYouTube} />
            <FlatList
                data={videoList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.videoItem}>
                        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                        <Text style={styles.videoTitle}>{item.title}</Text>
                        <Button title="Play" onPress={() => playVideo(item.id)} />
                    </View>
                )}
            />
            {playingVideoId && (
                <YouTube
                    videoId={playingVideoId}
                    style={styles.youtubePlayer}
                    play={true}
                    fullscreen={false}
                    loop={false}
                />
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
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#FFFFFF',
    },
    videoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    videoTitle: {
        flex: 1,
        color: '#FFFFFF',
    },
    youtubePlayer: {
        alignSelf: 'stretch',
        height: 300,
        marginTop: 20,
    },
});

export default App;
