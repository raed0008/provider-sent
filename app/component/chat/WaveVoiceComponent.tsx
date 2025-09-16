import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
  } from 'react';
  import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Linking,
    Pressable,
    ScrollView,
    StatusBar,
    View,
  } from 'react-native';
  import {
    FinishMode,
    IWaveformRef,
    PermissionStatus,
    PlayerState,
    RecorderState,
    UpdateFrequency,
    Waveform,
    useAudioPermission,
  } from '@simform_solutions/react-native-audio-waveform';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';
  import {
    SafeAreaProvider,
    useSafeAreaInsets,
  } from 'react-native-safe-area-context';
  import * as  Gifs from '../../assets/gifs';
  import * as  Icons from '../../assets/icons';
import { Colors } from '../../constant/styles';

  
  const ListItem = React.memo(
    ({
      item,
      currentPlaying,
      setCurrentPlaying,
      onPanStateChange,
    }) => {
      const ref = useRef<IWaveformRef>(null);
      const [playerState, setPlayerState] = useState(PlayerState.stopped);
      const styles = stylesheet({ currentUser: item.fromCurrentUser });
      const [isLoading, setIsLoading] = useState(true);
  
      const handleButtonAction = () => {
        if (playerState === PlayerState.stopped) {
          setCurrentPlaying(item.path);
        } else {
          setCurrentPlaying('');
        }
      };
  
      useEffect(() => {
        if (currentPlaying !== item.path) {
          ref.current?.stopPlayer();
        } else {
          ref.current?.startPlayer({ finishMode: FinishMode.stop });
        }
      }, [currentPlaying]);
  
      return (
        <View key={item.path} style={[styles.listItemContainer]}>
          <View style={styles.listItemWidth}>
            <ImageBackground
              source={
                item.fromCurrentUser
                  ? Gifs.audioBackground1
                  : Gifs.audioBackground2
              }
              style={[styles.buttonContainer]}>
              <Pressable
                disabled={isLoading}
                onPress={handleButtonAction}
                style={styles.playBackControlPressable}>
                {isLoading ? (
                  <ActivityIndicator color={'#FF0000'} />
                ) : (
                  <Image
                    source={
                      playerState === PlayerState.stopped
                        ? Icons.play
                        : Icons.stop
                    }
                    style={styles.buttonImage}
                    resizeMode="contain"
                  />
                )}
              </Pressable>
              <Waveform
                containerStyle={styles.staticWaveformView}
                mode="static"
                key={item.path}
                ref={ref}
                path={item.path}
                candleSpace={2}
                candleWidth={4}
                scrubColor={Colors.whiteColor}
                waveColor={Colors.grayColor}
                candleHeightScale={4}
                onPlayerStateChange={state => {
                  setPlayerState(state);
                  if (
                    state === PlayerState.stopped &&
                    currentPlaying === item.path
                  ) {
                    setCurrentPlaying('');
                  }
                }}
                onPanStateChange={onPanStateChange}
                onError={error => {
                  console.log(error, 'we are in example');
                }}
                onCurrentProgressChange={(currentProgress, songDuration) => {
                  console.log(
                    'currentProgress ',
                    currentProgress,
                    'songDuration ',
                    songDuration
                  );
                }}
                onChangeWaveformLoadState={state => {
                  setIsLoading(state);
                }}
              />
            </ImageBackground>
          </View>
        </View>
      );
    }
  );
  
  const LivePlayerComponent = ({
    setList,
  }) => {
    const ref = useRef<IWaveformRef>(null);
    const [recorderState, setRecorderState] = useState(RecorderState.stopped);
    const styles = stylesheet();
    const { checkHasAudioRecorderPermission, getAudioRecorderPermission } =
      useAudioPermission();
  
    const startRecording = () => {
      ref.current
        ?.startRecord({
          updateFrequency: UpdateFrequency.high,
        })
        .then(() => {})
        .catch(() => {});
    };
  
    const handleRecorderAction = async () => {
      if (recorderState === RecorderState.stopped) {
        let hasPermission = await checkHasAudioRecorderPermission();
  
        if (hasPermission === PermissionStatus.granted) {
          startRecording();
        } else if (hasPermission === PermissionStatus.undetermined) {
          const permissionStatus = await getAudioRecorderPermission();
          if (permissionStatus === PermissionStatus.granted) {
            startRecording();
          }
        } else {
          Linking.openSettings();
        }
      } else {
        ref.current?.stopRecord().then(path => {
          setList(prev => [...prev, { fromCurrentUser: true, path }]);
        });
      }
    };
  
    return (
      <View style={styles.liveWaveformContainer}>
        <Waveform
          mode="live"
          containerStyle={styles.liveWaveformView}
          ref={ref}
          candleSpace={2}
          candleWidth={2}
          waveColor={Colors.piege}
          onRecorderStateChange={setRecorderState}
        />
        <Pressable
          onPress={handleRecorderAction}
          style={styles.recordAudioPressable}>
          <Image
            source={
              recorderState === RecorderState.stopped ? Icons.mic : Icons.stop
            }
            style={styles.buttonImageLive}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    );
  };
  
  const WaveVoiceComponent = () => {
    const [shouldScroll, setShouldScroll] = useState(true);
    const [currentPlaying, setCurrentPlaying] = useState<string>('');
    const [list, setList] = useState(['../../assets/Ring-tone.mp3']);
  
    const { top, bottom } = useSafeAreaInsets();
  
    return (
      <View style={styles.appContainer}>
        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
          animated
          translucent
        />
        <GestureHandlerRootView style={styles.appContainer}>
          <ImageBackground
            source={Gifs.appBackground}
            style={styles.screenBackground}>
            <View style={styles.container}>
              <View style={styles.simformImageContainer}>
                <Image
                  source={Icons.simform}
                  style={styles.simformImage}
                  resizeMode="contain"
                />
              </View>
              <ScrollView scrollEnabled={shouldScroll}>
                {list.map(item => (
                  <ListItem
                    key={item.path}
                    currentPlaying={currentPlaying}
                    setCurrentPlaying={setCurrentPlaying}
                    item={item}
                    onPanStateChange={value => setShouldScroll(!value)}
                  />
                ))}
              </ScrollView>
            </View>
            <LivePlayerComponent setList={setList} />
          </ImageBackground>
        </GestureHandlerRootView>
      </View>
    );
  };
  
  export default  WaveVoiceComponent

  import { StyleSheet } from 'react-native';



/**
 * A StyleSheet object that contains all of the application's styles.
 * @param {ThemeMode} theme - The theme of the application.
 * @returns {StyleSheet} - A StyleSheet object containing all of the application's styles.
 */
const styles = (params: StyleSheetParams = {}) =>
  StyleSheet.create({
    appContainer: {
      flex: 1,
    },
    screenBackground: {
      flex: 1,
      paddingBottom: params.bottom,
    },
    container: {
      flex: 1,
      paddingTop: params.top,
      paddingHorizontal: scale(16),
      marginBottom: scale(24),
    },
    buttonContainer: {
      flexDirection: 'row',
      borderRadius: scale(10),
      alignItems: 'center',
      overflow: 'hidden',
    },
    listItemContainer: {
      marginTop: scale(16),
      alignItems: params.currentUser ? 'flex-end' : 'flex-start',
    },
    listItemWidth: {
      width: '90%',
    },
    buttonImage: {
      height: '100%',
      width: '100%',
    },
    staticWaveformView: {
      flex: 1,
      height: scale(75),
      paddingEnd: scale(10),
    },
    playBackControlPressable: {
      height: scale(30),
      width: scale(30),
      padding: scale(5),
    },
    recordAudioPressable: {
      height: scale(40),
      width: scale(40),
      padding: scale(8),
    },
    liveWaveformContainer: {
      flexDirection: 'row',
      marginBottom: scale(8),
      borderRadius: scale(8),
      alignItems: 'center',
      paddingHorizontal: scale(16),
    },
    simformImage: {
      height: scale(50),
      width: scale(200),
    },
    liveWaveformView: {
      flex: 1,
      borderWidth: scale(0.5),
      borderRadius: scale(8),
      paddingHorizontal: scale(10),
    },
    buttonImageLive: {
      height: '100%',
      width: '100%',
      tintColor: Colors.pink,
    },
    simformImageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: Colors.black,
    },
  });

