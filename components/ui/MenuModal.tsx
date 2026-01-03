import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Switch, StyleSheet } from "react-native";
import { router } from "expo-router";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Text } from "@/components/ui/Text";
import { useSubscriptionStore } from "@/lib/store/subscription";
import {
    getAppVersion,
    openTerms,
    openPrivacy,
    openSupport,
    getNotificationsEnabled,
    setNotificationsEnabled,
    openManageSubscription
} from "@/lib/utils/settings";
import * as Haptics from "expo-haptics";
import { Crown, RotateCcw, Bell, HelpCircle, FileText, Shield, ChevronRight } from "lucide-react-native";

interface MenuModalProps {
    visible: boolean;
    onClose: () => void;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    highlight?: boolean;
}

function MenuItem({ icon, label, onPress, rightElement, showChevron = true, highlight = false }: MenuItemProps) {
    return (
        <Pressable
            onPress={() => {
                Haptics.selectionAsync();
                onPress?.();
            }}
            className={`flex-row items-center px-5 py-4 ${highlight ? "bg-gold/10" : ""}`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
            <View className="w-10 items-center">
                {icon}
            </View>
            <Text className={`flex-1 text-lg ${highlight ? "text-gold font-sans-semibold" : "text-text-primary"}`}>
                {label}
            </Text>
            {rightElement}
            {showChevron && !rightElement && (
                <ChevronRight size={20} color="#5A5A5A" />
            )}
        </Pressable>
    );
}

function Divider() {
    return <View className="h-px bg-surface mx-5 my-1" />;
}

export function MenuModal({ visible, onClose }: MenuModalProps) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { isProUser, restorePurchases } = useSubscriptionStore();
    const [notificationsEnabled, setNotificationsState] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Snap points - 85% of screen height to leave room at top
    const snapPoints = useMemo(() => ["85%"], []);

    // Load notification preference when sheet opens
    useEffect(() => {
        if (visible) {
            getNotificationsEnabled().then(setNotificationsState);
            bottomSheetRef.current?.expand();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible]);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.7}
            />
        ),
        []
    );

    const handleToggleNotifications = async (value: boolean) => {
        const success = await setNotificationsEnabled(value);
        if (success) {
            setNotificationsState(value);
        }
    };

    const handleRestore = async () => {
        setIsRestoring(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const success = await restorePurchases();
        setIsRestoring(false);

        if (success) {
            onClose();
        }
    };

    const handleUnlockPro = () => {
        onClose();
        router.push("/paywall");
    };

    const handleManageSubscription = () => {
        openManageSubscription();
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={visible ? 0 : -1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.background}
        >
            <BottomSheetScrollView style={styles.contentContainer}>
                {/* Header */}
                <View className="px-5 pt-2 pb-4 border-b border-surface">
                    <Text className="text-xl font-cinzel-bold text-gold tracking-widest text-center">
                        SETTINGS
                    </Text>
                </View>

                {/* Subscription Section */}
                <View className="pt-3">
                    {!isProUser ? (
                        <MenuItem
                            icon={<Crown size={22} color="#C9A962" />}
                            label="Unlock Codex Pro"
                            onPress={handleUnlockPro}
                            highlight
                        />
                    ) : (
                        <MenuItem
                            icon={<Crown size={22} color="#C9A962" />}
                            label="Manage Subscription"
                            onPress={handleManageSubscription}
                        />
                    )}

                    <MenuItem
                        icon={<RotateCcw size={22} color="#A0A0A0" />}
                        label="Restore Purchases"
                        onPress={handleRestore}
                        rightElement={
                            isRestoring ? (
                                <Text className="text-text-muted text-sm">Restoring...</Text>
                            ) : undefined
                        }
                        showChevron={!isRestoring}
                    />
                </View>

                <Divider />

                {/* Settings Section */}
                <View className="pt-1">
                    <MenuItem
                        icon={<Bell size={22} color="#A0A0A0" />}
                        label="Notifications"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: "#3A3A4A", true: "#C9A962" }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#3A3A4A"
                            />
                        }
                    />
                </View>

                <Divider />

                {/* Support Section */}
                <View className="pt-1">
                    <MenuItem
                        icon={<HelpCircle size={22} color="#A0A0A0" />}
                        label="Help & Support"
                        onPress={openSupport}
                    />

                    <MenuItem
                        icon={<FileText size={22} color="#A0A0A0" />}
                        label="Terms of Service"
                        onPress={openTerms}
                    />

                    <MenuItem
                        icon={<Shield size={22} color="#A0A0A0" />}
                        label="Privacy Policy"
                        onPress={openPrivacy}
                    />
                </View>

                {/* Footer */}
                <View className="px-5 py-8 items-center">
                    <Text className="text-text-muted text-sm">
                        Codex Tarot {getAppVersion()}
                    </Text>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    handleIndicator: {
        backgroundColor: "#5A5A5A",
        width: 40,
    },
    background: {
        backgroundColor: "#0A0A0F",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    contentContainer: {
        flex: 1,
    },
});
