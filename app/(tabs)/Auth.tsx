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
      <Text style={styles.title}>Ingrese usuario y contraseña</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Ingrese su correo electrónico"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Ingrese su contraseña"
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    color: 'blue',
  },
});

export default Auth;
