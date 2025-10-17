import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Child component - TodoItem
export default function TodoItem({ item, onToggle, onRemove }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.textContainer} 
        onPress={() => onToggle(item.id)}
      >
        <Text style={[
          styles.text, 
          item.completed && styles.completedText
        ]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onRemove(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
