import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { fetchPlayers, updatePaymentStatus, Player } from '../services/api';

export default function HomeScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await fetchPlayers();
    setPlayers(data);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleTogglePayment = async (player: Player) => {
    const newStatus = !player.paid;
    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, paid: newStatus } : p))
    );

    const res = await updatePaymentStatus(player.id, newStatus);
    if (res.status === 'error') {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đóng phí.');
      // Revert optimistic update
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, paid: !newStatus } : p))
      );
    }
  };

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.court}>{item.court}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.time}>Giờ: {item.time}</Text>
        <TouchableOpacity
          style={[styles.payButton, item.paid ? styles.paid : styles.unpaid]}
          onPress={() => handleTogglePayment(item)}
        >
          <Text style={styles.payButtonText}>{item.paid ? 'Đã đóng phí' : 'Chưa đóng'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/add')} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Thêm</Text>
            </TouchableOpacity>
          )
        }} 
      />
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        ListEmptyComponent={
          !refreshing ? <Text style={styles.emptyText}>Chưa có người đăng ký nào.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  court: {
    fontSize: 14,
    fontWeight: '600',
    color: '#208AEF',
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paid: {
    backgroundColor: '#4CAF50',
  },
  unpaid: {
    backgroundColor: '#F44336',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    marginRight: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#208AEF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
