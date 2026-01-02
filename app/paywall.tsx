import { View, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
// import { Button } from "@/components/ui/Button"; // Unused import
import { useSubscriptionStore } from "@/lib/store/subscription";
import { StarField } from "@/components/tarot/StarField";

export default function PaywallScreen() {
  const {
    isInitialized,
    offerings,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    initialize,
  } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, []);

  const handlePurchase = async (identifier: string) => {
    const pkg = offerings?.availablePackages.find(
      (p) => p.identifier === identifier
    );
    if (pkg) {
      const success = await purchasePackage(pkg);
      if (success) {
        router.back();
      }
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      router.back();
    }
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-nebula items-center justify-center">
        <ActivityIndicator color="#C9A962" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-nebula">
      <StarField starCount={30} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-8">
          {/* Close button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 right-4 z-10 p-2"
          >
            <Text className="text-text-secondary text-2xl">×</Text>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} className="items-center mt-8">
            <Text variant="heading" className="text-center">
              Unlock Full Readings
            </Text>
            <Text variant="oracleItalic" className="text-text-secondary text-center mt-3">
              Access 3-card and 5-card spreads
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mt-10">
            {[
              "Unlimited 3-card readings",
              "Unlimited 5-card readings",
              "Deeper synthesis interpretations",
              "Extended oracle messages",
            ].map((feature, i) => (
              <View key={i} className="flex-row items-center gap-3 mb-4">
                <Text className="text-gold">✦</Text>
                <Text variant="body" className="text-text-primary">
                  {feature}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Packages */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-8 gap-3">
            {offerings?.availablePackages.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => handlePurchase(pkg.identifier)}
                disabled={isLoading}
                className="bg-surface border border-gold-dim rounded-2xl p-4"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text variant="body" className="text-text-primary font-sans-medium">
                      {pkg.product.title}
                    </Text>
                    <Text variant="caption" className="mt-1">
                      {pkg.product.description}
                    </Text>
                  </View>
                  <Text variant="subheading">
                    {pkg.product.priceString}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>

          {/* Error */}
          {error && (
            <Text variant="caption" className="text-error text-center mt-4">
              {error}
            </Text>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Restore */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mb-6">
            <Pressable onPress={handleRestore} disabled={isLoading}>
              <Text variant="caption" className="text-center text-text-secondary">
                Already purchased? Restore purchases
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
