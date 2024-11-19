import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../supabase';

const CreateCategoryScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCategory = async () => {
    if (!name) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    const { data, error } = await supabase.from('categories').insert([{ name, description }]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Categoría creada.');
      setName('');
      setDescription('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Categoría</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de la Categoría:</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          style={styles.input}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción:</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción"
          style={styles.input}
        />
      </View>
      <Button title="Crear Categoría" onPress={handleCreateCategory} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});

export default CreateCategoryScreen;
