import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SlotStatusDto } from '../types/api';
import { colors, slotStatusColor, slotTypeColor } from '../theme/colors';

interface Props {
  slot: SlotStatusDto;
  onPress: (slot: SlotStatusDto) => void;
}

export default function SlotChip({ slot, onPress }: Props) {
  const typeColor = slotTypeColor[slot.type] ?? colors.primary;
  const statusColor = slotStatusColor[slot.status] ?? colors.disabled;
  const isMaintenance = slot.status === 'BaoTri';

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          borderColor: typeColor,
          backgroundColor: `${typeColor}22`,
          opacity: isMaintenance ? 0.5 : 1,
        },
      ]}
      onPress={() => onPress(slot)}
      activeOpacity={0.7}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Text style={[styles.code, { color: typeColor }]}>{slot.code}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 72,
    height: 60,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  code: { fontSize: 14, fontWeight: '700' },
  statusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
