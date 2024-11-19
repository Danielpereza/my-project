import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'; // Usamos el CameraView de expo-camera
import { supabase } from '../../supabase'; // Supabase para interactuar con la base de datos

const EntryScreen = () => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [scanning, setScanning] = useState(false); // Estado para controlar el escaneo
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Estado para los permisos de la cámara

  // Solicitar permisos de la cámara al montar el componente
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission?.status === 'denied') {
      requestPermission();  // Si el permiso fue denegado, lo pedimos de nuevo.
    }
  }, [permission]);

  const handleEntry = async () => {
    if (!productId || !quantity) {
      Alert.alert('Error', 'Llena todos los campos.');
      return;
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      Alert.alert('Error', 'No se ha iniciado sesión.');
      console.log('Error al obtener el usuario:', userError);
      return;
    }

    const userId = data.user.id;

    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError) {
      console.log('Error al verificar el usuario en la tabla users:', userCheckError);
      Alert.alert('Error', 'Error al verificar el usuario en el sistema.');
      return;
    }

    if (!userData) {
      console.log('El usuario no está registrado en la tabla users:', userId);
      Alert.alert('Error', 'El usuario no está registrado en el sistema.');
      return;
    }

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, quantity')
      .eq('id', productId)
      .single();

    if (productError) {
      console.log('Error al verificar el producto en la tabla products:', productError);
      Alert.alert('Error', 'Error al verificar el producto en la base de datos.');
      return;
    }

    if (!productData) {
      console.log('El producto no está registrado en la tabla products:', productId);
      Alert.alert('Error', 'El producto no está registrado en el sistema.');
      return;
    }

    const newQuantity = productData.quantity + parseInt(quantity);

    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId);

    if (updateError) {
      console.log('Error al actualizar la cantidad del producto:', updateError);
      Alert.alert('Error', 'Error al actualizar la cantidad del producto.');
      return;
    }

    const { data: movementData, error } = await supabase
      .from('inventory_movements')
      .insert([{
        product_id: productId,
        movement_type: 'in',
        quantity: parseInt(quantity),
        user_id: userId,
      }]);

    if (error) {
      console.log('Error al insertar el movimiento:', error);
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Entrada de producto registrada.');
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
      <Text style={styles.title}>Registrar Entrada de Producto</Text>
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
      <Button title="Registrar Entrada" onPress={handleEntry} color="#4CAF50" />
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

export default EntryScreen;
