import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, recentScans } from '../constants/theme';
import { StatCard, SectionTitle, ScoreChip, Badge } from '../components/UI';

const ACTION_CARDS = [
  { key:'Scanner',  icon:'📷', title:'Scan Braille',  sub:'Point camera at homework',  bg:'#1a1a35', border:'rgba(108,99,255,0.5)' },
  { key:'Grade',    icon:'✏️',  title:'Grade Mode',    sub:'Mark & review errors',       bg:'#1a2a1a', border:'rgba(67,233,123,0.4)'  },
  { key:'Students', icon:'👥', title:'Students',      sub:'Manage class roster',         bg:'#2a1a1a', border:'rgba(255,101,132,0.4)' },
  { key:'Reports',  icon:'📊', title:'Reports',       sub:'Admin progress data',         bg:'#1a2a2a', border:'rgba(247,151,30,0.4)'  },
  { key:'History', icon:'🕐', title:'Scan History', sub:'View all past scans', bg:'#1a1a2a', border:'rgba(108,99,255,0.3)' },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* HERO */}
        <View style={styles.hero}>
         
          <Text style={styles.heroTitle}>Dot Sense{'\n'}Teacher Assistant</Text>
          <Text style={styles.heroSub}>
            Scan, understand, and privately grade student Braille homework
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <StatCard num="12"  label="Students" />
          <StatCard num="48"  label="Scans This Week" color={colors.accent3} />
          <StatCard num="84%" label="Class Avg"       color={colors.accent4} />
        </View>

        {/* QUICK ACTIONS */}
        <SectionTitle>Quick Actions</SectionTitle>
        <View style={styles.actionGrid}>
          {ACTION_CARDS.map(card => (
            <TouchableOpacity
              key={card.key}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(card.key)}
              style={[styles.actionCard, { backgroundColor: card.bg, borderColor: card.border }]}
            >
              <Text style={styles.actionIcon}>{card.icon}</Text>
              <Text style={styles.actionTitle}>{card.title}</Text>
              <Text style={styles.actionSub}>{card.sub}</Text>
              <View style={styles.actionArrow}>
                <Text style={{ fontSize: 13, color: colors.text2 }}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT SCANS */}
        <SectionTitle>Recent Scans</SectionTitle>
        <View style={styles.recentList}>
          {recentScans.map(scan => (
            <TouchableOpacity
              key={scan.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Grade')}
              style={styles.recentItem}
            >
              <View style={styles.recentDot}>
                <Text style={{ fontSize: 20 }}>📄</Text>
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{scan.studentName}</Text>
                <Text style={styles.recentMeta}>{scan.homework} • {scan.time}</Text>
              </View>
              <ScoreChip score={scan.score} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  hero:      { paddingTop: 20, paddingBottom: 24 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: colors.text, lineHeight: 42, marginTop: 12, marginBottom: 8 },
  heroSub:   { fontSize: 14, color: colors.text2, lineHeight: 21 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  actionCard: {
    width: '47%', minHeight: 145, borderRadius: radius.lg,
    borderWidth: 1, padding: 16, position: 'relative',
  },
  actionIcon:  { fontSize: 28, marginBottom: 8 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  actionSub:   { fontSize: 10, color: colors.text2, marginTop: 3, lineHeight: 14 },
  actionArrow: {
    position: 'absolute', bottom: 12, right: 12,
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  recentList: { gap: 10 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  recentDot:  { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '600', color: colors.text },
  recentMeta: { fontSize: 11, color: colors.text2, marginTop: 2 },
});
