import React, {useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {type RootStackNavigationProp} from '@/types/navigation';
import ThemeBackground from '@/components/common/ThemeBackground';
import LogoHeader from '@/components/common/LogoHeader';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';
import NavigationInfo from '@/components/mypage/NavigationInfo';
import {type ITheme} from '@/types';

const MyPage = () => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();

  const navigation = useNavigation<RootStackNavigationProp>();

  const handleThemeSetting = () => navigation.navigate('ThemeSetting');
  const handleSetting = () => navigation.navigate('Setting');
  const handleSupport = () => navigation.navigate('Support');
  const handleLogin = () => navigation.navigate('Onboarding');

  return (
    <SafeAreaView style={styles.container}>
      <ThemeBackground />
      <LogoHeader />
      <ScrollView>
        <View style={styles.contentContainer}>
          <View style={styles.headerText}>
            <Text style={styles.titleText}>{t('계정')}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.accountManageText}>
              {t('로그인하고 링크를 저장해보세요.')}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogin}>
            <View style={styles.staticInfoContainer}>
              <Text style={styles.loginText}>{t('로그인 / 회원가입')}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.navigationContainer}>
            <NavigationInfo
              title={t('테마')}
              themeColor={theme.TEXT800}
              onPress={handleThemeSetting}
            />
            <NavigationInfo
              title={t('환경 설정')}
              themeColor={theme.TEXT800}
              onPress={handleSetting}
            />
            <NavigationInfo
              title={t('지원')}
              themeColor={theme.TEXT800}
              onPress={handleSupport}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPage;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loginText: {
      ...FONTS.BODY1_SEMIBOLD,
      color: theme.BACKGROUND,
    },
    contentContainer: {
      paddingHorizontal: 18,
    },
    headerText: {
      paddingVertical: 14,
    },
    titleText: {
      color: theme.TEXT900,
      ...FONTS.TITLE,
    },
    userInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 2,
    },
    emailText: {
      color: theme.MAIN500,
      ...FONTS.BODY2_MEDIUM,
    },
    accountManageText: {
      color: theme.TEXT500,
      ...FONTS.BODY2_MEDIUM,
    },
    staticInfoContainer: {
      marginVertical: 30,
      paddingVertical: 14,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.MAIN400,
    },
    divider: {
      borderBottomWidth: 1,
      marginHorizontal: -18,
      borderBottomColor: theme.TEXT200,
    },
    navigationContainer: {
      paddingVertical: 12,
    },
  });
