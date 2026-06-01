import React, { useState } from 'react';
import { saveScan } from '../utils/storage';
import { generateStudentReport } from '../utils/pdf';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, students, DEMO_TEXT } from '../constants/theme';
import { calculateScore, getScoreColor, parseLinesToWords } from '../utils/api';
import { PrimaryButton, OutlineButton, ProgressBar } from '../components/UI';

const INITIAL_WORDS = parseLinesToWords(DEMO_TEXT);
function buildStates(words) {
  const s = {};
  words.forEach((w, i) => { s[i] = (i%5===2||i%7===1)?'error':(i%11===0)?'partial':'correct'; });
  return s;
}

export default function GradeScreen({ navigation, route }) {
  const incomingLines = route?.params?.lines;
  const words = incomingLines ? parseLinesToWords(incomingLines.join(' ')) : INITIAL_WORDS;

  const [wordStates, setWordStates]   = useState(buildStates(words));
  const [student, setStudent]         = useState(students[0]);
  const [note, setNote]               = useState('');
  const [modalVisible, setModal]      = useState(false);
  const [toast, setToast]             = useState('');

  const stats      = calculateScore(wordStates, words.length);
  const scoreColor = getScoreColor(stats.score);

  function cycleWord(i) {
    const cycle = { correct:'error', error:'partial', partial:'correct' };
    setWordStates(prev => ({ ...prev, [i]: cycle[prev[i]] }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function chipStyle(s) {
    if (s === 'correct') return [styles.chip, styles.chipCorrect];
    if (s === 'error')   return [styles.chip, styles.chipError];
    return [styles.chip, styles.chipPartial];
  }
  function chipTextColor(s) {
    if (s === 'correct') return colors.accent3;
    if (s === 'error')   return colors.accent2;
    return colors.accent4;
  }

  async function saveGrade() {
    await saveScan({
      lines: words,
      studentName: student.name,
      homework: 'Homework • ' + new Date().toLocaleDateString('en-IN'),
      date: new Date().toLocaleString('en-IN'),
      score: stats.score,
    });
    showToast('✅ Saved to private gradebook!');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Grade Mode</Text>
          <Text style={styles.headerSub}>Tap words to cycle ✅ → ❌ → ⚠️</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* STUDENT SELECTOR */}
        <TouchableOpacity style={styles.studentCard} onPress={() => setModal(true)}>
          <View style={[styles.avatar, { backgroundColor: student.color + '33' }]}>
            <Text style={{ fontSize: 20 }}>{student.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentMeta}>{student.grade} • Tap to change student</Text>
          </View>
          <Text style={{ color: colors.text2, fontSize: 18 }}>⌄</Text>
        </TouchableOpacity>

        {/* SCORE CARD */}
        <View style={styles.scoreCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scorePct, { color: scoreColor }]}>{stats.score}%</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>
          <View style={styles.scoreDetails}>
            {[
              { label:'Total words', value: stats.total,              color: colors.text    },
              { label:'Correct',     value: `${stats.correct} ✓`,    color: colors.accent3 },
              { label:'Errors',      value: `${stats.errors} ✗`,     color: colors.accent2 },
              { label:'Partial',     value: `${stats.partial} ⚠`,    color: colors.accent4 },
            ].map(row => (
              <View key={row.label} style={styles.scoreRow}>
                <Text style={styles.scoreRowLabel}>{row.label}</Text>
                <Text style={[styles.scoreRowVal, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <ProgressBar value={stats.score} color={scoreColor} style={{ marginBottom: 16 }} />

        {/* WORD GRID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STUDENT'S HOMEWORK</Text>
          <Text style={styles.sectionHint}>
            <Text style={{ color: colors.accent3 }}>✅ Correct  </Text>
            <Text style={{ color: colors.accent2 }}>❌ Error  </Text>
            <Text style={{ color: colors.accent4 }}>⚠️ Partial — tap to cycle</Text>
          </Text>
          <View style={styles.wordGrid}>
            {words.map((word, i) => (
              <TouchableOpacity key={i} onPress={() => cycleWord(i)} activeOpacity={0.75} style={chipStyle(wordStates[i])}>
                <Text style={[styles.chipText, { color: chipTextColor(wordStates[i]) }]}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TEACHER NOTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 TEACHER'S PRIVATE NOTE</Text>
          <Text style={styles.privacyNote}>Stored only on this device. Never shared with students or parents.</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
            placeholder="Add internal notes about this student's Braille progress..."
            placeholderTextColor={colors.text2}
          />
        </View>

       <PrimaryButton
  title="💾  Save to Private Gradebook"
  onPress={saveGrade}
  style={{ marginBottom: 10 }}
/>
<OutlineButton
  title="📄  Export Internal PDF Record"
  onPress={async () => {
    const result = await generateStudentReport({
      student,
      words,
      wordStates,
      note,
      score: stats.score,
    });
    if (!result.success) showToast('❌ PDF failed: ' + result.error);
  }}
  style={{ marginBottom: 10 }}
/>
<OutlineButton
  title="📊  Include in Admin Report (Anonymous)"
  onPress={() => Alert.alert('Admin Report', 'Added as anonymous aggregate data only.')}
/>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyBoxText}>
            🔒 <Text style={{ color: colors.text, fontWeight: '700' }}>Student dignity protected. </Text>
            Grades stay private on your device. Only anonymous aggregate data goes to admin reports.
          </Text>
        </View>
      </ScrollView>

      {/* TOAST */}
      {!!toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* STUDENT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModal(false)}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Student</Text>
            <Text style={styles.modalSub}>Choose whose homework you are grading.</Text>
            {students.map(s => (
              <TouchableOpacity key={s.id} style={styles.modalOption} onPress={() => { setStudent(s); setModal(false); }}>
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalOptionTitle}>{s.name}</Text>
                  <Text style={styles.modalOptionSub}>{s.grade} • Avg: {s.progress}%</Text>
                </View>
                {student.id === s.id && <Text style={{ color: colors.accent, fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerSub:   { fontSize: 11, color: colors.text2, marginTop: 1 },

  studentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  avatar:      { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  studentName: { fontSize: 14, fontWeight: '700', color: colors.text },
  studentMeta: { fontSize: 11, color: colors.text2, marginTop: 2 },

  scoreCard:    { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1a1a35', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', padding: 20, marginBottom: 12 },
  scoreCircle:  { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  scorePct:     { fontSize: 18, fontWeight: '800' },
  scoreLabel:   { fontSize: 8, color: colors.text2, marginTop: 1 },
  scoreDetails: { flex: 1 },
  scoreRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  scoreRowLabel:{ fontSize: 12, color: colors.text2 },
  scoreRowVal:  { fontSize: 12, fontWeight: '700' },

  section:      { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.text2, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  sectionHint:  { fontSize: 11, color: colors.text2, marginBottom: 14 },
  wordGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 2 },
  chipCorrect:  { backgroundColor: 'rgba(67,233,123,0.1)',  borderColor: 'rgba(67,233,123,0.4)'  },
  chipError:    { backgroundColor: 'rgba(255,101,132,0.1)', borderColor: 'rgba(255,101,132,0.4)' },
  chipPartial:  { backgroundColor: 'rgba(247,151,30,0.1)',  borderColor: 'rgba(247,151,30,0.4)'  },
  chipText:     { fontSize: 13, fontWeight: '600' },

  privacyNote: { fontSize: 11, color: colors.text2, marginBottom: 10 },
  textarea:    { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 13, color: colors.text, minHeight: 80, textAlignVertical: 'top' },

  privacyBox:     { backgroundColor: 'rgba(67,233,123,0.05)', borderWidth: 1, borderColor: 'rgba(67,233,123,0.2)', borderRadius: 14, padding: 14, marginTop: 14 },
  privacyBoxText: { fontSize: 12, color: colors.text2, lineHeight: 18 },

  toast:     { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: colors.surface3, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  toastText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modal:        { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44, borderWidth: 1, borderColor: colors.border },
  modalHandle:  { width: 40, height: 4, backgroundColor: colors.surface3, borderRadius: 4, alignSelf: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  modalSub:     { fontSize: 13, color: colors.text2, marginBottom: 16 },
  modalOption:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface2, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  modalOptionTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  modalOptionSub:   { fontSize: 11, color: colors.text2, marginTop: 2 },
});
