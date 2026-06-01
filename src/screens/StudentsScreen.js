import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, students } from '../constants/theme';
import { getScoreColor } from '../utils/api';

export default function StudentsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Students</Text>
          <Text style={styles.headerSub}>{students.length} students enrolled</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {students.map(s => {
          const c = getScoreColor(s.progress);
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.85}
              onPress={() => Alert.alert(s.name, `Grade: ${s.grade}\nAverage: ${s.progress}%\nScans this week: ${s.scans}`)}
              style={styles.card}
            >
              <View style={[styles.avatar, { backgroundColor: s.color + '33' }]}>
                <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.meta}>{s.grade} • {s.scans} scans this week</Text>
                <View style={styles.progressWrap}>
                  <View style={[styles.progressFill, { width: `${s.progress}%`, backgroundColor: c }]} />
                </View>
              </View>
              <View style={styles.right}>
                <Text style={[styles.pct, { color: c }]}>{s.progress}%</Text>
                <Text style={styles.rightLabel}>avg</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Coming Soon', 'Add student feature in next release!')}>
          <Text style={styles.addBtnText}>＋  Add New Student</Text>
        </TouchableOpacity>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            🔒 <Text style={{ color: colors.text, fontWeight: '700' }}>Privacy first. </Text>
            Student progress data stays on this device. No individual scores are shared externally.
          </Text>
        </View>
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

  card:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info:   { flex: 1 },
  name:   { fontSize: 14, fontWeight: '700', color: colors.text },
  meta:   { fontSize: 11, color: colors.text2, marginTop: 2 },
  progressWrap: { marginTop: 6, height: 4, width: 100, backgroundColor: colors.surface3, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  right:      { alignItems: 'flex-end' },
  pct:        { fontSize: 16, fontWeight: '800' },
  rightLabel: { fontSize: 10, color: colors.text2, marginTop: 1 },

  addBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(108,99,255,0.3)', borderRadius: radius.sm, padding: 16, marginTop: 4, marginBottom: 16 },
  addBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },

  privacyBox:  { backgroundColor: 'rgba(67,233,123,0.05)', borderWidth: 1, borderColor: 'rgba(67,233,123,0.2)', borderRadius: 14, padding: 14 },
  privacyText: { fontSize: 12, color: colors.text2, lineHeight: 18 },
});
