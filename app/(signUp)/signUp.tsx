import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { supabase } from '../../supabase'; // Ajusta la ruta si es necesario
import ToastManager, { Toast } from 'toastify-react-native';
import { router, useRouter } from 'expo-router';
import Auth from '../(tabs)/Auth';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // Nuevo campo para el nombre del usuario
  const [employeeNumber, setEmployeeNumber] = useState(''); // Nuevo campo para el número de empleado
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !username || !employeeNumber) {
      Toast.warn("Por favor llene todos los campos");
      return;
    }
  
    if (password !== confirmPassword) {
      Toast.warn("Las contraseñas no coinciden");
      return;
    }
  
    setLoading(true);
  
    try {
      // Paso 1: Crear un usuario con correo electrónico y contraseña usando Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        // Paso 2: Mostrar un mensaje más detallado del error
        console.error('Error al registrar el usuario:', error.message);
        Toast.warn("Error al registrar el usuario");
        setLoading(false);
        return;
      }
  
      // Paso 3: Verificar los datos recibidos
      if (data && data.user) { // Verifica si 'data.user' no es null
        const userId = data.user.id; // Obtener el UUID del usuario creado
  
        // Paso 4: Insertar el usuario en la tabla 'users'
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              username: username, // Usamos el nombre del usuario ingresado
              employee_number: employeeNumber, // Agregamos el número de empleado
              role: 'employee', // Asignamos el rol por defecto como 'employee'
              email: email,
              id: userId, // Insertamos el UUID generado por Supabase Auth
            },
          ]);
  
        if (insertError) {
          console.error('Error al insertar usuario en la base de datos:', insertError.message);
          Toast.warn("Error al insertar el usuario en la base de datos");
          setLoading(false);
          return;
        }
  
        console.log("Usuario creado con éxito");
        Toast.warn("Usuario creado con éxito");
  
        router.replace('/Auth');
      } else {
        Toast.warn("No se pudo obtener el usuario de Supabase");
        setLoading(false);
      }
    } catch (error) {
      // Manejo de error en la solicitud
      Toast.warn("Error inesperado");
      console.error('Error inesperado:', error);
    }
  
    setLoading(false);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regístrate</Text>

      {/* Campo de nombre de usuario */}
      <TextInput
        style={styles.inputField}
        value={username}
        onChangeText={setUsername}
        placeholder="Nombre de usuario"
      />

      {/* Campo de número de empleado */}
      <TextInput
        style={styles.inputField}
        value={employeeNumber}
        onChangeText={setEmployeeNumber}
        placeholder="Número de empleado"
        keyboardType="numeric"
      />

      {/* Campo de correo */}
      <TextInput
        style={styles.inputField}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de contraseña */}
      <TextInput
        style={styles.inputField}
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
      />

      {/* Campo de confirmar contraseña */}
      <TextInput
        style={styles.inputField}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirmar contraseña"
        secureTextEntry
      />

      {/* Botón para crear cuenta */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>

      {loading && <Text>Loading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SignUp;
