import React, { useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const BOT_AVATAR = require('../../assets/images/adaptive-icon.png');
const USER_AVATAR = require('../../assets/images/avatar.png'); // Có thể thay bằng avatar user nếu có

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  read?: boolean;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/ai/chat`,
        { question: input },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
        }
      );
      console.log('AI API response:', res.data);
      let aiText = 'Xin lỗi, tôi không hiểu.';
      if (res.data && typeof res.data === 'object' && typeof res.data.answer === 'string') {
        aiText = res.data.answer;
      }
      console.log('AI API response:', res.data, 'Parsed text:', aiText, 'Type:', typeof aiText);
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        text: aiText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log('AI API error:', e, e.response?.data);
      } else {
        console.log('AI API error:', e);
      }
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '_err',
        text: 'Có lỗi xảy ra, vui lòng thử lại.',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.sender === 'user';
    let userAvatarSource = user?.image ? { uri: user.image } : USER_AVATAR;
    return (
      <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
        {!isUser && <Image source={BOT_AVATAR} style={styles.avatar} />}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>  
          <Text style={[styles.messageText, isUser && { color: '#fff' }]}>{String(item.text)}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.time}>{item.time}</Text>
            {isUser && (
              <MaterialIcons name="done-all" size={16} color="#4fc3f7" style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
        {isUser && <Image source={userAvatarSource} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: '#2B3A67' }} />
      {/* Header */}
      <View style={styles.header}> 
        <Image source={BOT_AVATAR} style={styles.headerAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Happy Bot</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <MaterialIcons name="remove" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message here..."
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <MaterialIcons name="send" size={22} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#2B3A67',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  messagesList: { padding: 16, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  rowStart: { justifyContent: 'flex-start' },
  rowEnd: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    backgroundColor: '#eee',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    minWidth: 60,
  },
  userBubble: {
    backgroundColor: '#2B3A67',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    color: '#222',
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendBtn: {
    backgroundColor: '#2B3A67',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 