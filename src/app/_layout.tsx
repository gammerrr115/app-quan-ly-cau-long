import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#208AEF' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="index" options={{ title: 'Danh sách Đăng ký' }} />
      <Stack.Screen name="add" options={{ title: 'Thêm Người Chơi', presentation: 'modal' }} />
    </Stack>
  );
}
