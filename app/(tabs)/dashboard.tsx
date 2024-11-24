import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../../supabase'; // Ajusta la ruta de importación según tu proyecto
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

type Product = {
  id: number;
  name: string;
  description: string;
  category_id: number;
  quantity: number;
  price: number;
  low_limit: number;
  high_limit: number;
};

type Movement = {
  product_id: number;
  quantity: number;
};

const GraphScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category_id, quantity, price, low_limit, high_limit');

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('product_id, quantity');

      if (error) throw error;
      setMovements(data as Movement[]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los movimientos.');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  const calculateMoneyByProduct = () => {
    return products.map((product) => ({
      name: product.name,
      moneyInStock: product.quantity * product.price,
    }));
  };

  const getLowLimitProducts = () => {
    return products.filter((product) => product.quantity < product.low_limit);
  };

  const getHighLimitProducts = () => {
    return products.filter((product) => product.quantity > product.high_limit);
  };

  const calculateMovementCounts = () => {
    const movementCounts = movements.reduce((acc, movement) => {
      acc[movement.product_id] = (acc[movement.product_id] || 0) + movement.quantity;
      return acc;
    }, {} as Record<number, number>);

    const mostMoved = Object.entries(movementCounts).sort((a, b) => b[1] - a[1]);
    const leastMoved = Object.entries(movementCounts).sort((a, b) => a[1] - b[1]);

    return {
      mostMoved: mostMoved.slice(0, 5),
      leastMoved: leastMoved.slice(0, 5),
    };
  };

  const moneyData = calculateMoneyByProduct();
  const lowLimitProducts = getLowLimitProducts();
  const highLimitProducts = getHighLimitProducts();
  const { mostMoved, leastMoved } = calculateMovementCounts();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gráficas de Inventario</Text>

      {/* Dinero por Producto (Gráfico Circular) */}
      <Text style={styles.subtitle}>Dinero por Producto</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={moneyData.map((item) => ({
            name: item.name,
            population: item.moneyInStock,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Color aleatorio
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          }))}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#008080',
            backgroundGradientFrom: '#00ced1',
            backgroundGradientTo: '#5f9ea0',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      {/* Productos Debajo del Límite Inferior (Tabla) */}
      <Text style={styles.subtitle}>Productos Debajo del Límite Inferior</Text>
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableText}>Producto</Text>
            <Text style={styles.tableText}>Precio</Text>
            <Text style={styles.tableText}>Cantidad</Text>
            <Text style={styles.tableText}>Cantidad Bajo Límite</Text>
            <Text style={styles.tableText}>Límite Inferior</Text>
          </View>
          {lowLimitProducts.length > 0 ? (
            lowLimitProducts.map((product) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={styles.tableText}>{product.name}</Text>
                <Text style={styles.tableText}>{`$${product.price.toFixed(2)}`}</Text>
                <Text style={styles.tableText}>{`${product.quantity} unidades`}</Text>
                <Text style={styles.tableText}>{`${product.low_limit - product.quantity} unidades debajo del límite`}</Text>
                <Text style={styles.tableText}>{`Límite: ${product.low_limit} unidades`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay productos por debajo del límite inferior.</Text>
          )}
        </View>
      </ScrollView>

      {/* Productos por Encima del Límite Superior (Tabla) */}
      <Text style={styles.subtitle}>Productos Por Encima del Límite Superior</Text>
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableText}>Producto</Text>
            <Text style={styles.tableText}>Precio</Text>
            <Text style={styles.tableText}>Cantidad</Text>
            <Text style={styles.tableText}>Cantidad Sobre Límite</Text>
            <Text style={styles.tableText}>Límite Superior</Text>
          </View>
          {highLimitProducts.length > 0 ? (
            highLimitProducts.map((product) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={styles.tableText}>{product.name}</Text>
                <Text style={styles.tableText}>{`$${product.price.toFixed(2)}`}</Text>
                <Text style={styles.tableText}>{`${product.quantity} unidades`}</Text>
                <Text style={styles.tableText}>{`${product.quantity - product.high_limit} unidades por encima del límite`}</Text>
                <Text style={styles.tableText}>{`Límite: ${product.high_limit} unidades`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay productos por encima del límite superior.</Text>
          )}
        </View>
      </ScrollView>
      {/* Tabla de Productos y Características */}
      <Text style={styles.subtitle}>Productos y Sus Características</Text>
      <ScrollView horizontal>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableText}>Producto</Text>
            <Text style={styles.tableText}>Descripción</Text>
            <Text style={styles.tableText}>Categoría</Text>
            <Text style={styles.tableText}>Cantidad</Text>
            <Text style={styles.tableText}>Precio</Text>
            <Text style={styles.tableText}>Límite Inferior</Text>
            <Text style={styles.tableText}>Límite Superior</Text>
          </View>
          {products.length > 0 ? (
            products.map((product) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={styles.tableText}>{product.name}</Text>
                <Text style={styles.tableText}>{product.description}</Text>
                <Text style={styles.tableText}>{product.category_id}</Text>
                <Text style={styles.tableText}>{`${product.quantity} unidades`}</Text>
                <Text style={styles.tableText}>{`$${product.price.toFixed(2)}`}</Text>
                <Text style={styles.tableText}>{`Límite Inferior: ${product.low_limit}`}</Text>
                <Text style={styles.tableText}>{`Límite Superior: ${product.high_limit}`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay productos registrados.</Text>
          )}
        </View>
      </ScrollView>

      {/* Gráfico de Productos Más Movidos */}
      <Text style={styles.subtitle}>Productos Más Movidos</Text>
      <ScrollView horizontal>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: mostMoved.map((item) => item[0]),
              datasets: [
                {
                  data: mostMoved.map((item) => item[1]),
                },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=''
            yAxisSuffix=''
            chartConfig={{
              backgroundColor: '#008080',
              backgroundGradientFrom: '#00ced1',
              backgroundGradientTo: '#5f9ea0',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={30}
          />
        </View>
      </ScrollView>

      {/* Gráfico de Productos Menos Movidos */}
      <Text style={styles.subtitle}>Productos Menos Movidos</Text>
      <ScrollView horizontal>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: leastMoved.map((item) => item[0]),
              datasets: [
                {
                  data: leastMoved.map((item) => item[1]),
                },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=''
            yAxisSuffix=''
            chartConfig={{
              backgroundColor: '#008080',
              backgroundGradientFrom: '#00ced1',
              backgroundGradientTo: '#5f9ea0',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={30}
          />
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  chartContainer: {
    marginBottom: 20,
  },
  tableContainer: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    justifyContent: 'space-between', // Ensures proper distribution of columns
  },
  tableText: {
    padding: 5,
    fontSize: 14,
    width: screenWidth / 4, // Adjust this value to fit your columns
    textAlign: 'center', // Center-align text for readability
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  noDataText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default GraphScreen;
