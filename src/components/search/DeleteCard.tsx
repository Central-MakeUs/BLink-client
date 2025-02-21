import {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {DeleteIcon} from '@/assets/icons/common';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';
import {type ILinkDtos, type ITheme} from '@/types';
import {extractHostname} from '@/utils/url-utils';

interface LargeCardProps {
  content: ILinkDtos;
  onDelete: () => void; // 삭제를 위한 콜백 함수
}

const DeleteCard = ({content, onDelete}: LargeCardProps) => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.folderText}>
          {content.folderName ?? t('폴더 없는 링크')}
        </Text>
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          {content.title === ''
            ? t('제목이 없는 링크입니다.', {
                domain: extractHostname(content.url ?? ''),
              })
            : content.title}
        </Text>
      </View>
      <TouchableOpacity style={styles.rightContainer} onPress={onDelete}>
        <DeleteIcon fill={theme.TEXT500} />
      </TouchableOpacity>
    </View>
  );
};

export default DeleteCard;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    leftContainer: {
      flexDirection: 'column',
      gap: 8,
      flex: 1,
    },
    rightContainer: {},
    folderText: {
      ...FONTS.BODY2_REGULAR,
      color: theme.TEXT600,
    },
    titleText: {
      ...FONTS.BODY1_MEDIUM,
      color: theme.TEXT900,
      paddingRight: 20,
    },
  });
