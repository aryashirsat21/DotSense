import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal,
} from 'react-native';
import { colors, radius } from '../constants/theme';

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function PrimaryButton({ title, onPress, icon, style, disabled }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryBtn, disabled && { opacity: 0.5 }, style]}
    >
      {icon && <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>}
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, icon, style }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.outlineBtn, style]}>
      {icon && <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>}
      <Text style={styles.outlineBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function IconButton({ icon, onPress, style, active }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.iconBtn,
        active && { backgroundColor: colors.accent, borderColor: colors.accent },
        style,
      ]}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </TouchableOpacity>
  );
}

export function Badge({ label, color = colors.accent }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function ScoreChip({ score }) {
  const color = score >= 80 ? colors.accent3 : score >= 65 ? colors.accent4 : colors.accent2;
  return (
    <View style={[styles.scoreChip, { backgroundColor: color + '22' }]}>
      <Text style={[styles.scoreChipText, { color }]}>{score}%</Text>
    </View>
  );
}

export function ProcessingModal({ visible, step }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.processingOverlay}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.processingTitle}>Analyzing Braille...</Text>
        <Text style={styles.processingStep}>{step}</Text>
        <View style={styles.processingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.processingDot, { opacity: 0.3 + i * 0.35 }]} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

export function ProgressBar({ value, color, style }) {
  return (
    <View style={[styles.progressWrap, style]}>
      <View style={[styles.progressFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function StatCard({ num, label, color = colors.accent }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, { color }]}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.text2,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
  },
  primaryBtn: {
    height: 54, borderRadius: radius.md, backgroundColor: colors.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  outlineBtn: {
    height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  iconBtn: {
    width: 50, height: 50, borderRadius: radius.sm,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  scoreChip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  scoreChipText: { fontSize: 13, fontWeight: '700' },
  processingOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  processingTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  processingStep:  { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },
  processingDots:  { flexDirection: 'row', gap: 6, marginTop: 4 },
  processingDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  progressWrap:    { height: 5, backgroundColor: colors.surface3, borderRadius: 4, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 4 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center',
  },
  statNum:  { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.text2, marginTop: 2, fontWeight: '500', textAlign: 'center' },
});
