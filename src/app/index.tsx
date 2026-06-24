import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { fetchPlayers, updatePaymentStatus, deletePlayer, Player } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, paid: newStatus } : p))
    );

    const res = await updatePaymentStatus(player.id, newStatus);
    if (res.status === 'error') {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đóng phí.');
      setPlayers((prev) =>
        prev.map((p) => (p.id === player.id ? { ...p, paid: !newStatus } : p))
      );
    }
  };

  const handleDelete = (player: Player) => {
    Alert.alert('Xác nhận', `Bạn có chắc muốn xóa người chơi ${player.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const res = await deletePlayer(player.id);
          if (res.status === 'success') {
            loadData();
          } else {
            Alert.alert('Lỗi', 'Không thể xóa người chơi.');
          }
        },
      },
    ]);
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.court.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [players, searchQuery]);

  const totalPlayers = players.length;
  const totalPaid = players.filter(p => p.paid).length;
  const totalUnpaid = totalPlayers - totalPaid;

  const renderDashboard = () => (
    <View style={styles.dashboard}>
      <Text style={styles.dashboardTitle}>Thống kê Tham gia</Text>
      <View style={styles.dashboardCards}>
        <View style={[styles.dashCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.dashLabel}>Tổng số</Text>
          <Text style={[styles.dashValue, { color: '#1565C0' }]}>{totalPlayers}</Text>
        </View>
        <View style={[styles.dashCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.dashLabel}>Đã đóng</Text>
          <Text style={[styles.dashValue, { color: '#2E7D32' }]}>{totalPaid}</Text>
        </View>
        <View style={[styles.dashCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.dashLabel}>Chưa đóng</Text>
          <Text style={[styles.dashValue, { color: '#C62828' }]}>{totalUnpaid}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.court}>{item.court}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => router.push(`/edit?id=${item.id}`)} style={styles.iconButton}>
            <Ionicons name="pencil" size={20} color="#208AEF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
            <Ionicons name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
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
          ),
          title: "Quản lý Cầu lông"
        }} 
      />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc sân..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        ListHeaderComponent={renderDashboard}
        ListEmptyComponent={
          !refreshing ? <Text style={styles.emptyText}>Không tìm thấy người chơi nào.</Text> : null
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  dashboard: {
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dashboardCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dashLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  dashValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  court: {
    fontSize: 14,
    fontWeight: '600',
    color: '#208AEF',
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
});
