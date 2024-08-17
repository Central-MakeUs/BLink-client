import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DropdownFilter from '@/components/home/DropDownFilter';
import {type ITheme} from '@/types';
import {FONTS} from '@/constants';

interface TrashHeaderProps {
  linkCount: number | null;
  sortingOptions: string[];
  selectedSortingOption: string;
  handleSelection: (selected: string) => void;
  theme: ITheme;
}

const ListHeader = ({
  linkCount,
  sortingOptions,
  selectedSortingOption,
  handleSelection,
  theme,
}: TrashHeaderProps) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.titleContainer}>
      <View style={styles.headerText}>
        <Text style={styles.title}>휴지통</Text>
      </View>
      <Text style={styles.subTitle}>
        휴지통의 링크는 7일 이후 영구적으로 삭제됩니다.
      </Text>
      <View style={styles.paddingContent} />
      <View style={styles.filterContainer}>
        <Text style={styles.linkCount}>{linkCount} Links</Text>
        <DropdownFilter
          options={sortingOptions}
          selectedOption={selectedSortingOption}
          onSelect={handleSelection}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    titleContainer: {
      marginTop: 58,
    },
    headerText: {
      height: 69,
      justifyContent: 'center',
    },
    paddingContent: {
      marginTop: 32,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: theme.TEXT900,
      ...FONTS.TITLE,
    },
    subTitle: {
      color: theme.TEXT600,
      ...FONTS.BODY2_REGULAR,
    },
    linkCount: {
      color: theme.MAIN500,
      ...FONTS.BODY2_MEDIUM,
    },
  });

export default ListHeader;