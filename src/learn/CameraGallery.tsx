import { Alert, Image, Pressable, StyleSheet, Text } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const CameraGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert(
          'Unable to open gallery',
          result.errorMessage ?? result.errorCode,
        );
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error) {
      Alert.alert(
        'Unable to open gallery',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo' });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert(
          'Unable to open gallery',
          result.errorMessage ?? result.errorCode,
        );
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error) {
      Alert.alert(
        'Unable to open gallery',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={openGallery}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Open gallery</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={openCamera}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Open camera</Text>
      </Pressable>

      {selectedImage && (
        <Image
          accessibilityLabel="Selected photo"
          source={{ uri: selectedImage }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </SafeAreaView>
  );
};

export default CameraGallery;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  buttonPressed: {
    backgroundColor: '#1d4ed8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    height: 240,
    width: '100%',
    marginTop: 24,
  },
});
