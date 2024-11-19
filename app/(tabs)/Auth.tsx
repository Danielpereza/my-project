import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../supabase'; // Ruta correcta del archivo de configuración
import { useRouter } from 'expo-router'; // Importar useRouter
import { Link } from 'expo-router'; // Importar Link de expo-router

const Auth = () => {
  const router = useRouter(); // Crear una instancia de router con useRouter
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingrese usuario y contraseña');
      return;
    }

    try {
      // Realiza la autenticación con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Si la autenticación es exitosa, redirige a la siguiente pantalla
      Alert.alert('Éxito', 'Usuario autenticado');
      // Usamos el enrutamiento de expo-router para redirigir a la siguiente pantalla
      router.replace('/logs'); // Cambia esto por la ruta de tu aplicación

    } catch (error) {
      console.error('Error de autenticación:', error);
      Alert.alert('Error', 'Algo salió mal');
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Text>Ingrese usuario y contraseña</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Correo Electrónico"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      
      <Text style={styles.registerLink}>
        ¿No tienes una cuenta? 
        <Link href="/signUp">
          <Text style={styles.registerText}> Regístrate</Text>
        </Link>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  registerLink: {
    fontSize: 16,
    marginTop: 20,
  },
  registerText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default Auth;
