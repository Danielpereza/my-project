import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, View, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../supabase'; // Ajusta la ruta según tu proyecto
import ToastManager, { Toast } from 'toastify-react-native';
import { Picker } from '@react-native-picker/picker';

type Category = {
  id: number;
  name: string;
};

const CreateProduct = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [lowLimit, setLowLimit] = useState<string>(''); // Mínimo
  const [highLimit, setHighLimit] = useState<string>(''); // Máximo
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');

      if (error) {
        console.log('Error fetching categories:', error.message);
        Toast.warn('Error al cargar categorías');
        return;
      }

      setCategories(data as Category[]);
    } catch (error) {
      console.log('Unexpected error:', error);
      Toast.warn('Error inesperado al cargar categorías');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateProduct = async () => {
    if (!name || !categoryId || !quantity || !price || !lowLimit || !highLimit) {
      Toast.warn('Por favor llene todos los campos requeridos');
      return;
    }

    if (parseInt(lowLimit) > parseInt(highLimit)) {
      Toast.warn('El límite mínimo no puede ser mayor al máximo');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name,
            description,
            category_id: categoryId,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            low_limit: parseInt(lowLimit),
            high_limit: parseInt(highLimit),
          },
        ]);

      if (error) {
        console.error('Error creating product:', error.message);
        Toast.warn('Error al crear el producto');
        setLoading(false);
        return;
      }

      Toast.warn('Producto creado con éxito');
      setName('');
      setDescription('');
      setCategoryId(null);
      setQuantity('');
      setPrice('');
      setLowLimit('');
      setHighLimit('');
    } catch (error) {
      console.error('Unexpected error:', error);
      Toast.warn('Error inesperado al crear el producto');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Producto</Text>

      <TextInput
        style={styles.inputField}
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
      />

      <TextInput
        style={styles.inputField}
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción (opcional)"
        multiline
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoryId ?? undefined}
          onValueChange={(itemValue: number) => setCategoryId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione una categoría" value={null} />
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.inputField}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Cantidad"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.inputField}
        value={price}
        onChangeText={setPrice}
        placeholder="Precio"
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.inputField}
        value={lowLimit}
        onChangeText={setLowLimit}
        placeholder="Límite mínimo"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.inputField}
        value={highLimit}
        onChangeText={setHighLimit}
        placeholder="Límite máximo"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateProduct} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Producto'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputField: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateProduct;
