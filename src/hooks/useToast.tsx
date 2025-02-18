import {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {Animated, Dimensions, StyleSheet, Text} from 'react-native';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';
import {type ITheme} from '@/types';

interface ToastProps {
  marginBottom: number;
}
const screenWidth = Dimensions.get('window').width;
const toastWidth = screenWidth - 36;

export default function useToast({marginBottom}: ToastProps) {
  const {theme} = useThemeStore();
  const compareTheme: boolean = useMemo(() => {
    if (theme.THEME_NUMBER === 1 || theme.THEME_NUMBER === 3) return true;
    return false;
  }, [theme]);

  const styles = useMemo(
    () => createStyles(theme, compareTheme),
    [theme, compareTheme],
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  function showToast(text: string) {
    setToastMessage(text);
    setIsToastVisible(true);
  }

  useEffect(() => {
    if (isToastVisible) {
      setIsToastVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const fadeOutTimer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setIsToastVisible(false);
        });
      }, 1200);

      return () => clearTimeout(fadeOutTimer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [isToastVisible, fadeAnim, setIsToastVisible]);

  const renderToast = useCallback(() => {
    return (
      isToastVisible && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              bottom: marginBottom,
              left: (screenWidth - toastWidth) / 2,
            },
          ]}>
          <Text style={styles.text}>{toastMessage}</Text>
        </Animated.View>
      )
    );
  }, [isToastVisible, toastMessage]);

  return {renderToast, showToast};
}

const createStyles = (theme: ITheme, compareTheme: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: compareTheme ? theme.TEXT700 : theme.TEXT200,
      position: 'absolute',
      width: toastWidth,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 4,
      zIndex: 9999,
    },
    text: {
      color: compareTheme ? theme.BACKGROUND : theme.TEXT900,
      ...FONTS.BODY1_MEDIUM,
    },
  });
