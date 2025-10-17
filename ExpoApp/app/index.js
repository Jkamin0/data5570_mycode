import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to ExpoApp!');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // useEffect hook to update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // useState hook for handling button press
  const handleWelcomePress = () => {
    setWelcomeMessage(welcomeMessage === 'Welcome to ExpoApp!' 
      ? 'Hello from React Native!' 
      : 'Welcome to ExpoApp!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>{welcomeMessage}</Text>
      
      <Text style={styles.timeText}>Current Time: {currentTime}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleWelcomePress}>
        <Text style={styles.buttonText}>Toggle Welcome Message</Text>
      </TouchableOpacity>

      <View style={styles.navigationContainer}>
        <Link href="/counter" asChild>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Go to Counter</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/todos" asChild>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Go to Todo List</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    gap: 15,
  },
  navButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
