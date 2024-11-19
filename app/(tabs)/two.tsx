import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Usamos el CameraView de expo-camera
import { supabase } from '../../supabase';

const ExitScreen = () => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [scanning, setScanning] = useState(false); // Estado para controlar el escaneo
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Estado para los permisos de la cámara

  // Solicitar permisos de la cámara
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission?.status === 'denied') {
      requestPermission();  // Si el permiso fue denegado, lo pedimos de nuevo.
    }
  }, [permission]);

  const handleExit = async () => {
    if (!productId || !quantity) {
      Alert.alert('Error', 'Llena todos los campos.');
      return;
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      Alert.alert('Error', 'No se ha iniciado sesión.');
      console.log('Error al obtener el usuario:', userError); // Log the error if getting the user fails
      return;
    }

    const userId = data.user.id;  // Access the user ID correctly
    console.log('Usuario ID obtenido:', userId);  // Log the user ID for debugging

    // Check if the user exists in the "users" table
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // Log the userData and check for any mismatch
    console.log('Resultado de la búsqueda del usuario en la tabla users:', userData);

    if (userCheckError) {
      console.log('Error al verificar el usuario en la tabla users:', userCheckError);  // Log the error if checking the user fails
      Alert.alert('Error', 'Error al verificar el usuario en el sistema.');
      return;
    }

    if (!userData) {
      console.log('El usuario no está registrado en la tabla users:', userId);  // Log if user is not found
      Alert.alert('Error', 'El usuario no está registrado en el sistema.');
      return;
    }

    console.log('Usuario verificado:', userData);  // Log the user data if it is found
    // Get the current user
  

    // Proceed to insert the movement
    const { data: movementData, error } = await supabase
      .from('inventory_movements')
      .insert([
        {
          product_id: productId,
          movement_type: 'out',
          quantity: parseInt(quantity),
          user_id: userId,  // Save the user ID who made the change
        },
      ]);

    if (error) {
      console.log('Error al insertar el movimiento:', error);  // Log the error if insert fails
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Producto registrado con salida.');
      setProductId('');
      setQuantity('');
    }
  };

  // Manejar el escaneo del código
  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setProductId(data); // Asignamos el ID del producto escaneado
    setScanning(false); // Detenemos el escaneo
  };

  if (permission?.status === null) {
    return <Text>Solicitando permiso para la cámara...</Text>;
  }

  if (permission?.status === 'denied') {
    return <Text>No se tiene acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Salida de Producto</Text>
      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            facing="back"
          />
          <View style={styles.overlay}>
            <Button title="Detener escaneo" onPress={() => setScanning(false)} />
          </View>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="ID del Producto"
            value={productId}
            onChangeText={setProductId}
          />
          <Button title="Escanear Código QR" onPress={() => setScanning(true)} color="#4CAF50" />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button title="Registrar Salida" onPress={handleExit} color="#4CAF50" />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});

export default ExitScreen;
