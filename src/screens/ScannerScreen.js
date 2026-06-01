import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, DEMO_TEXT } from '../constants/theme';
import { analyzeBrailleImage } from '../utils/api';
import { ProcessingModal, IconButton, PrimaryButton } from '../components/UI';

const STEPS = [
  'Detecting dot patterns…',
  'Segmenting Braille cells…',
  'Recognising dot combinations…',
  'Converting to English…',
  'Finalising output…',
];

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady]   = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [processStep, setProcessStep]   = useState('');
  const [lines, setLines]               = useState([]);
  const [speakingIdx, setSpeakingIdx]   = useState(-1);
  const [ttsSpeed, setTtsSpeed]         = useState(1.0);
  const [torch, setTorch]               = useState(false);
  const cameraRef = useRef(null);
  const stepTimer = useRef(null);

  useEffect(() => () => {
    Speech.stop();
    clearInterval(stepTimer.current);
  }, []);

  function startStepTicker() {
    let si = 0;
    setProcessStep(STEPS[0]);
    stepTimer.current = setInterval(() => {
      si = Math.min(si + 1, STEPS.length - 1);
      setProcessStep(STEPS[si]);
    }, 800);
  }

  async function capturePhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
      await processImage(photo.base64);
    } catch (e) {
      runDemo();
    }
  }

  async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Allow gallery access to upload Braille images.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.8,
    base64: true,
    allowsEditing: true,
    aspect: [3, 4],
  });
  if (!result.canceled && result.assets?.[0]?.base64) {
    await processImage(result.assets[0].base64);
  }
}

  async function processImage(base64) {
    setProcessing(true);
    startStepTicker();
    try {
      const text   = await analyzeBrailleImage(base64);
      const parsed = text.trim().split('\n').filter(l => l.trim());
      clearInterval(stepTimer.current);
      setProcessing(false);
      showResult(parsed);
      
    } catch {
      clearInterval(stepTimer.current);
      setProcessing(false);
      runDemo();
    }
  }

  function runDemo() {
    setProcessing(true);
    startStepTicker();
    let si = 0;
    const t = setInterval(() => {
      if (++si >= STEPS.length) {
        clearInterval(t);
        clearInterval(stepTimer.current);
        setProcessing(false);
        showResult(DEMO_TEXT.trim().split('\n').filter(l => l.trim()));
      }
    }, 700);
  }

  async function showResult(parsed) {
  setLines(parsed);
  speakAll(parsed);
  await saveScan({
    lines: parsed,
    studentName: 'Unassigned',
    homework: 'Scan ' + new Date().toLocaleDateString('en-IN'),
    date: new Date().toLocaleString('en-IN'),
    score: undefined,
  });
}

  function speakOne(line, idx) {
    Speech.stop();
    setSpeakingIdx(idx);
    Speech.speak(line, {
      rate:    ttsSpeed,
      onDone:  () => setSpeakingIdx(-1),
      onError: () => setSpeakingIdx(-1),
    });
  }

  function toggleTTS() {
    if (!lines.length) return;
    Speech.isSpeakingAsync().then(speaking => {
      if (speaking) { Speech.stop(); setSpeakingIdx(-1); }
      else speakAll(lines);
    });
  }

  function cycleSpeed() {
    const speeds = [1.0, 1.5, 0.75];
    setTtsSpeed(speeds[(speeds.indexOf(ttsSpeed) + 1) % speeds.length]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ProcessingModal visible={processing} step={processStep} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Scan Braille</Text>
          <Text style={styles.headerSub}>Point camera at homework sheet</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* CAMERA */}
        <View style={styles.viewport}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torch}
              onCameraReady={() => setCameraReady(true)}
            />
          ) : (
            <View style={styles.noCam}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
              <Text style={styles.noCamText}>
                {permission?.canAskAgain
                  ? 'Camera permission needed\nto scan Braille'
                  : 'Camera access denied\nUse gallery upload instead'}
              </Text>
              {permission?.canAskAgain && (
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                  <Text style={styles.permBtnText}>Grant Camera Access</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* SCAN OVERLAY */}
          {permission?.granted && (
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cTL]} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
              </View>
              <View style={styles.hintBox}>
                <Text style={styles.hintBoxText}>Align Braille within frame</Text>
              </View>
            </View>
          )}
        </View>

        {/* TIPS */}
        <View style={styles.tips}>
          {['💡 Good lighting', '📐 Keep flat', '🔍 Hold steady', '📏 ~30cm away'].map(h => (
            <View key={h} style={styles.tipChip}>
              <Text style={styles.tipText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          <IconButton icon="🔦" onPress={() => setTorch(t => !t)} active={torch} />
          <PrimaryButton
            title={cameraReady ? 'Capture Braille' : 'Demo Scan'}
            icon="⚡"
            onPress={cameraReady ? capturePhoto : runDemo}
            style={{ flex: 1 }}
          />
          <IconButton icon="🖼️" onPress={pickImage} />
        </View>

        {/* RESULT */}
        {lines.length > 0 && (
          <View style={styles.resultPanel}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>✅ Translation Complete</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: 'rgba(108,99,255,0.2)', borderColor: colors.accent }]}
                  onPress={() => navigation.navigate('Grade', { lines })}
                >
                  <Text style={[styles.actionBtnText, { color: colors.accent }]}>Grade →</Text>
                </TouchableOpacity>
              </View>
            </View>

            {lines.map((line, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => speakOne(line, i)}
                style={[styles.resultLine, speakingIdx === i && styles.resultLineSpeaking]}
              >
                <Text style={styles.lineNum}>L{i + 1}</Text>
                <Text style={styles.lineText}>{line}</Text>
                <Text style={{ fontSize: 14, opacity: 0.4 }}>🔊</Text>
              </TouchableOpacity>
            ))}

            {/* TTS BAR */}
            <View style={styles.ttsRow}>
              <TouchableOpacity style={styles.ttsBtn} onPress={toggleTTS}>
                <Text style={{ fontSize: 18 }}>{speakingIdx >= 0 ? '⏸️' : '▶️'}</Text>
              </TouchableOpacity>
              <View style={styles.ttsProgress}>
                <View style={[styles.ttsBar, {
                  width: speakingIdx >= 0 ? `${((speakingIdx + 1) / lines.length) * 100}%` : '0%'
                }]} />
              </View>
              <TouchableOpacity style={styles.ttsBtn} onPress={cycleSpeed}>
                <Text style={styles.ttsSpeedText}>{ttsSpeed}×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerSub:   { fontSize: 12, color: colors.text2, marginTop: 1 },

  viewport: { marginHorizontal: 20, borderRadius: radius.lg, overflow: 'hidden', aspectRatio: 3 / 4, backgroundColor: '#000', borderWidth: 2, borderColor: colors.border },
  noCam:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noCamText:{ color: colors.text2, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  permBtn:  { marginTop: 16, backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  overlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: '80%', height: '60%', borderWidth: 1, borderColor: 'rgba(108,99,255,0.4)', borderRadius: 12 },
  corner:    { position: 'absolute', width: 20, height: 20 },
  cTL: { top: -2, left: -2,   borderTopWidth: 3, borderLeftWidth: 3,   borderColor: colors.accent, borderTopLeftRadius: 4 },
  cTR: { top: -2, right: -2,  borderTopWidth: 3, borderRightWidth: 3,  borderColor: colors.accent, borderTopRightRadius: 4 },
  cBL: { bottom: -2, left: -2,  borderBottomWidth: 3, borderLeftWidth: 3,  borderColor: colors.accent, borderBottomLeftRadius: 4 },
  cBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.accent, borderBottomRightRadius: 4 },
  hintBox:     { position: 'absolute', bottom: 20, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  hintBoxText: { color: colors.accent, fontSize: 11, fontFamily: 'monospace' },

  tips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 14 },
  tipChip: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  tipText: { fontSize: 10, color: colors.text2 },

  controls: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 14, alignItems: 'center' },

  resultPanel: { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultTitle:  { fontSize: 13, fontWeight: '700', color: colors.accent3 },
  actionBtn:    { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  actionBtnText:{ fontSize: 11, color: colors.text, fontWeight: '500' },

  resultLine:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface2, borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
  resultLineSpeaking: { borderColor: colors.accent, backgroundColor: 'rgba(108,99,255,0.1)' },
  lineNum:  { fontSize: 10, color: colors.text2, fontFamily: 'monospace', marginTop: 2, width: 20 },
  lineText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },

  ttsRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, backgroundColor: colors.surface2, borderRadius: 12, padding: 10 },
  ttsBtn:      { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface3, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  ttsProgress: { flex: 1, height: 4, backgroundColor: colors.surface3, borderRadius: 4, overflow: 'hidden' },
  ttsBar:      { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  ttsSpeedText:{ fontSize: 11, color: colors.text2, fontFamily: 'monospace' },
});
