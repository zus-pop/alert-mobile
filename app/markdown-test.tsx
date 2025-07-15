import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import MarkdownTest from '../components/MarkdownTest';

const MarkdownTestPage: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fa" />
      <MarkdownTest />
    </SafeAreaView>
  );
};

export default MarkdownTestPage; 