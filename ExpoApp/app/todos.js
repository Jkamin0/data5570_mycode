import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, toggleItem, removeItem } from '../store/counterSlice';
import { Link } from 'expo-router';
import TodoItem from '../components/TodoItem';

// Parent component - TodoScreen
export default function TodoScreen() {
  const [inputText, setInputText] = useState('');
  const items = useSelector((state) => state.counter.items);
  const dispatch = useDispatch();

  const handleAddItem = () => {
    if (inputText.trim()) {
      dispatch(addItem(inputText.trim()));
      setInputText('');
    } else {
      Alert.alert('Error', 'Please enter a todo item');
    }
  };

  const handleToggleItem = (id) => {
    dispatch(toggleItem(id));
  };

  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  const renderTodoItem = ({ item }) => (
    <TodoItem 
      item={item}
      onToggle={handleToggleItem}
      onRemove={handleRemoveItem}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter a new todo..."
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.statsText}>
        Total: {items.length} | Completed: {items.filter(item => item.completed).length}
      </Text>

      <FlatList
        data={items}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Link href="/" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
