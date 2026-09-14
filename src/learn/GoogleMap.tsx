import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

const GoogleMap = () => {
  return (
    <MapView
      style={styles.mapView}
      provider={PROVIDER_GOOGLE}
      region={{
        latitude: 45.75613727149629,
        longitude: 21.230805064510403,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
    >
      <Marker
        coordinate={{
          latitude: 45.74786898670567,
          longitude: 21.246705569335344,
        }}
        title='Deliblata'
        description='Here lives the king'
      />
    </MapView>
  );
};

export default GoogleMap;

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
  },
});
