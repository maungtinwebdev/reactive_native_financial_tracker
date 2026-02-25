import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTransactionStore } from '@/store/transactionStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

type ThemeOption = 'light' | 'dark' | 'system';
type LanguageOption = 'en' | 'mm' | 'jp';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'lightMode', icon: 'sunny' },
    { value: 'dark', label: 'darkMode', icon: 'moon' },
    { value: 'system', label: 'system', icon: 'phone-portrait-outline' },
];

const LANGUAGE_OPTIONS: { value: LanguageOption; label: string; icon: string }[] = [
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'mm', label: 'မြန်မာ', icon: '🇲🇲' },
    { value: 'jp', label: '日本語', icon: '🇯🇵' },
];

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const { user, signOut, isLoading, isGuest, setGuestMode } = useAuthStore();
    const { theme: currentTheme, setTheme } = useThemeStore();
    const { transactions } = useTransactionStore();
    const { t } = useTranslation();

    const handleSignOut = () => {
        Alert.alert(t('profile.signOut'), 'Are you sure you want to sign out?', [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('profile.signOut'),
                style: 'destructive',
                onPress: signOut,
            },
        ]);
    };

    const changeLanguage = (lang: LanguageOption) => {
        i18n.changeLanguage(lang);
    };

    const userEmail = isGuest ? 'Guest User' : (user?.email ?? 'Unknown');
    const userInitial = isGuest ? 'G' : userEmail.charAt(0).toUpperCase();
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })
        : '—';

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Profile Header */}
                    <LinearGradient
                        colors={
                            theme === 'dark'
                                ? ['#1e3a8a', '#1e40af', '#172554']
                                : ['#4c669f', '#3b5998', '#192f6a']
                        }
                        style={styles.profileCard}
                    >
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{userInitial}</Text>
                            </View>
                            <View style={styles.onlineDot} />
                        </View>
                        <Text style={styles.profileEmail}>{userEmail}</Text>
                        {!isGuest && <Text style={styles.memberSince}>Member since {memberSince}</Text>}

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{transactions.length}</Text>
                                <Text style={styles.statLabel}>Transactions</Text>
                            </View>
                            <View style={[styles.statItem, styles.statBorder]}>
                                <Text style={styles.statValue}>
                                    {transactions.filter((t) => t.type === 'income').length}
                                </Text>
                                <Text style={styles.statLabel}>Income</Text>
                            </View>
                            <View style={[styles.statItem, styles.statBorder]}>
                                <Text style={styles.statValue}>
                                    {transactions.filter((t) => t.type === 'expense').length}
                                </Text>
                                <Text style={styles.statLabel}>Expenses</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                            {t('profile.theme')}
                        </Text>
                        <View
                            style={[
                                styles.card,
                                { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="color-palette-outline" size={20} color={Colors[theme].tint} />
                                <Text style={[styles.cardHeaderText, { color: Colors[theme].text }]}>
                                    {t('profile.theme')}
                                </Text>
                            </View>

                            <View style={styles.themeOptions}>
                                {THEME_OPTIONS.map((option) => {
                                    const isSelected = currentTheme === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.themeOption,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme === 'dark'
                                                            ? 'rgba(59,130,246,0.2)'
                                                            : 'rgba(59,89,152,0.1)'
                                                        : Colors[theme].background,
                                                    borderColor: isSelected ? '#3b5998' : Colors[theme].border,
                                                    borderWidth: isSelected ? 2 : 1,
                                                },
                                            ]}
                                            onPress={() => setTheme(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.themeIconCircle,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? '#3b5998'
                                                            : theme === 'dark'
                                                                ? 'rgba(255,255,255,0.08)'
                                                                : 'rgba(0,0,0,0.04)',
                                                    },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={option.icon}
                                                    size={22}
                                                    color={isSelected ? '#fff' : Colors[theme].icon}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.themeOptionLabel,
                                                    {
                                                        color: isSelected ? '#3b5998' : Colors[theme].text,
                                                        fontWeight: isSelected ? '700' : '500',
                                                    },
                                                ]}
                                            >
                                                {t(`profile.${option.label}`)}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.checkBadge}>
                                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Language Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                            {t('profile.language')}
                        </Text>
                        <View
                            style={[
                                styles.card,
                                { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Ionicons name="language-outline" size={20} color={Colors[theme].tint} />
                                <Text style={[styles.cardHeaderText, { color: Colors[theme].text }]}>
                                    {t('profile.selectLanguage')}
                                </Text>
                            </View>

                            <View style={styles.themeOptions}>
                                {LANGUAGE_OPTIONS.map((option) => {
                                    const isSelected = i18n.language === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.themeOption,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme === 'dark'
                                                            ? 'rgba(59,130,246,0.2)'
                                                            : 'rgba(59,89,152,0.1)'
                                                        : Colors[theme].background,
                                                    borderColor: isSelected ? '#3b5998' : Colors[theme].border,
                                                    borderWidth: isSelected ? 2 : 1,
                                                },
                                            ]}
                                            onPress={() => changeLanguage(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.themeIconCircle,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? '#3b5998'
                                                            : theme === 'dark'
                                                                ? 'rgba(255,255,255,0.08)'
                                                                : 'rgba(0,0,0,0.04)',
                                                    },
                                                ]}
                                            >
                                                <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                                            </View>
                                            <Text
                                                style={[
                                                    styles.themeOptionLabel,
                                                    {
                                                        color: isSelected ? '#3b5998' : Colors[theme].text,
                                                        fontWeight: isSelected ? '700' : '500',
                                                    },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.checkBadge}>
                                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Account Section */}
                    {!isGuest && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                                Account
                            </Text>
                            <View
                                style={[
                                    styles.card,
                                    { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border },
                                ]}
                            >
                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="mail-outline" size={20} color={Colors[theme].icon} />
                                        <View>
                                            <Text style={[styles.menuLabel, { color: Colors[theme].text }]}>Email</Text>
                                            <Text style={[styles.menuValue, { color: Colors[theme].icon }]}>{userEmail}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <View style={[styles.menuDivider, { backgroundColor: Colors[theme].border }]} />

                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuLeft}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color={Colors[theme].icon} />
                                        <View>
                                            <Text style={[styles.menuLabel, { color: Colors[theme].text }]}>Account Status</Text>
                                            <Text style={[styles.menuValue, { color: Colors[theme].success }]}>Verified</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors[theme].success} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Sign In / Sign Out Button */}
                    <View style={styles.section}>
                        {isGuest ? (
                            <TouchableOpacity
                                style={[
                                    styles.signOutButton,
                                    { 
                                        backgroundColor: '#3b5998', 
                                        borderColor: '#3b5998',
                                        opacity: 0.5 
                                    },
                                ]}
                                onPress={() => setGuestMode(false)}
                                disabled={true}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="log-in-outline" size={22} color="#fff" />
                                <Text style={[styles.signOutText, { color: '#fff' }]}>
                                    Sign In / Create Account
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.signOutButton,
                                    { backgroundColor: Colors[theme].card, borderColor: Colors[theme].danger },
                                ]}
                                onPress={handleSignOut}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="log-out-outline" size={22} color={Colors[theme].danger} />
                                <Text style={[styles.signOutText, { color: Colors[theme].danger }]}>
                                    Sign Out
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={[styles.versionText, { color: Colors[theme].icon }]}>
                        Financial Tracker v1.0.0
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    profileCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4ade80',
        borderWidth: 3,
        borderColor: '#1e40af',
    },
    profileEmail: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberSince: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.2)',
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    cardHeaderText: {
        fontSize: 15,
        fontWeight: '600',
    },
    themeOptions: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        paddingTop: 4,
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        position: 'relative',
    },
    themeIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    themeOptionLabel: {
        fontSize: 13,
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#3b5998',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuValue: {
        fontSize: 13,
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        marginLeft: 48,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 8,
        marginBottom: 20,
    },
});
