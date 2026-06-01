import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, weekData, errorPatterns } from '../constants/theme';
import { PrimaryButton } from '../components/UI';
import { generateAdminReport } from '../utils/pdf';

export default function ReportsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Class Reports</Text>
          <Text style={styles.headerSub}>Administration use only • Anonymous data</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* CLASS HEADER */}
        <View style={styles.classCard}>
          <Text style={styles.classTitle}>Class 5-B  •  Braille Literacy</Text>
          <Text style={styles.classPeriod}>May 2026  •  Week 3 of 4</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.accent3 }]}>84%</Text>
              <Text style={styles.statLabel}>Class Avg</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.accent }]}>+12%</Text>
              <Text style={styles.statLabel}>vs Last Week</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.accent4 }]}>3</Text>
              <Text style={styles.statLabel}>Need Support</Text>
            </View>
          </View>
        </View>

        {/* BAR CHART */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈  Class Progress — Last 6 Weeks</Text>
          <View style={styles.barChart}>
            {weekData.scores.map((score, i) => {
              const h = Math.round((score / 100) * 80);
              const c = score >= 80 ? colors.accent3 : score >= 65 ? colors.accent4 : colors.accent2;
              return (
                <View key={i} style={styles.barGroup}>
                  <Text style={[styles.barScore, { color: c }]}>{score}</Text>
                  <View style={[styles.bar, { height: h, backgroundColor: c }]} />
                  <Text style={styles.barLabel}>{weekData.labels[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ERROR PATTERNS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️  Common Error Patterns (Class-wide)</Text>
          <View style={{ gap: 14, marginTop: 4 }}>
            {errorPatterns.map((e, i) => (
              <View key={i}>
                <View style={styles.errorRow}>
                  <Text style={styles.errorLabel}>{e.label}</Text>
                  <Text style={[styles.errorPct, { color: e.color }]}>{e.pct}%</Text>
                </View>
                <View style={styles.errorBar}>
                  <View style={[styles.errorFill, { width: `${e.pct}%`, backgroundColor: e.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* PRIVACY NOTE */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            🔒 <Text style={{ color: colors.text, fontWeight: '700' }}>Privacy protected. </Text>
            This report contains only aggregate class data. No individual student names or scores included. Safe to share with school administration.
          </Text>
        </View>

        <PrimaryButton
  title="📊  Export Admin Report PDF"
  onPress={async () => {
    const result = await generateAdminReport({
      classData: {
        className: 'Class 5-B • Braille Literacy',
        period: 'May 2026 • Week 3 of 4',
        avgScore: '84%',
        improvement: '+12%',
        needSupport: 3,
        totalScans: 48,
      },
      errorPatterns,
      weekData,
    });
    if (!result.success) Alert.alert('Error', 'PDF generation failed: ' + result.error);
  }}
  style={{ marginBottom: 10 }}
/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerSub:   { fontSize: 12, color: colors.text2, marginTop: 1 },
  content: { padding: 20, paddingBottom: 40 },

  classCard:   { backgroundColor: '#1a1a35', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', padding: 20, marginBottom: 16 },
  classTitle:  { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  classPeriod: { fontSize: 12, color: colors.text2, marginBottom: 16 },
  statsRow:    { flexDirection: 'row', alignItems: 'center' },
  stat:        { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 10, color: colors.text2, marginTop: 3 },
  divider:     { width: 1, height: 36, backgroundColor: colors.border },

  card:      { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 16 },

  barChart:  { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  barGroup:  { flex: 1, alignItems: 'center', gap: 4 },
  barScore:  { fontSize: 9, fontWeight: '700' },
  bar:       { width: '100%', borderRadius: 5 },
  barLabel:  { fontSize: 9, color: colors.text2, textAlign: 'center' },

  errorRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  errorLabel:{ fontSize: 12, color: colors.text, flex: 1 },
  errorPct:  { fontSize: 12, fontWeight: '700' },
  errorBar:  { height: 6, backgroundColor: colors.surface3, borderRadius: 4, overflow: 'hidden' },
  errorFill: { height: '100%', borderRadius: 4 },

  privacyBox:  { backgroundColor: 'rgba(67,233,123,0.05)', borderWidth: 1, borderColor: 'rgba(67,233,123,0.2)', borderRadius: 14, padding: 14, marginBottom: 16 },
  privacyText: { fontSize: 12, color: colors.text2, lineHeight: 18 },
});
