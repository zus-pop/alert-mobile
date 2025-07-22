import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, StatusBar, Animated, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import myAxios from '@/utils/my-axios';
import MarkdownViewer from '../../components/MarkdownViewer';
import * as Haptics from 'expo-haptics';

const BOT_AVATAR = require('../../assets/images/adaptive-icon.png');
const USER_AVATAR = require('../../assets/images/avatar.png');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  read?: boolean;
}

// Typing Indicator Component với animation đẹp
const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        animateDot(dot1, 0),
        animateDot(dot2, 200),
        animateDot(dot3, 400),
      ]).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>AI đang soạn tin</Text>
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.typingDot,
              {
                opacity: dot,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Suggestion messages
const SUGGESTIONS = [
  "Điểm số của tôi như thế nào?",
  "Tôi có khóa học nào sắp đến hạn?",
  "Lịch học tuần này của tôi",
  "Bài tập nào cần nộp?",
  "Thông tin về khóa học mới nhất",
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Check if send button should be disabled
  const isSendDisabled = input.trim().length === 0;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Hide suggestions after first message
    setShowSuggestions(false);
    
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    
    // Add user message and clear input immediately for better UX
    setMessages((prev) => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    
    // Add typing indicator
    const typingIndicator: Message = {
      id: 'typing-indicator',
      text: '...',
      sender: 'ai',
      time: '',
    };
    setMessages((prev) => [...prev, typingIndicator]);
    
    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const res = await myAxios.post(`${API_URL}/ai/chat`, { 
        question: currentInput 
      });
      
      let aiText = 'Xin lỗi, tôi không hiểu.';
      if (res.data && typeof res.data === 'object' && typeof res.data.answer === 'string') {
        aiText = res.data.answer;
      }
      
      // Remove typing indicator and add AI response
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing-indicator');
        const aiMessage: Message = {
          id: Date.now().toString() + '_ai',
          text: aiText,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [...withoutTyping, aiMessage];
      });
      
    } catch (error) {
      console.log('AI API error:', error);
      
      // Remove typing indicator and add error message
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing-indicator');
        const errorMessage: Message = {
          id: Date.now().toString() + '_err',
          text: 'Có lỗi xảy ra, vui lòng thử lại.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [...withoutTyping, errorMessage];
      });
    }
    
    // Auto scroll after response
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const handleSuggestionPress = (suggestion: string) => {
    // Add haptic feedback for iOS
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    
    setInput(suggestion);
    setShowSuggestions(false);
    
    // Auto send after a short delay for better UX
    setTimeout(() => {
      handleSendWithText(suggestion);
    }, 100);
  };

  const handleSendWithText = async (text: string) => {
    if (!text.trim()) return;
    
    const now = new Date();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    
    // Add typing indicator
    const typingIndicator: Message = {
      id: 'typing-indicator',
      text: '...',
      sender: 'ai',
      time: '',
    };
    setMessages((prev) => [...prev, typingIndicator]);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const res = await myAxios.post(`${API_URL}/ai/chat`, { 
        question: text 
      });
      
      let aiText = 'Xin lỗi, tôi không hiểu.';
      if (res.data && typeof res.data === 'object' && typeof res.data.answer === 'string') {
        aiText = res.data.answer;
      }
      
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing-indicator');
        const aiMessage: Message = {
          id: Date.now().toString() + '_ai',
          text: aiText,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [...withoutTyping, aiMessage];
      });
      
    } catch (error) {
      console.log('AI API error:', error);
      
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing-indicator');
        const errorMessage: Message = {
          id: Date.now().toString() + '_err',
          text: 'Có lỗi xảy ra, vui lòng thử lại.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return [...withoutTyping, errorMessage];
      });
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.sender === 'user';
    let userAvatarSource = user?.image ? { uri: user.image } : USER_AVATAR;
    
    // Check if this is typing indicator
    const isTyping = item.id === 'typing-indicator';
    
    return (
      <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
        {!isUser && <Image source={BOT_AVATAR} style={styles.avatar} />}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>  
          {/* Render typing indicator, markdown for AI messages, or plain text for user messages */}
          {isTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            <Text style={[styles.messageText, { color: '#fff' }]}>
              {String(item.text)}
            </Text>
          ) : (
            <MarkdownViewer 
              content={String(item.text)} 
              theme="chat-ai"
            />
          )}
          
          {/* Don't show time for typing indicator */}
          {!isTyping && (
            <View style={styles.metaRow}>
              <Text style={[styles.time, isUser && { color: '#ffffff80' }]}>{item.time}</Text>
              {isUser && (
                <MaterialIcons name="done-all" size={16} color="#4fc3f7" style={{ marginLeft: 4 }} />
              )}
            </View>
          )}
        </View>
        {isUser && <Image source={userAvatarSource} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B3A67" hidden={true} />
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}> 
          <Image source={BOT_AVATAR} style={styles.headerAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Happy Bot</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/home')}>
            <MaterialIcons name="remove" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Chat Messages and Input Area */}
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: Platform.OS === 'android' ? 20 : 0 }
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        
        {/* Message Suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Gợi ý câu hỏi:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollView}
            >
              {SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(suggestion)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Input Area với SafeAreaView để handle bottom safe area */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message here..."
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline={false}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                isSendDisabled && styles.sendBtnDisabled
              ]} 
              onPress={handleSend}
              disabled={isSendDisabled}
              activeOpacity={isSendDisabled ? 1 : 0.7}
            >
              <MaterialIcons 
                name="send" 
                size={22} 
                color={isSendDisabled ? '#999' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f8fa' 
  },
  headerSafeArea: {
    backgroundColor: '#2B3A67',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2B3A67',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  chatContainer: {
    flex: 1,
  },
  messagesList: { 
    padding: 16,
    flexGrow: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    lineHeight: 20,
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
  // Suggestions Styles
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  suggestionsScrollView: {
    paddingRight: 16,
  },
  suggestionButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    color: '#2B3A67',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'center',
  },
  sendBtn: {
    backgroundColor: '#2B3A67',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1 }], // Ready for future animations
  },
  sendBtnDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  // Typing Indicator Styles
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  typingText: {
    color: '#888',
    fontSize: 14,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 2,
  },
}); 