import * as React from "react";
import { ProgressBar, Colors } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function ProgressBarComponent({ progress }) {
  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} color="#6200ee" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
});
