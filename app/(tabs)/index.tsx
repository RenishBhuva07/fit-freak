import { StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/today" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
