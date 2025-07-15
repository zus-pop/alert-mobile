import React from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownViewerProps {
  content: string;
  style?: any;
  markdownStyles?: any; // Thêm prop để custom markdown styles
  theme?: 'light' | 'dark' | 'chat-user' | 'chat-ai'; // Thêm theme presets
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ 
  content, 
  style, 
  markdownStyles,
  theme = 'light' 
}) => {
  
  // Default styles
  const defaultMarkdownStyles = StyleSheet.create({
    body: {
      color: '#222',
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 14,
      marginBottom: 6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 12,
      marginBottom: 4,
    },
    heading4: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 10,
      marginBottom: 4,
    },
    heading5: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 8,
      marginBottom: 4,
    },
    heading6: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#2B3A67',
      marginTop: 6,
      marginBottom: 4,
    },
    paragraph: {
      marginBottom: 8,
      color: '#222',
      fontSize: 16,
      lineHeight: 24,
    },
    strong: {
      fontWeight: 'bold',
      color: '#2B3A67',
    },
    em: {
      fontStyle: 'italic',
      color: '#666',
    },
    code_inline: {
      backgroundColor: '#f4f4f4',
      color: '#e74c3c',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#e9ecef',
      borderRadius: 6,
      padding: 12,
      marginVertical: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#495057',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#2B3A67',
      paddingLeft: 12,
      marginVertical: 8,
      backgroundColor: '#f8f9ff',
      paddingVertical: 8,
      paddingRight: 12,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      marginBottom: 4,
      paddingLeft: 4,
    },
    link: {
      color: '#007AFF',
      textDecorationLine: 'underline',
    },
    table: {
      borderWidth: 1,
      borderColor: '#dee2e6',
      borderRadius: 6,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: '#f8f9fa',
    },
    th: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      fontWeight: 'bold',
      color: '#2B3A67',
    },
    td: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      color: '#222',
    },
    hr: {
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      marginVertical: 16,
    },
  });

  // Chat-specific themes
  const getChatThemeStyles = (themeType: string) => {
    const isUserMessage = themeType === 'chat-user';
    
    return StyleSheet.create({
      body: {
        color: isUserMessage ? '#fff' : '#222',
        fontSize: 16,
        lineHeight: 20,
        margin: 0,
      },
      paragraph: {
        marginBottom: 4,
        marginTop: 0,
        color: isUserMessage ? '#fff' : '#222',
        fontSize: 16,
        lineHeight: 20,
      },
      strong: {
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
      },
      em: {
        fontStyle: 'italic',
        color: isUserMessage ? '#ffffff80' : '#666',
      },
      code_inline: {
        backgroundColor: isUserMessage ? 'rgba(255,255,255,0.2)' : '#f4f4f4',
        color: isUserMessage ? '#fff' : '#e74c3c',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
        fontFamily: 'monospace',
      },
      code_block: {
        backgroundColor: isUserMessage ? 'rgba(255,255,255,0.1)' : '#f8f9fa',
        borderWidth: 1,
        borderColor: isUserMessage ? 'rgba(255,255,255,0.2)' : '#e9ecef',
        borderRadius: 6,
        padding: 8,
        marginVertical: 4,
        fontFamily: 'monospace',
        fontSize: 14,
        color: isUserMessage ? '#fff' : '#495057',
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: isUserMessage ? '#ffffff60' : '#2B3A67',
        paddingLeft: 8,
        marginVertical: 4,
        backgroundColor: isUserMessage ? 'rgba(255,255,255,0.1)' : '#f8f9ff',
        paddingVertical: 4,
        paddingRight: 8,
      },
      bullet_list: {
        marginVertical: 2,
        paddingLeft: 0,
      },
      ordered_list: {
        marginVertical: 2,
        paddingLeft: 0,
      },
      list_item: {
        marginBottom: 2,
        paddingLeft: 0,
        color: isUserMessage ? '#fff' : '#222',
      },
      link: {
        color: isUserMessage ? '#87CEEB' : '#007AFF',
        textDecorationLine: 'underline',
      },
      heading1: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 8,
        marginBottom: 4,
      },
      heading2: {
        fontSize: 17,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 6,
        marginBottom: 3,
      },
      heading3: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 4,
        marginBottom: 2,
      },
      heading4: {
        fontSize: 15,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 3,
        marginBottom: 2,
      },
      heading5: {
        fontSize: 14,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 2,
        marginBottom: 2,
      },
      heading6: {
        fontSize: 13,
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        marginTop: 2,
        marginBottom: 2,
      },
      table: {
        borderWidth: 1,
        borderColor: isUserMessage ? '#ffffff40' : '#dee2e6',
        borderRadius: 6,
        marginVertical: 4,
      },
      thead: {
        backgroundColor: isUserMessage ? 'rgba(255,255,255,0.1)' : '#f8f9fa',
      },
      th: {
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: isUserMessage ? '#ffffff40' : '#dee2e6',
        fontWeight: 'bold',
        color: isUserMessage ? '#fff' : '#2B3A67',
        fontSize: 14,
      },
      td: {
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: isUserMessage ? '#ffffff40' : '#dee2e6',
        color: isUserMessage ? '#fff' : '#222',
        fontSize: 14,
      },
      hr: {
        borderBottomWidth: 1,
        borderBottomColor: isUserMessage ? '#ffffff40' : '#dee2e6',
        marginVertical: 8,
      },
    });
  };

  // Determine which styles to use
  const getMarkdownStyles = () => {
    if (markdownStyles) {
      return markdownStyles; // Custom styles override everything
    }
    
    if (theme === 'chat-user' || theme === 'chat-ai') {
      return getChatThemeStyles(theme);
    }
    
    return defaultMarkdownStyles; // Default fallback
  };

  return (
    <View style={[styles.container, style]}>
      <Markdown style={getMarkdownStyles()}>
        {content}
      </Markdown>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MarkdownViewer; 