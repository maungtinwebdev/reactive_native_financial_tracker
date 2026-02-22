import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '@/hooks/useSync';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { format } from 'date-fns';

export function SyncButton() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const { syncStatus, syncResult, lastSyncedAt, isSyncing, sync, dismissResult } =
        useSync();

    const spinAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Spin animation while syncing
    useEffect(() => {
        if (isSyncing) {
            const loop = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            loop.start();
            return () => loop.stop();
        } else {
            spinAnim.setValue(0);
        }
    }, [isSyncing, spinAnim]);

    // Pop animation on status change
    useEffect(() => {
        if (syncResult) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

            // Fade in the result toast
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-dismiss after 4 seconds
            const timeout = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => dismissResult());
            }, 4000);

            return () => clearTimeout(timeout);
        }
    }, [syncResult, scaleAnim, fadeAnim, dismissResult]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleSync = () => {
        Alert.alert(
            'Sync to Cloud',
            'This will upload all your local transactions to Supabase. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sync Now', onPress: sync },
            ]
        );
    };

    const getStatusColor = () => {
        switch (syncStatus) {
            case 'syncing':
                return '#3b82f6';
            case 'success':
                return Colors[theme].success;
            case 'error':
                return Colors[theme].danger;
            default:
                return theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
        }
    };

    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        switch (syncStatus) {
            case 'syncing':
                return 'sync';
            case 'success':
                return 'cloud-done';
            case 'error':
                return 'cloud-offline';
            default:
                return 'cloud-upload-outline';
        }
    };

    const getIconColor = () => {
        switch (syncStatus) {
            case 'syncing':
                return '#fff';
            case 'success':
                return '#fff';
            case 'error':
                return '#fff';
            default:
                return Colors[theme].text;
        }
    };

    return (
        <View>
            {/* Sync Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    onPress={handleSync}
                    disabled={isSyncing}
                    activeOpacity={0.7}
                    style={[
                        styles.button,
                        {
                            backgroundColor: getStatusColor(),
                            borderColor:
                                syncStatus === 'idle'
                                    ? Colors[theme].border
                                    : 'transparent',
                            borderWidth: syncStatus === 'idle' ? 1 : 0,
                        },
                    ]}
                >
                    <Animated.View
                        style={
                            isSyncing ? { transform: [{ rotate: spin }] } : undefined
                        }
                    >
                        <Ionicons
                            name={getIconName()}
                            size={18}
                            color={getIconColor()}
                        />
                    </Animated.View>

                    {!isSyncing && (
                        <Text
                            style={[
                                styles.buttonText,
                                {
                                    color:
                                        syncStatus === 'idle'
                                            ? Colors[theme].text
                                            : '#fff',
                                },
                            ]}
                        >
                            {syncStatus === 'success'
                                ? 'Synced!'
                                : syncStatus === 'error'
                                    ? 'Retry'
                                    : 'Sync'}
                        </Text>
                    )}

                    {isSyncing && (
                        <Text style={[styles.buttonText, { color: '#fff' }]}>
                            Syncing...
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* Toast notification */}
            {syncResult && (
                <Animated.View
                    style={[
                        styles.toast,
                        {
                            opacity: fadeAnim,
                            backgroundColor:
                                syncResult.status === 'success'
                                    ? Colors[theme].success
                                    : Colors[theme].danger,
                        },
                    ]}
                >
                    <Ionicons
                        name={
                            syncResult.status === 'success'
                                ? 'checkmark-circle'
                                : 'alert-circle'
                        }
                        size={16}
                        color="#fff"
                    />
                    <Text style={styles.toastText} numberOfLines={2}>
                        {syncResult.message}
                    </Text>
                </Animated.View>
            )}

            {/* Last synced label */}
            {lastSyncedAt && syncStatus === 'idle' && (
                <Text style={[styles.lastSynced, { color: Colors[theme].icon }]}>
                    Last synced: {format(new Date(lastSyncedAt), 'MMM d, h:mm a')}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        minWidth: 90,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    toast: {
        position: 'absolute',
        top: 44,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        minWidth: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 999,
    },
    toastText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    lastSynced: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
    },
});
