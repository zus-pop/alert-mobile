import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/banner.png')}
          style={styles.banner}
        />
        {/* White Card at the bottom */}
        <View style={styles.whiteCard}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.hiText}>Hi,</Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>

            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#27232399"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#27232399"
                secureTextEntry
              />
            </View>

            {/* Forgot Password link */}
            <TouchableOpacity style={styles.forgotPassword} onPress={() => { }}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInButton} onPress={() => router.replace('/(tabs)/home')}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
const BANNER_HEIGHT = height * 0.35;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#00b4d8',
  },
  container: {
    flex: 1,
    backgroundColor: '#00b4d8',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  }, banner: {
    position: 'absolute',

    top: 50,
    width: 220,
    height: 200,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 40,
  },
  whiteCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: height * 0.55, // Sử dụng minHeight thay vì height cố định
    maxHeight: height * 0.75, // Giới hạn chiều cao tối đa
    backgroundColor: '#fff',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 40,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Thêm padding để đảm bảo nút cuối không bị che
  },
  hiText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#2a2828',
    marginBottom: 4,
  },
  welcomeText: {
    fontFamily: 'Montserrat',
    fontWeight: '800',
    fontSize: 32,
    color: '#1b1818',
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
    color: '#272323',
    opacity: 0.6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F4FD',
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#272323',
  },
  signInButton: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  signInButtonText: {
    fontFamily: 'Montserrat',
    fontWeight: '700',
    fontSize: 14,
    color: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#00b4d8',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00b4d8',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
  },
}); 