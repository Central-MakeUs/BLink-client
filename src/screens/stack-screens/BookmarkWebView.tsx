import React, {useState, useRef, useEffect, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView, type WebViewNavigation} from 'react-native-webview';
import {useTranslation} from 'react-i18next';
import {FONTS} from '@/constants';
import {extractHostname, shareUrl} from '@/utils/url-utils';
import {type ITheme} from '@/types';
import {useThemeStore} from '@/store/useThemeStore';
import {
  useCheckLinkExist,
  usePinnedLinks,
  useToggleBookmarkLinkPin,
  useViewLink,
} from '@/api/hooks/useLink';
import NavigationButton from '@/components/common/NavigationButton';
import {
  ArrowBackIcon,
  RefreshIcon,
  SaveIcon,
  ShareIcon,
  ContentBackIcon,
  ContentFrontIcon,
} from '@/assets/icons/webview';
import BottomSheet from '@/components/modal/BottomSheet';
import LinkContent from '@/components/link/LinkContent';
import {PinnedIcon} from '@/assets/icons/bottom-tab';
import NoticeModal from '@/components/modal/NoticeModal';
import {trackEvent} from '@/utils/amplitude-utils';

const BookmarkWebView = () => {
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const {theme} = useThemeStore();
  const {t} = useTranslation();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const route = useRoute();
  const {size, sortBy, initialIndex} = route.params as {
    size: number;
    sortBy: string;
    initialIndex: number;
  };

  const linkInfoArgsOptions = {
    size,
    sortBy,
  };

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const previousIndexRef = useRef<number | null>(null);
  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState(false); // 링크 저장 유효성 검사 noticeModal

  const {
    data: linkData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePinnedLinks(linkInfoArgsOptions);

  const {mutate: togglePin} = useToggleBookmarkLinkPin({size, sortBy});
  const {mutate: viewLink} = useViewLink();

  // 링크 중복 검사
  const {mutate: existsCheck} = useCheckLinkExist({
    onSuccess: (result: boolean) => {
      if (!result) {
        setIsBottomSheetVisible(!isBottomSheetVisible);
      } else {
        setIsNoticeModalVisible(true);
      }
    },
    onError: () => {
      console.error('Error checking link duplication');
    },
  });

  const linkList = linkData?.pages.flatMap(page => page.linkDtos) ?? [];
  const currentLink = linkList[currentIndex];

  useEffect(() => {
    if (linkList.length > 0 && currentLink?.url) {
      setCurrentUrl(currentLink.url);
    }
  }, [linkList, currentIndex]);

  useEffect(() => {
    if (currentLink?.id && previousIndexRef.current !== currentIndex) {
      viewLink(String(currentLink.id));
      previousIndexRef.current = currentIndex;
    }
  }, [currentIndex, currentLink?.id, viewLink]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setWebViewUrl(navState.url);
  };

  const handlePinToggle = () => {
    togglePin(String(currentLink.id));
    if (!currentLink.pinned) {
      trackEvent('Pin_Saved', {Link_Saved_Location: 'in-webview'});
    } else {
      trackEvent('Pin_Unpinned', {Link_Saved_Location: 'in-webview'});
    }
  };

  const directBack = () => {
    webViewRef.current?.goBack();
  };

  const directFront = () => {
    webViewRef.current?.goForward();
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setWebViewKey(prevKey => prevKey + 1);
    }
  };

  const goForward = async () => {
    if (currentIndex < linkList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setWebViewKey(prevKey => prevKey + 1);
    } else if (hasNextPage) {
      const nextPageData = await fetchNextPage();
      if (nextPageData.data?.pages) {
        const newLinks = nextPageData.data.pages.flatMap(page => page.linkDtos);
        setCurrentIndex(currentIndex + 1);
        setCurrentUrl(newLinks[0]?.url ?? '');
        setWebViewKey(prevKey => prevKey + 1);
      }
    }
  };

  const handleGoForward = () => {
    goForward().catch(error => {
      console.error('Error navigating forward:', error);
    });
  };

  const reloadPage = () => {
    webViewRef.current?.reload();
  };

  const goBackPage = () => {
    navigation.goBack();
    trackEvent('Link_ViewPage_Closed', {Link_Viewed_Location: 'pin'});
  };

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const toggleBottomSheet = () => {
    if (webViewUrl) {
      existsCheck(webViewUrl);
    }
  };

  // 링크 저장 토글 클릭 이벤트
  const toggleBottomSheetEvent = () => {
    setIsBottomSheetVisible(false);
    trackEvent('Link_Saved_form', {Link_Saved_Location: 'in-webview'});
  };

  // 공유하기 버튼 클릭 이벤트
  const handlePressShare = () => {
    trackEvent('Click_Share', {Link_Saved_Location: 'in-webview'});
    shareUrl(currentUrl ?? '');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={goBackPage}>
          <ArrowBackIcon fill={theme.TEXT900} />
        </TouchableOpacity>
        <View style={styles.urlTextHolder}>
          <Text style={[FONTS.BODY2_REGULAR, {color: theme.TEXT700}]}>
            {extractHostname(currentUrl ?? '')}
          </Text>
        </View>
        <TouchableOpacity onPress={reloadPage}>
          <RefreshIcon fill={theme.TEXT900} />
        </TouchableOpacity>
      </View>

      {currentUrl && (
        <WebView
          ref={webViewRef}
          key={webViewKey}
          source={{uri: currentUrl}}
          style={styles.webViewContainer}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}

      <View style={styles.backForwardButton}>
        <NavigationButton
          onPress={goBack}
          disabled={currentIndex === 0}
          label={t('이전 링크')}
        />
        <NavigationButton
          onPress={handleGoForward}
          disabled={
            (!hasNextPage && currentIndex === linkList.length - 1) ||
            isFetchingNextPage
          }
          label={isFetchingNextPage ? t('로딩 중...') : t('다음 링크')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={directBack} disabled={!canGoBack}>
          <ContentBackIcon fill={canGoBack ? theme.TEXT700 : theme.TEXT300} />
        </TouchableOpacity>
        <TouchableOpacity onPress={directFront} disabled={!canGoForward}>
          <ContentFrontIcon
            fill={canGoForward ? theme.TEXT700 : theme.TEXT300}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePressShare}>
          <ShareIcon fill={theme.TEXT900} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePinToggle}>
          <PinnedIcon
            width={30}
            height={30}
            strokeWidth={1.6}
            fill={currentLink.pinned ? theme.TEXT900 : 'transparent'}
            stroke={theme.TEXT900}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleBottomSheet}>
          <SaveIcon fill={theme.TEXT900} />
        </TouchableOpacity>
      </View>

      {/* NoticeModal(링크 중복 검사 엣지케이스 시 모달) */}
      <NoticeModal
        isVisible={isNoticeModalVisible}
        onClose={() => setIsNoticeModalVisible(false)}
        title={t('이미 저장된 링크예요')}
        description={t(
          '다른 페이지로 이동했을 때 클릭해서 새로운 링크를 빠르게 저장해보세요',
        )}
      />
      {/* 링크 저장모달 */}
      <BottomSheet
        modalTitle={t('링크 저장')}
        {...{isBottomSheetVisible, toggleBottomSheet}}>
        <LinkContent
          defaultURL={webViewUrl ?? ''}
          toggleBottomSheet={toggleBottomSheetEvent}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default BookmarkWebView;

const createStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    buttonContainer: {
      paddingTop: 8,
      paddingBottom: 4,
      paddingHorizontal: 4,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    webViewContainer: {
      flex: 1,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 18,
      gap: 12,
      alignItems: 'center',
    },
    urlTextHolder: {
      flex: 1,
      height: 37,
      justifyContent: 'center',
      backgroundColor: theme.TEXT200,
      borderRadius: 8,
      paddingHorizontal: 16,
    },
    backForwardButton: {
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 18,
      alignItems: 'center',
      gap: 16,
    },
  });
