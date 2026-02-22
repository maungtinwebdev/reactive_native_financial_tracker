import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const router = useRouter();
    const { signIn, signUp, isLoading } = useAuthStore();

    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (mode === 'signup' && password !== confirmPassword) {
            newErrors.confirm = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        if (mode === 'signin') {
            const result = await signIn(email.trim(), password);
            if (result.error) {
                Alert.alert('Sign In Failed', result.error);
            }
        } else {
            const result = await signUp(email.trim(), password);
            if (result.error) {
                Alert.alert('Sign Up Failed', result.error);
            } else if (result.needsVerification) {
                // Navigate to OTP verification screen
                router.push({ pathname: '/verify', params: { email: email.trim() } });
            }
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setErrors({});
        setConfirmPassword('');
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <LinearGradient
                            colors={theme === 'dark' ? ['#1e3a8a', '#1e40af', '#172554'] : ['#4c669f', '#3b5998', '#192f6a']}
                            style={styles.heroGradient}
                        >
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Ionicons name="wallet" size={40} color="#3b5998" />
                                </View>
                            </View>
                            <Text style={styles.heroTitle}>Financial Tracker</Text>
                            <Text style={styles.heroSubtitle}>
                                {mode === 'signin'
                                    ? 'Welcome back! Sign in to continue.'
                                    : 'Create an account to get started.'}
                            </Text>
                        </LinearGradient>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            {/* Mode Tabs */}
                            <View style={[styles.modeTabs, { backgroundColor: Colors[theme].border }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.modeTab,
                                        mode === 'signin' && { backgroundColor: Colors[theme].card },
                                    ]}
                                    onPress={() => toggleMode()}
                                    disabled={mode === 'signin'}
                                >
                                    <Text
                                        style={[
                                            styles.modeTabText,
                                            { color: mode === 'signin' ? Colors[theme].text : Colors[theme].icon },
                                        ]}
                                    >
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modeTab,
                                        mode === 'signup' && { backgroundColor: Colors[theme].card },
                                    ]}
                                    onPress={() => toggleMode()}
                                    disabled={mode === 'signup'}
                                >
                                    <Text
                                        style={[
                                            styles.modeTabText,
                                            { color: mode === 'signup' ? Colors[theme].text : Colors[theme].icon },
                                        ]}
                                    >
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: Colors[theme].text }]}>Email</Text>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        {
                                            borderColor: errors.email ? Colors[theme].danger : Colors[theme].border,
                                            backgroundColor: Colors[theme].card,
                                        },
                                    ]}
                                >
                                    <Ionicons name="mail-outline" size={20} color={Colors[theme].icon} />
                                    <TextInput
                                        style={[styles.input, { color: Colors[theme].text }]}
                                        placeholder="you@example.com"
                                        placeholderTextColor={Colors[theme].icon}
                                        value={email}
                                        onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                    />
                                </View>
                                {errors.email && (
                                    <Text style={[styles.errorText, { color: Colors[theme].danger }]}>{errors.email}</Text>
                                )}
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: Colors[theme].text }]}>Password</Text>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        {
                                            borderColor: errors.password ? Colors[theme].danger : Colors[theme].border,
                                            backgroundColor: Colors[theme].card,
                                        },
                                    ]}
                                >
                                    <Ionicons name="lock-closed-outline" size={20} color={Colors[theme].icon} />
                                    <TextInput
                                        style={[styles.input, { color: Colors[theme].text }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={Colors[theme].icon}
                                        value={password}
                                        onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={Colors[theme].icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text style={[styles.errorText, { color: Colors[theme].danger }]}>{errors.password}</Text>
                                )}
                            </View>

                            {/* Confirm Password (only for sign up) */}
                            {mode === 'signup' && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: Colors[theme].text }]}>Confirm Password</Text>
                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            {
                                                borderColor: errors.confirm ? Colors[theme].danger : Colors[theme].border,
                                                backgroundColor: Colors[theme].card,
                                            },
                                        ]}
                                    >
                                        <Ionicons name="lock-closed-outline" size={20} color={Colors[theme].icon} />
                                        <TextInput
                                            style={[styles.input, { color: Colors[theme].text }]}
                                            placeholder="••••••••"
                                            placeholderTextColor={Colors[theme].icon}
                                            value={confirmPassword}
                                            onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirm: undefined })); }}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    {errors.confirm && (
                                        <Text style={[styles.errorText, { color: Colors[theme].danger }]}>{errors.confirm}</Text>
                                    )}
                                </View>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#4c669f', '#3b5998', '#192f6a']}
                                    style={styles.submitGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Toggle */}
                            <View style={styles.toggleContainer}>
                                <Text style={[styles.toggleText, { color: Colors[theme].icon }]}>
                                    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                                </Text>
                                <TouchableOpacity onPress={toggleMode}>
                                    <Text style={[styles.toggleLink, { color: '#3b5998' }]}>
                                        {mode === 'signin' ? ' Sign Up' : ' Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    heroGradient: {
        paddingVertical: 48,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    formContainer: {
        padding: 24,
        flex: 1,
    },
    modeTabs: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 28,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    modeTabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 14 : 4,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    submitButton: {
        marginTop: 8,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#3b5998',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    submitText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    toggleText: {
        fontSize: 14,
    },
    toggleLink: {
        fontSize: 14,
        fontWeight: '700',
    },
});
