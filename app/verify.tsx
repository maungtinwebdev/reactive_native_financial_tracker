import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const router = useRouter();
    const params = useLocalSearchParams<{ email: string }>();
    const { verifyOtp, resendOtp, isLoading, pendingEmail } = useAuthStore();

    const email = params.email || pendingEmail || '';

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnims = useRef(Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1))).current;
    const envelopeAnim = useRef(new Animated.Value(0)).current;

    // Envelope float animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(envelopeAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(envelopeAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [envelopeAnim]);

    const envelopeTranslateY = envelopeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8],
    });

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true);
            return;
        }

        const interval = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [resendTimer]);

    // Auto-focus first input on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    const triggerShake = useCallback(() => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    }, [shakeAnim]);

    const animateCell = (index: number) => {
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 1.15,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleOtpChange = (value: string, index: number) => {
        // Only accept digits
        const digit = value.replace(/[^0-9]/g, '');
        if (digit.length > 1) {
            // Handle paste - distribute digits across cells
            const digits = digit.split('');
            const newOtp = [...otp];
            digits.forEach((d, i) => {
                if (index + i < OTP_LENGTH) {
                    newOtp[index + i] = d;
                    animateCell(index + i);
                }
            });
            setOtp(newOtp);
            setVerifyError(null);

            const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
            inputRefs.current[nextIndex]?.focus();
            setFocusedIndex(nextIndex);

            // Auto-submit if all cells filled
            if (newOtp.every((d) => d !== '')) {
                handleVerify(newOtp.join(''));
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setVerifyError(null);

        if (digit) {
            animateCell(index);
            // Move to next input
            if (index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
                setFocusedIndex(index + 1);
            }
        }

        // Auto-submit if all cells filled
        if (newOtp.every((d) => d !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                // Move back if current cell is empty
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
                setFocusedIndex(index - 1);
            } else {
                // Clear current cell
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
            setVerifyError(null);
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');

        if (otpCode.length !== OTP_LENGTH) {
            setVerifyError('Please enter the complete 6-digit code');
            triggerShake();
            return;
        }

        const result = await verifyOtp(email, otpCode);

        if (result.error) {
            setVerifyError(result.error);
            triggerShake();
            // Clear inputs on error
            setOtp(Array(OTP_LENGTH).fill(''));
            setTimeout(() => {
                inputRefs.current[0]?.focus();
                setFocusedIndex(0);
            }, 300);
        }
        // On success, the auth store updates the session and AuthGate handles navigation
    };

    const handleResend = async () => {
        if (!canResend) return;

        setCanResend(false);
        setResendTimer(RESEND_COOLDOWN);
        setVerifyError(null);

        const result = await resendOtp(email);

        if (result.error) {
            Alert.alert('Resend Failed', result.error);
            setCanResend(true);
        } else {
            Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c)
        : '';

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        {/* Animated Envelope Icon */}
                        <Animated.View style={[styles.iconContainer, { transform: [{ translateY: envelopeTranslateY }] }]}>
                            <LinearGradient
                                colors={theme === 'dark' ? ['#1e3a8a', '#1e40af'] : ['#4c669f', '#3b5998']}
                                style={styles.iconCircle}
                            >
                                <Ionicons name="mail-open" size={44} color="#fff" />
                            </LinearGradient>
                        </Animated.View>

                        {/* Title */}
                        <Text style={[styles.title, { color: Colors[theme].text }]}>
                            Verify Your Email
                        </Text>
                        <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>
                            We've sent a 6-digit verification code to
                        </Text>
                        <Text style={[styles.emailText, { color: Colors[theme].text }]}>
                            {maskedEmail}
                        </Text>

                        {/* OTP Input */}
                        <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
                            {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                                const isFocused = focusedIndex === index;
                                const isFilled = otp[index] !== '';

                                return (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            styles.otpCell,
                                            {
                                                borderColor: verifyError
                                                    ? Colors[theme].danger
                                                    : isFocused
                                                        ? '#3b5998'
                                                        : isFilled
                                                            ? Colors[theme].success
                                                            : Colors[theme].border,
                                                backgroundColor: isFilled
                                                    ? theme === 'dark'
                                                        ? 'rgba(59,130,246,0.1)'
                                                        : 'rgba(59,89,152,0.05)'
                                                    : Colors[theme].card,
                                                transform: [{ scale: scaleAnims[index] }],
                                            },
                                        ]}
                                    >
                                        <TextInput
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={[
                                                styles.otpInput,
                                                {
                                                    color: verifyError ? Colors[theme].danger : Colors[theme].text,
                                                },
                                            ]}
                                            value={otp[index]}
                                            onChangeText={(value) => handleOtpChange(value, index)}
                                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                            onFocus={() => setFocusedIndex(index)}
                                            keyboardType="number-pad"
                                            maxLength={OTP_LENGTH} // Allow paste
                                            selectTextOnFocus
                                            caretHidden
                                        />
                                        {isFocused && !isFilled && (
                                            <View style={[styles.cursor, { backgroundColor: '#3b5998' }]} />
                                        )}
                                    </Animated.View>
                                );
                            })}
                        </Animated.View>

                        {/* Error Message */}
                        {verifyError && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={16} color={Colors[theme].danger} />
                                <Text style={[styles.errorText, { color: Colors[theme].danger }]}>
                                    {verifyError}
                                </Text>
                            </View>
                        )}

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[styles.verifyButton, isLoading && { opacity: 0.6 }]}
                            onPress={() => handleVerify()}
                            disabled={isLoading || otp.some((d) => d === '')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={
                                    otp.every((d) => d !== '')
                                        ? ['#4c669f', '#3b5998', '#192f6a']
                                        : [Colors[theme].border, Colors[theme].border]
                                }
                                style={styles.verifyGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.verifyContent}>
                                        <Ionicons name="shield-checkmark" size={20} color={otp.every((d) => d !== '') ? '#fff' : Colors[theme].icon} />
                                        <Text
                                            style={[
                                                styles.verifyText,
                                                { color: otp.every((d) => d !== '') ? '#fff' : Colors[theme].icon },
                                            ]}
                                        >
                                            Verify & Continue
                                        </Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Resend Section */}
                        <View style={styles.resendContainer}>
                            <Text style={[styles.resendLabel, { color: Colors[theme].icon }]}>
                                Didn't receive the code?
                            </Text>
                            {canResend ? (
                                <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                    <Text style={styles.resendLink}>Resend Code</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.timerRow}>
                                    <Ionicons name="time-outline" size={14} color={Colors[theme].icon} />
                                    <Text style={[styles.timerText, { color: Colors[theme].icon }]}>
                                        Resend in {resendTimer}s
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Help Text */}
                        <View style={[styles.helpCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
                            <Ionicons name="information-circle-outline" size={18} color={Colors[theme].tint} />
                            <Text style={[styles.helpText, { color: Colors[theme].icon }]}>
                                Check your inbox and spam folder. The code expires in 10 minutes.
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 16,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3b5998',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    emailText: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 4,
        marginBottom: 32,
    },
    otpContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    otpCell: {
        width: 48,
        height: 56,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    otpInput: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    cursor: {
        width: 2,
        height: 24,
        borderRadius: 1,
        opacity: 0.6,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
    },
    verifyButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#3b5998',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    verifyGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    verifyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verifyText: {
        fontSize: 17,
        fontWeight: '700',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    resendLabel: {
        fontSize: 14,
        marginBottom: 6,
    },
    resendLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#3b5998',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
    },
    helpText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
});
