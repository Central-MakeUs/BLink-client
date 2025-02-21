import {useEffect, useRef, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';
import {BackIcon, ForwardIcon} from '@/assets/icons/modal';
import {AddIcon} from '@/assets/icons/common';
import {type IFolderDtos, type ITheme} from '@/types';
import BottomSheet from '@/components/modal/BottomSheet';
import FolderContent from '@/components/folder/FolderContent';
import useToast from '@/hooks/useToast';
import {TOAST_MESSAGE} from '@/constants/toast';
import FolderList from '@/components/folder/FolderList';
import {
  useCreateFolder,
  useFolders,
  useUpdateFolderTitle,
} from '@/api/hooks/useFolder';
import {trackEvent} from '@/utils/amplitude-utils';
import FolderButtonPlaceHolder from '../folder/FolderButtonPlaceHolder';

interface FolderSideBarProps {
  isSideBarVisible: boolean;
  toggleSideBar: () => void;
  selectedFolderId: number[];
  setSelectedFolderId: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedFolderName: (v: string) => void;
}

const FolderSideBar = ({
  isSideBarVisible,
  toggleSideBar,
  selectedFolderId,
  setSelectedFolderId,
  setSelectedFolderName,
}: FolderSideBarProps) => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  const {renderToast, showToast} = useToast({
    marginBottom: 128,
  });

  const queryClient = useQueryClient();
  const {data: useFolderData, isLoading} = useFolders();
  const {mutate: createFolder} = useCreateFolder({
    onSuccess: () => {
      setIsBottomSheetVisible(!isBottomSheetVisible);
      queryClient.invalidateQueries({queryKey: ['folders']});
      showToast(t(TOAST_MESSAGE.CREATE_SUCCESS));
    },
  });

  const {mutate: updateFolderTitle} = useUpdateFolderTitle({
    onSuccess: () => {
      setIsBottomSheetVisible(!isBottomSheetVisible);
      queryClient.invalidateQueries({queryKey: ['folders']});
      queryClient.invalidateQueries({queryKey: ['links']});
      showToast(t(TOAST_MESSAGE.EDIT_SUCCESS));
    },
  });

  const onSaveFolder = (textInput: string) => {
    if (isCreate) {
      createFolder({title: textInput});
      trackEvent('Folder_Creation', {location: 'pushy-menu-sidebar'});
    } else {
      updateFolderTitle({folderId: folderToEdit.id, title: textInput});
    }
  };

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<IFolderDtos | null>(null);
  const isCreate = !folderToEdit;

  const [visible, setVisible] = useState(isSideBarVisible);

  const toggleBottomSheet = (folderData: IFolderDtos | null) => {
    setFolderToEdit(folderData);
    setIsBottomSheetVisible(!isBottomSheetVisible);
  };

  // 폴더 id 변경 시 홈 화면 폴더 이름 변경
  useEffect(() => {
    const findFolderName = () => {
      if (!useFolderData || selectedFolderId.length === 0) return '전체';
      if (selectedFolderId[0] === 0) return '폴더 없는 링크';

      const selectedFolder = useFolderData.folderDtos.find(
        item => item.id === selectedFolderId[0],
      );
      return selectedFolder?.title ?? '';
    };

    setSelectedFolderName(findFolderName());
  }, [selectedFolderId]);

  const overlayOpacity = useRef(new Animated.Value(0)).current; // 오버레이의 초기 불투명도
  const sideBarAnimation = useRef(
    new Animated.Value(-Dimensions.get('window').width),
  ).current;

  useEffect(() => {
    if (isSideBarVisible) {
      setVisible(true);
      // 사이드바와 오버레이 동시에 애니메이션
      Animated.parallel([
        Animated.timing(sideBarAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1, // 오버레이를 완전히 불투명하게
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sideBarAnimation, {
          toValue: -Dimensions.get('window').width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0, // 오버레이를 완전히 투명하게
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [isSideBarVisible]);

  return (
    <RNModal
      visible={visible}
      onRequestClose={toggleSideBar}
      transparent
      animationType="none"
      hardwareAccelerated
      presentationStyle="overFullScreen"
      style={styles.modalContent}>
      <TouchableWithoutFeedback onPress={toggleSideBar}>
        <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]} />
      </TouchableWithoutFeedback>

      {renderToast()}

      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{translateX: sideBarAnimation}],
            paddingTop: insets.top,
          },
          {
            backgroundColor:
              theme.THEME_NUMBER === 3 ? '#E1EAFF' : theme.BACKGROUND, // TODO: 임시 색상 처리, 이미지로 교체 필요
          },
        ]}>
        <TouchableOpacity onPress={toggleSideBar} style={styles.closeButton}>
          <BackIcon width={26} height={26} fill={theme.TEXT900} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('폴더')}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.linkCount}>
            {(useFolderData?.folderDtos.length ?? 0) + ' Folders'}
          </Text>
          <TouchableOpacity
            style={styles.totalButton}
            onPress={() => {
              setSelectedFolderId([]);
              toggleSideBar();
            }}>
            <Text style={styles.totalButtonText}>{t('전체보기')}</Text>
            <ForwardIcon fill={theme.TEXT700} />
          </TouchableOpacity>
        </View>

        <View style={styles.folderView}>
          {isLoading ? (
            <FolderButtonPlaceHolder isMultipleSelection={false} />
          ) : useFolderData &&
            (useFolderData?.folderDtos.length > 0 ||
              useFolderData?.noFolderLinkCount > 0) ? (
            <FolderList
              isMultipleSelection={false}
              handleSelect={toggleBottomSheet}
              onFolderPress={() => {
                toggleSideBar();
              }}
              {...{
                selectedFolderId,
                setSelectedFolderId,
                showToast,
                useFolderData,
              }}
            />
          ) : (
            <View style={styles.emptyView}>
              <Image source={theme.EMPTY_IMAGE} style={styles.emptyImage} />
              <Text style={styles.emptyText}>
                {t('생성한 폴더가 있으면 여기에 보여요.')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.addFolderButton}
            onPress={() => {
              toggleBottomSheet(null);
            }}>
            <AddIcon
              stroke={theme.BACKGROUND}
              fill={theme.MAIN400}
              style={{marginRight: 8}}
            />
            <Text style={styles.addFolderButtonText}>{t('폴더 생성')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <BottomSheet
        modalTitle={t(isCreate ? '폴더 생성' : '폴더 수정')}
        toggleBottomSheet={() => setIsBottomSheetVisible(!isBottomSheetVisible)}
        {...{isBottomSheetVisible}}>
        <FolderContent
          defaultText={folderToEdit?.title ?? undefined}
          folderTitles={
            useFolderData?.folderDtos.map(folder => folder.title) ?? []
          }
          {...{onSaveFolder}}
        />
      </BottomSheet>
    </RNModal>
  );
};

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      borderTopRightRadius: 28,
      borderBottomRightRadius: 28,
      width: 316,
      height: '100%',
      padding: 18,
      position: 'absolute',
      left: 0,
      top: 0,
      shadowColor: '#000',
      shadowOffset: {width: 15, height: 0},
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
      backgroundColor: theme.BACKGROUND,
    },
    titleContainer: {
      height: 69,
      justifyContent: 'center',
    },
    title: {
      color: theme.TEXT900,
      ...FONTS.TITLE,
    },
    detailContainer: {
      height: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    linkCount: {
      color: theme.MAIN500,
      ...FONTS.BODY2_MEDIUM,
    },
    totalButton: {
      width: 70,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    totalButtonText: {
      color: theme.TEXT700,
      ...FONTS.BODY2_MEDIUM,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingBottom: 22,
    },
    folderView: {
      flex: 1,
      marginVertical: 20,
    },
    stroke: {
      borderWidth: 1,
      borderColor: theme.TEXT200,
      marginVertical: 8,
      width: '100%',
    },
    emptyView: {
      flex: 1,
      gap: 12,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyImage: {
      width: 180,
      height: 180,
    },
    emptyText: {
      color: theme.TEXT500,
      ...FONTS.BODY2_MEDIUM,
    },
    addFolderButton: {
      height: 45,
      borderWidth: 1,
      borderColor: theme.TEXT200,
      borderRadius: 100,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      backgroundColor: theme.BACKGROUND,
    },
    addFolderButtonText: {
      color: theme.TEXT700,
      ...FONTS.BODY2_SEMIBOLD,
      lineHeight: 19,
    },
    closeButton: {
      height: 58,
      justifyContent: 'center',
    },
  });

export default FolderSideBar;
