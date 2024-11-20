import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../supabase';

// Define la estructura de los movimientos
type Movement = {
  id: number;
  product_id: string;
  product_name: string; // Añadimos el nombre del producto
  movement_type: string;
  quantity: number;
  created_at: string;
  user_id: string;
  username: string; // Añadimos el username del usuario
};

const RevertScreen = () => {
  const [movements, setMovements] = useState<Movement[]>([]);

  // Función para obtener el username del user_id
  const fetchUsername = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Error al obtener el username:', error.message);
      return ''; // Retornamos un string vacío si hay error
    }

    return data ? data.username : ''; // Retorna el username o vacío si no se encuentra
  };

  // Función para obtener el nombre del producto
  const fetchProductName = async (productId: string): Promise<string> => {
    const { data, error } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    if (error) {
      console.log('Error al obtener el nombre del producto:', error.message);
      return ''; // Retornamos un string vacío si hay error
    }

    return data ? data.name : ''; // Retorna el nombre o vacío si no se encuentra
  };

  // Función para obtener los movimientos
  const fetchMovements = async () => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      Alert.alert('Error', error?.message || 'No se pudieron obtener los movimientos.');
      return;
    }

    // Obtener los usernames y nombres de productos para cada movimiento
    const movementsWithDetails = await Promise.all(
      data.map(async (movement) => {
        const username = await fetchUsername(movement.user_id);
        const productName = await fetchProductName(movement.product_id);
        return { ...movement, username, product_name: productName }; // Añadimos el username y el nombre del producto
      })
    );

    setMovements(movementsWithDetails);
  };

  // Función para actualizar el inventario
  const updateInventory = async (productId: string, quantity: number, movementType: string) => {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (productError) {
      console.log('Error al obtener el producto:', productError);
      Alert.alert('Error', 'No se pudo obtener el producto.');
      return;
    }

    const newQuantity =
      movementType === 'in' ? productData.quantity - quantity : productData.quantity + quantity;

    const { error, data } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId);

    console.log('Supabase Response Data:', data);
    console.log('Supabase Response Error:', error);

    if (error) {
      console.log('Error al actualizar el inventario:', error);
      Alert.alert('Error', 'No se pudo actualizar el inventario.');
    }
  };

  // Función para revertir un movimiento
  const handleRevert = async (id: number, productId: string, movementType: string, quantity: number) => {
    const { error: deleteError } = await supabase
      .from('inventory_movements')
      .delete()
      .eq('id', id);

    if (deleteError) {
      Alert.alert('Error', deleteError.message);
    } else {
      await updateInventory(productId, quantity, movementType);

      Alert.alert('Éxito', 'Movimiento revertido y inventario actualizado.');
      fetchMovements(); // Actualiza la lista después de revertir
    }
  };

  // Función para actualizar los movimientos manualmente
  const handleRefresh = () => {
    fetchMovements();
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Movimientos</Text>
      
      {/* Botón de actualizar */}
      <Button
        title="Actualizar"
        onPress={handleRefresh}
        color="#4CAF50"
      />

      {movements.length === 0 ? (
        <Text style={styles.message}>No hay movimientos registrados.</Text>
      ) : (
        <ScrollView style={styles.scrollView}>
          {movements.map((movement) => (
            <View key={movement.id} style={styles.movementContainer}>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>Producto:</Text> {movement.product_name}
              </Text>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>ID:</Text> {movement.product_id}
              </Text>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>Tipo:</Text> {movement.movement_type}
              </Text>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>Cantidad:</Text> {movement.quantity}
              </Text>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>Usuario:</Text> {movement.username}
              </Text>
              <Text style={styles.movementText}>
                <Text style={styles.boldText}>Fecha:</Text> {new Date(movement.created_at).toLocaleString()}
              </Text>
              <Button
                title="Revertir"
                onPress={() => handleRevert(movement.id, movement.product_id, movement.movement_type, movement.quantity)}
                color="#d9534f"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
  },
  scrollView: {
    marginTop: 10,
  },
  movementContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  movementText: {
    fontSize: 14,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default RevertScreen;
