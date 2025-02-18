import React, {useEffect, useState, useMemo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {FONTS} from '@/constants';
import {useThemeStore} from '@/store/useThemeStore';
import {AddIcon} from '@/assets/icons/common';
import {useBottomButtonSizeStore} from '@/store/useBottomButtonSizeStore';
import {type ITheme} from '@/types';
import CustomBottomButton from '@/components/common/CustomBottomButton';
import BottomSheet from '@/components/modal/BottomSheet';
import FolderContent from '@/components/folder/FolderContent';
import FolderList from '@/components/folder/FolderList';
import {useCreateFolder, useFolders} from '@/api/hooks/useFolder';
import {useLinkFolder, useMoveLink} from '@/api/hooks/useLink';
import FolderButtonPlaceHolder from '../folder/FolderButtonPlaceHolder';

interface FolderMoveContentProps {
  toggleBottomSheet: () => void;
  linkId: number;
}

const FolderMoveContent = ({
  toggleBottomSheet,
  linkId,
}: FolderMoveContentProps) => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();

  const {data: useFolderData, isLoading} = useFolders();
  // 특정 링크의 폴더 정보 가져오기
  const {data: selectedFoldersData} = useLinkFolder(linkId);

  const [selectedFolderId, setSelectedFolderId] = useState<number[]>([0]);

  useEffect(() => {
    if (
      selectedFoldersData?.folderIdList &&
      selectedFoldersData?.folderIdList.length > 0
    ) {
      setSelectedFolderId(selectedFoldersData.folderIdList);
    } else {
      setSelectedFolderId([0]);
    }
  }, [selectedFoldersData]);

  const [isReadyToSave, setIsReadyToSave] = useState<boolean>(true);
  const [isFolderBottomSheetVisible, setIsFolderBottomSheetVisible] =
    useState(false);
  const {buttonHeight} = useBottomButtonSizeStore();

  const queryClient = useQueryClient();
  const {mutate: createFolder} = useCreateFolder({
    onSuccess: () => {
      toggleFolderBottomSheet();
      queryClient.invalidateQueries({queryKey: ['folders']});
    },
  });
  const {mutate: updateMoveLink} = useMoveLink();

  // 폴더 생성 API
  const onSaveFolder = (textInput: string) => {
    createFolder({title: textInput});
  };

  // 폴더 이동 API
  const onSaveMoveFolder = () => {
    const folderIdList = selectedFolderId[0] === 0 ? [] : selectedFolderId;
    updateMoveLink({
      linkId,
      folderIdList,
    });
  };

  const toggleFolderBottomSheet = () => {
    setIsFolderBottomSheetVisible(!isFolderBottomSheetVisible);
  };

  useEffect(() => {
    setIsReadyToSave(!!selectedFolderId && selectedFolderId.length > 0);
  }, [selectedFolderId]);

  return (
    <>
      <BottomSheet
        modalTitle={t('폴더 생성')}
        isBottomSheetVisible={isFolderBottomSheetVisible}
        toggleBottomSheet={toggleFolderBottomSheet}>
        <FolderContent
          folderTitles={
            useFolderData?.folderDtos.map(folder => folder.title) ?? []
          }
          {...{onSaveFolder}}
        />
      </BottomSheet>
      <SafeAreaView
        style={[styles.contentContainer, {marginBottom: buttonHeight}]}>
        <View style={styles.folderTitle}>
          <Text style={styles.folderTitleText}>{t('폴더')}</Text>

          <TouchableOpacity
            style={styles.addContainer}
            onPress={toggleFolderBottomSheet}>
            <AddIcon stroke={theme.BACKGROUND} fill={theme.MAIN400} />
          </TouchableOpacity>
        </View>
        <View style={[styles.folderView]}>
          {isLoading ? (
            <FolderButtonPlaceHolder isMultipleSelection />
          ) : (
            <FolderList
              isMultipleSelection={true}
              {...{selectedFolderId, setSelectedFolderId, useFolderData}}
            />
          )}
        </View>
      </SafeAreaView>
      <CustomBottomButton
        title={t('저장')}
        onPress={() => {
          toggleBottomSheet();
          onSaveMoveFolder();
        }}
        isDisabled={!isReadyToSave}
      />
    </>
  );
};

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      paddingHorizontal: 18,
    },
    folderTitle: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'center',
    },
    folderTitleText: {
      color: theme.MAIN500,
      marginRight: 4,
      ...FONTS.BODY1_SEMIBOLD,
    },
    addContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    addText: {
      color: theme.TEXT700,
      ...FONTS.BODY1_SEMIBOLD,
    },
    folderView: {
      flex: 1,
      paddingVertical: 12,
      marginBottom: 58,
    },
    lastFolderView: {
      flex: 1,
    },
    stroke: {
      borderWidth: 1,
      borderColor: theme.TEXT200,
      marginVertical: 8,
      width: '100%',
    },
  });

export default FolderMoveContent;
