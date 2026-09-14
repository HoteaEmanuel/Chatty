# React Native Maps setup

`react-native-maps` 1.29.2 is installed and autolinked. Google Maps is configured
for Android and included on iOS; iOS also supports the default Apple Maps provider.

## API keys

Enable billing and Maps SDK for Android / Maps SDK for iOS in your Google Cloud
project. Create separate keys for each platform and restrict them to the matching
SDK and app identifiers.

Android: add this line to the existing, git-ignored `android/local.properties`
(keep its `sdk.dir` entry):

```properties
GOOGLE_MAPS_ANDROID_API_KEY=your_android_maps_key
```

The same environment variable or Gradle property is also supported. Android's
application ID is `com.hotea.chatty`; the key restriction also needs the signing
certificate SHA-1 (`cd android && ./gradlew signingReport`). Use the certificate
for the build you install, including the Play app-signing certificate for Play
releases. Rebuild after changing the key.

iOS: in Xcode, select the ChatApp target → Build Settings → add a User-Defined
Setting named `GOOGLE_MAPS_IOS_API_KEY`, and set your iOS key for Debug and Release.
It is expanded into Info.plist and read by AppDelegate before React Native starts.
Restrict this key to bundle ID `com.hotea.chatty`. Keep actual key values out of
commits. The app can still launch without this setting, but do not mount a Google
map until it is configured.

## iOS native installation (requires macOS and Xcode)

From the project root:

```sh
bundle install
cd ios
bundle exec pod install
```

Open `ios/ChatApp.xcworkspace` and rebuild. The Podfile includes the Google Maps
subspec. Keep the existing React Native minimum iOS version.

## Use a map

```tsx
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// Place inside a container with a defined height or flex: 1.
<MapView
  provider={PROVIDER_GOOGLE}
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 44.4268,
    longitude: 26.1025,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
/>
```

Omit `provider` to use Apple Maps on iOS (no Google key required there); Android
still uses Google Maps. Displaying a map does not require location permission.
Before enabling `showsUserLocation`, implement runtime permission handling and
add Android coarse/fine location permissions. The iOS usage description is ready.

## Android build with limited memory

Build before starting the emulator to avoid overlapping memory use:

```sh
cd android
./gradlew :app:assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=1 --no-parallel --no-daemon -Dorg.gradle.jvmargs='-Xmx1536m -XX:MaxMetaspaceSize=512m' -Pkotlin.compiler.execution.strategy=in-process
```

For the installed Pixel 5 beta image, which otherwise raises RAM to 4 GB:

```sh
"$ANDROID_HOME/emulator/emulator" -avd Pixel_5 -memory 2048 -cores 2 -no-snapshot -no-boot-anim -qemu -m 2048
```

Start Metro from the project root with `yarn start --max-workers 1`. Install the
APK at `android/app/build/outputs/apk/debug/app-debug.apk` on that emulator.

Reference: https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md
