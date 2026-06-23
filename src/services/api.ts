import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@badminton_players';

export interface Player {
  id: string;
  name: string;
  court: string;
  time: string;
  paid: boolean;
}

export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi tải danh sách:', error);
    return [];
  }
};

export const addPlayer = async (player: Omit<Player, 'id'>) => {
  try {
    const players = await fetchPlayers();
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
    };
    players.push(newPlayer);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    return { status: 'success', id: newPlayer.id };
  } catch (error) {
    console.error('Lỗi khi thêm người chơi:', error);
    return { status: 'error' };
  }
};

export const updatePaymentStatus = async (id: string, paid: boolean) => {
  try {
    const players = await fetchPlayers();
    const index = players.findIndex((p) => p.id === id);
    if (index !== -1) {
      players[index].paid = paid;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      return { status: 'success' };
    }
    return { status: 'error' };
  } catch (error) {
    console.error('Lỗi khi cập nhật thanh toán:', error);
    return { status: 'error' };
  }
};
