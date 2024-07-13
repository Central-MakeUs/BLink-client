import {Button, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeStore} from '@/store/useThemeStore';
import ThemeBackground from '@/components/common/ThemeBackground';

const ThemeSetting = () => {
  const {theme, setTheme, asyncSetTheme} = useThemeStore();
  const navigation = useNavigation();

  // 뒤로가기 버튼 클릭
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSetTheme = (themeNumber: number) => {
    setTheme(themeNumber);
    void asyncSetTheme(themeNumber);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemeBackground />
      <View style={styles.content}>
        <Button title="Theme 1" onPress={() => handleSetTheme(1)} />
        <Button title="Theme 2" onPress={() => handleSetTheme(2)} />
        <Button title="Theme 3" onPress={() => handleSetTheme(3)} />
        <Button title="Theme 4" onPress={() => handleSetTheme(4)} />
        <Text style={[styles.text, {color: theme.TEXT_COLOR}]}>
          현재 테마 메인 색: {theme.MAIN_COLOR}
        </Text>
      </View>
      <Button title="뒤로가기" onPress={handleGoBack} />
    </SafeAreaView>
  );
};

export default ThemeSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    marginTop: 20,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});