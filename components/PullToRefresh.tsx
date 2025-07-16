import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, RefreshControl, ScrollView } from 'react-native';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  tintColor?: string;
  className?: string;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  tintColor = "#007AFF",
  className,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await onRefresh();
      
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
          progressBackgroundColor="#ffffff"
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefresh; 