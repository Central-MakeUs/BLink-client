import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import DropdownFilter from '@/components/home/DropDownFilter';
import {useThemeStore} from '@/store/useThemeStore';
import {type ITheme} from '@/types';
import {FONTS} from '@/constants';

interface ListHeaderComponentProps {
  linkCount: number;
  sortingOptions: string[];
  selectedSortingOption: string;
  handleSelection: (option: string) => void;
}

const BookmarkListHeader = ({
  linkCount,
  sortingOptions,
  selectedSortingOption,
  handleSelection,
}: ListHeaderComponentProps) => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();

  return (
    <>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('핀')}</Text>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.linkCount}>{linkCount} Pins</Text>
        <View style={styles.filterContainer}>
          <DropdownFilter
            options={sortingOptions}
            selectedOption={selectedSortingOption}
            onSelect={handleSelection}
          />
        </View>
      </View>
    </>
  );
};

export default BookmarkListHeader;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    titleContainer: {
      height: 69,
      justifyContent: 'center',
    },
    title: {
      color: theme.TEXT900,
      ...FONTS.TITLE,
    },
    filterContainer: {
      height: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    linkCount: {
      color: theme.MAIN500,
      ...FONTS.BODY2_MEDIUM,
    },
  });
