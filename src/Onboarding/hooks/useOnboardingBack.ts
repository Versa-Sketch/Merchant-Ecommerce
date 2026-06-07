import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useOnboardingBack(onBack: (() => void) | null) {
  useEffect(() => {
    if (!onBack) return;

    const handleBackPress = () => {
      onBack();
      return true; // Intercept and prevent default go back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      subscription.remove();
    };
  }, [onBack]);
}
