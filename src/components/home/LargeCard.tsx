import {useState, useMemo, useRef} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useThemeStore} from '@/store/useThemeStore';
import {PinnedSelectedIcon, PinnedUnselectedIcon} from '@/assets/icons/common';
import {FONTS} from '@/constants';
import {MoveIcon, ShareIcon, ThreeDotIcon} from '@/assets/icons/home';
import {type UseLinkInfoArgs, type ITheme, type ILinkDtos} from '@/types';
import {DeleteIcon, PencilIcon} from '@/assets/icons/mypage';
import DropDownModal from '@/components/modal/DropDownModal';
import BottomSheet from '@/components/modal/BottomSheet';
import TitleContent from '@/components/link/TitleContent';
import FolderMoveContent from '@/components/link/FolderMoveContent';
import {TOAST_MESSAGE} from '@/constants/toast';
import {extractHostname, shareUrl} from '@/utils/url-utils';
import {
  useMoveLinkToTrash,
  useToggleLinkPin,
  useUpdateLinkTitle,
} from '@/api/hooks/useLink';
import {trackEvent} from '@/utils/amplitude-utils';

const screenWidth = Dimensions.get('screen').width - 36;
// const aspectRatio = 339 / 140; // 카드 비율
const cardHeight = 140;

interface LargeCardProps {
  content: ILinkDtos;
  showToast?: (text: string) => void;
  linkInfoArgs: UseLinkInfoArgs;
}

const LargeCard = ({
  content,
  showToast = () => {},
  linkInfoArgs,
}: LargeCardProps) => {
  const {theme} = useThemeStore();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {t} = useTranslation();
  // 핀 기능 핸들러 추가
  const {mutate: togglePin} = useToggleLinkPin(linkInfoArgs);
  const {mutate: moveLinkToTrash} = useMoveLinkToTrash(linkInfoArgs);

  const {mutate: updateTitle} = useUpdateLinkTitle(linkInfoArgs);

  // 제목 수정 바텀시트 모달 관리
  const [isTitleBottomSheetVisible, setIsTitleBottomSheetVisible] =
    useState(false);
  const toggleTitleBottomSheet = () => {
    setIsTitleBottomSheetVisible(!isTitleBottomSheetVisible);
  };
  const handleTitleUpdate = () => {
    setIsTitleBottomSheetVisible(!isTitleBottomSheetVisible);
    trackEvent('Link_Title_Edited', {
      Link_ID: content.id,
    });
  };

  // 폴더 이동 바텀시트 모달 관리
  const [isFolderBottomSheetVisible, setIsFolderBottomSheetVisible] =
    useState(false);
  const toggleFolderBottomSheet = () => {
    setIsFolderBottomSheetVisible(!isFolderBottomSheetVisible);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeDropdown = () => setIsDropdownOpen(false);

  const [anchorPosition, setAnchorPosition] = useState({x: 0, y: 0});
  const buttonRef = useRef<TouchableOpacity>(null);

  const toggleDropdown = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setIsDropdownOpen(true);
      setAnchorPosition({x: pageX, y: pageY + height});
    });
  };

  const editOptions = useMemo(
    () => [
      {
        label: t('제목 수정'),
        icon: <PencilIcon />,
        onSelect: () => {
          closeDropdown();
          toggleTitleBottomSheet();
        },
      },
      {
        label: t('폴더 이동'),
        icon: <MoveIcon />,
        onSelect: () => {
          closeDropdown();
          toggleFolderBottomSheet();
        },
      },
      {
        label: t('공유'),
        icon: <ShareIcon />,
        onSelect: () => {
          const currentUrl = content.url ?? '';
          shareUrl(currentUrl);
          trackEvent('Click_Share', {Link_Saved_Location: 'at-card'});
        },
      },
      {
        label: t('삭제'),
        icon: <DeleteIcon />,
        onSelect: () => {
          moveLinkToTrash(String(content.id));
          showToast(t(TOAST_MESSAGE.DELETE_SUCCESS));
          closeDropdown();
          trackEvent('Link_Deleted', {
            Link_ID: content.id,
          });
        },
      },
    ],
    [closeDropdown, toggleTitleBottomSheet, toggleFolderBottomSheet],
  );

  // 핀 on/off 핸들러
  const handlePinToggle = () => {
    togglePin(String(content.id));
    if (!content.pinned) {
      trackEvent('Pin_Saved', {Link_Saved_Location: 'at-card'});
    } else {
      trackEvent('Pin_Unpinned', {Link_Saved_Location: 'at-card'});
    }
  };

  // 이미지 로딩 처리
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  const LoadingScreen = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6D96FF" />
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.cardImageContainer}>
          {content.imageUrl && imageLoading && <LoadingScreen />}
          <TouchableOpacity style={styles.dotPosition}>
            <TouchableOpacity
              ref={buttonRef}
              onPress={toggleDropdown}
              style={styles.dotPadding}>
              <ThreeDotIcon fill={theme.TEXT300} />
            </TouchableOpacity>
            {isDropdownOpen && (
              <DropDownModal
                isVisible={isDropdownOpen}
                options={editOptions}
                onClose={closeDropdown}
                anchorPosition={anchorPosition}
              />
            )}
          </TouchableOpacity>
          {content.imageUrl ? (
            <Image
              source={{uri: content.imageUrl}}
              style={styles.image}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageLoad}
            />
          ) : (
            <View style={styles.imageContainer}>
              {/* <CardImage width={300} height={300} /> */}
              <Image
                source={theme.BIG_CARD_IMAGE}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
        <View style={styles.folderTop} />
        <Text style={styles.folderText}>
          {content.folderName ?? t('폴더 없는 링크')}
        </Text>

        <View style={styles.titleTop} />
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          {content.title === ''
            ? t('제목이 없는 링크입니다.', {
                domain: extractHostname(content.url ?? ''),
              })
            : content.title}
        </Text>

        <View style={styles.footerTop} />
        <View style={styles.footer}>
          <View style={styles.footerFront}>
            <Text style={styles.footerText}>{content.createdAt}</Text>
            <Text style={styles.footerText}>
              {extractHostname(content.url ?? '')}
            </Text>
          </View>
          <TouchableOpacity onPress={handlePinToggle}>
            {content.pinned ? (
              <PinnedSelectedIcon
                width={20}
                height={20}
                fill={theme.MAIN400}
                stroke={theme.MAIN400}
              />
            ) : (
              <PinnedUnselectedIcon
                width={20}
                height={20}
                stroke={theme.TEXT400}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        modalTitle={t('제목 수정')}
        isBottomSheetVisible={isTitleBottomSheetVisible}
        toggleBottomSheet={toggleTitleBottomSheet}>
        <TitleContent
          defaultText={content.title}
          toggleBottomSheet={handleTitleUpdate}
          updateTitle={updateTitle}
          linkId={content.id}
        />
      </BottomSheet>
      <BottomSheet
        modalTitle={t('폴더 이동')}
        isBottomSheetVisible={isFolderBottomSheetVisible}
        toggleBottomSheet={toggleFolderBottomSheet}>
        <FolderMoveContent
          toggleBottomSheet={toggleFolderBottomSheet}
          linkId={content.id}
        />
      </BottomSheet>
    </>
  );
};

export default LargeCard;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      width: screenWidth,
      paddingVertical: 16,
    },
    cardImageContainer: {
      width: screenWidth,
      height: cardHeight,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    dotPadding: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    dotPosition: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 1,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    folderTop: {
      marginTop: 12,
    },
    imageContainer: {
      flex: 1,
      width: '100%',
      height: 140,
      overflow: 'hidden',
      resizeMode: 'cover',
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleTop: {
      marginTop: 4,
    },
    footerTop: {
      marginTop: 8,
    },
    folderText: {
      color: theme.TEXT600,
      ...FONTS.BODY2_REGULAR,
    },
    titleText: {
      color: theme.TEXT900,
      ...FONTS.BODY1_MEDIUM,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerFront: {
      flexDirection: 'row',
      gap: 12,
    },
    footerText: {
      color: theme.TEXT500,
      ...FONTS.CAPTION_REGULAR,
    },
  });
