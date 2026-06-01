import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../constants/theme';
import { getHistory, clearHistory } from '../utils/storage';
import { getScoreColor } from '../utils/api';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }

  function confirmClear() {
    Alert.alert(
      'Clear History',
      'Delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSub}>{history.length} scans saved</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading && (
          <Text style={styles.emptyText}>Loading...</Text>
        )}

        {!loading && history.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>
              Your scan history will appear here after you scan Braille homework.
            </Text>
          </View>
        )}

        {history.map((scan, i) => {
          const scoreColor = getScoreColor(scan.score || 0);
          return (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => navigation.navigate('Grade', { lines: scan.lines })}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardIcon}>
                  <Text style={{ fontSize: 20 }}>📄</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardStudent}>{scan.studentName || 'Unknown Student'}</Text>
                  <Text style={styles.cardMeta}>{scan.homework || 'Scan'}</Text>
                  <Text style={styles.cardDate}>{scan.date}</Text>
                  {scan.lines && scan.lines.length > 0 && (
                    <Text style={styles.cardPreview} numberOfLines={1}>
                      {scan.lines[0]}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.cardRight}>
                {scan.score !== undefined && (
                  <View style={[styles.scoreChip, { backgroundColor: scoreColor + '22' }]}>
                    <Text style={[styles.scoreChipText, { color: scoreColor }]}>
                      {scan.score}%
                    </Text>
                  </View>
                )}
                <Text style={styles.cardArrow}>→</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  clearBtn:    { backgroundColor: 'rgba(255,101,132,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,101,132,0.3)' },
  clearBtnText:{ fontSize: 12, color: colors.accent2, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },

  emptyBox:   { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptyText:  { fontSize: 13, color: colors.text2, textAlign: 'center', lineHeight: 20 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10 },
  cardLeft:    { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon:    { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo:    { flex: 1 },
  cardStudent: { fontSize: 13, fontWeight: '700', color: colors.text },
  cardMeta:    { fontSize: 11, color: colors.text2, marginTop: 2 },
  cardDate:    { fontSize: 10, color: colors.text2, marginTop: 2 },
  cardPreview: { fontSize: 11, color: colors.text2, marginTop: 4, fontStyle: 'italic' },
  cardRight:   { alignItems: 'flex-end', gap: 8 },
  scoreChip:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  scoreChipText: { fontSize: 12, fontWeight: '700' },
  cardArrow:   { fontSize: 14, color: colors.text2 },
});