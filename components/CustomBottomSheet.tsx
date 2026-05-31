import { View, StyleSheet, Dimensions } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRef, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: string[];
  onChange?: (index: number) => void;
}

export const useBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openSheet = () => {
    bottomSheetRef.current?.present();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  return { bottomSheetRef, openSheet, closeSheet };
};

export function CustomBottomSheet({
  children,
  snapPoints = ['50%'],
  onChange,
}: BottomSheetProps) {
  const { colors, isDark } = useTheme();

  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: colors.card,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
      }}
      onChange={onChange}
    >
      <BottomSheetView style={[styles.content, { backgroundColor: colors.card }]}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
});
