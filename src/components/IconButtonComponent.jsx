import * as React from "react";
import { IconButton } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function IconButtonComponent({ icon, onPress }) {
  return (
    <View style={styles.container}>
      <IconButton icon={icon} color="#6200ee" size={24} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
});
