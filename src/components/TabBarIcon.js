import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TabBarIcon = ({ name, focused, color, size }) => {
  const getIconName = () => {
    switch (name) {
      case 'home':
        return focused ? 'home' : 'home-outline';
      case 'camera':
        return focused ? 'camera' : 'camera-outline';
      case 'crown':
        return focused ? 'crown' : 'crown-outline';
      case 'account':
        return focused ? 'account' : 'account-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Icon 
      name={getIconName()} 
      size={size} 
      color={color}
    />
  );
};

export default TabBarIcon;

