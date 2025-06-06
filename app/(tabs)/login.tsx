import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
  source={require('@/assets/images/banner.png')}
  style={styles.banner}
/>
      {/* White Card at the bottom */}
      <View style={styles.whiteCard}>
        <View style={styles.content}>
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
          <TouchableOpacity style={styles.forgotPassword} onPress={() => {/* Xử lý điều hướng quên mật khẩu ở đây */}}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const BANNER_HEIGHT = height * 0.3;
const CARD_HEIGHT = height * 0.6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00b4d8',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },banner: {    position: 'absolute',   

    top:50,
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
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 24,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
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
    marginBottom: 32,
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