import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://dbrdmhmkfpozoulmynux.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicmRtaG1rZnBvem91bG15bnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzk4NjgsImV4cCI6MjA4Mjk1NTg2OH0.xExKgK8Chd506JUt7yURvOFMtN2NK5CgUDVXvxyoZJ8";

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
    getItem: async (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
