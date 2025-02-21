import React, {useEffect, useState, useMemo} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useThemeStore} from '@/store/useThemeStore';
import ThemeBackground from '@/components/common/ThemeBackground';
import BackHeader from '@/components/common/BackHeader';
import {FONTS} from '@/constants';
import ThemeCard from '@/components/mypage/ThemeCard';
import {type ITheme} from '@/types';
import {trackEvent} from '@/utils/amplitude-utils';
import {THEME_INFOS} from '@/constants/theme';

const ThemeSetting = () => {
  const {theme, setTheme, asyncSetTheme, getSavedTheme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();

  const [selectedThemeId, setSelectedThemeId] = useState<number>(1);

  useEffect(() => {
    const fetchTheme = async () => {
      const savedThemeId = await getSavedTheme();
      if (savedThemeId === null) return;
      setSelectedThemeId(savedThemeId);
    };
    fetchTheme();
  }, [getSavedTheme]);

  const handleSetTheme = (themeId: number) => {
    const themeName = THEME_INFOS.find(theme => theme.id === themeId)?.name;

    const previousThemeName = THEME_INFOS.find(
      theme => theme.id === selectedThemeId,
    )?.name;

    setSelectedThemeId(themeId);
    setTheme(themeId);
    void asyncSetTheme(themeId);

    trackEvent('Apply_Theme', {
      newTheme: themeName,
      previousTheme: previousThemeName,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemeBackground />
      <BackHeader title={t('테마')} themeColor={theme.TEXT900} />
      <View style={styles.contentContainer}>
        {/* 한국어 영어 둘다 영어처리 */}
        <Text style={styles.templateText}>3 Themes</Text>
      </View>
      <FlatList
        data={THEME_INFOS}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={({item}) => (
          <ThemeCard
            id={item.id}
            name={item.name}
            price={item.price}
            mainColor={item.color}
            onSelect={() => handleSetTheme(item.id)}
            selected={item.id === selectedThemeId}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};

export default ThemeSetting;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 18,
    },
    contentContainerStyle: {
      paddingHorizontal: 12,
      paddingVertical: 16,
      gap: 20,
    },
    templateText: {
      color: theme.MAIN500,
      ...FONTS.BODY2_MEDIUM,
    },
  });
