import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="items-center space-y-4 p-8">
        <Text className="text-4xl font-bold text-gray-800">
          Welcome to Codex
        </Text>
        <Text className="text-lg text-gray-600 text-center">
          Your Expo project is now properly configured!
        </Text>

        <View className="mt-8 space-y-3 w-full">
          <View className="bg-green-50 p-4 rounded-lg">
            <Text className="text-green-800 font-semibold">Expo Router</Text>
            <Text className="text-green-600 text-sm">File-based routing configured</Text>
          </View>

          <View className="bg-blue-50 p-4 rounded-lg">
            <Text className="text-blue-800 font-semibold">NativeWind</Text>
            <Text className="text-blue-600 text-sm">Tailwind CSS styling working</Text>
          </View>

          <View className="bg-purple-50 p-4 rounded-lg">
            <Text className="text-purple-800 font-semibold">Supabase Ready</Text>
            <Text className="text-purple-600 text-sm">Backend configured</Text>
          </View>
        </View>

        <Pressable
          onPress={handlePress}
          className="mt-8 bg-orange-500 px-8 py-4 rounded-full active:bg-orange-600"
        >
          <Text className="text-white font-bold text-lg">
            Get Started
          </Text>
        </Pressable>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
