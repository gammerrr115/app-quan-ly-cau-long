import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchPlayers, updatePlayer, Player } from '../services/api';

export default function EditPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [court, setCourt] = useState('');
  const [time, setTime] = useState('');
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPlayer = async () => {
      if (!id) return;
      const players = await fetchPlayers();
      const player = players.find(p => p.id === id);
      if (player) {
        setName(player.name);
        setCourt(player.court);
        setTime(player.time);
        setPaid(player.paid);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy người chơi này.');
        router.back();
      }
      setLoading(false);
    };
    loadPlayer();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim() || !court.trim() || !time.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin (Tên, Sân, Giờ).');
      return;
    }

    setSaving(true);
    const res = await updatePlayer(id, { name, court, time, paid });
    setSaving(false);

    if (res.status === 'success') {
      Alert.alert('Thành công', 'Đã cập nhật thông tin.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Lỗi', 'Không thể cập nhật người chơi lúc này.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tên người chơi</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Nguyễn Văn A"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Sân cầu lông</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Sân 1"
          value={court}
          onChangeText={setCourt}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Giờ tham gia</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 18:00 - 20:00"
          value={time}
          onChangeText={setTime}
        />
      </View>

      <View style={[styles.formGroup, styles.switchGroup]}>
        <Text style={styles.label}>Đã đóng phí</Text>
        <Switch value={paid} onValueChange={setPaid} trackColor={{ false: '#767577', true: '#4CAF50' }} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Cập Nhật Thông Tin</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
