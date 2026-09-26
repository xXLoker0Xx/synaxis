import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, Check, Moon, Sun } from 'lucide-react-native';
import { readDailyLogs, saveDailyLog, type DailyLog } from '../../data/journalStorage';
import { theme } from '../../theme';

export default function DailyLogScreen() {
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sunlightMinutes, setSunlightMinutes] = useState(20);
  const [reflection, setReflection] = useState('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    readDailyLogs().then((entries) => {
      setLogs(entries);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysLog = entries.find((entry) => entry.date === today);
      if (todaysLog) {
        setSleepHours(todaysLog.sleepHours);
        setSunlightMinutes(todaysLog.sunlightMinutes);
        setReflection(todaysLog.reflection);
      }
    }).catch(() => undefined);
  }, []);

  const save = async () => {
    const now = new Date();
    const entry: DailyLog = {
      id: format(now, 'yyyy-MM-dd'),
      date: format(now, 'yyyy-MM-dd'),
      sleepHours,
      sunlightMinutes,
      reflection: reflection.trim(),
    };
    try {
      const updated = await saveDailyLog(entry);
      setLogs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch {
      Alert.alert('No se guardó', 'Comprueba el espacio disponible e inténtalo de nuevo.');
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>OBSERVACIÓN PERSONAL</Text>
      <Text style={styles.title}>Diario diario</Text>
      <Text style={styles.intro}>{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}. Registra datos sencillos para reconocer patrones propios con el tiempo.</Text>

      <View style={styles.fieldCard}>
        <View style={styles.fieldHeading}><View style={[styles.iconBox, { backgroundColor: '#29243A' }]}><Moon size={17} color="#B7A3DF" /></View><View style={styles.fieldHeadingCopy}><Text style={styles.fieldTitle}>Sueño</Text><Text style={styles.fieldHint}>¿Cuánto dormiste?</Text></View><Text style={styles.fieldValue}>{sleepHours.toFixed(1)}<Text style={styles.unit}> h</Text></Text></View>
        <Slider minimumValue={0} maximumValue={12} step={0.5} value={sleepHours} onValueChange={setSleepHours} minimumTrackTintColor="#B7A3DF" maximumTrackTintColor={theme.border} thumbTintColor="#B7A3DF" accessibilityLabel="Horas de sueño" style={styles.slider} />
        <View style={styles.scale}><Text style={styles.fieldHint}>0 h</Text><Text style={styles.fieldHint}>12 h</Text></View>
      </View>

      <View style={styles.fieldCard}>
        <View style={styles.fieldHeading}><View style={[styles.iconBox, { backgroundColor: '#26352F' }]}><Sun size={17} color={theme.mint} /></View><View style={styles.fieldHeadingCopy}><Text style={styles.fieldTitle}>Luz exterior</Text><Text style={styles.fieldHint}>Exposición recibida hoy</Text></View><Text style={styles.fieldValue}>{Math.round(sunlightMinutes)}<Text style={styles.unit}> min</Text></Text></View>
        <Slider minimumValue={0} maximumValue={180} step={5} value={sunlightMinutes} onValueChange={setSunlightMinutes} minimumTrackTintColor={theme.mint} maximumTrackTintColor={theme.border} thumbTintColor={theme.mint} accessibilityLabel="Minutos de exposición a luz exterior" style={styles.slider} />
        <View style={styles.scale}><Text style={styles.fieldHint}>0 min</Text><Text style={styles.fieldHint}>3 h</Text></View>
      </View>

      <View style={styles.noteCard}>
        <View style={styles.noteHeading}><BookOpen size={16} color={theme.accent} /><Text style={styles.fieldTitle}>Nota de reflexión</Text></View>
        <Text style={styles.fieldHint}>¿Cómo estuvo tu ánimo, atención o energía?</Text>
        <TextInput value={reflection} onChangeText={setReflection} multiline maxLength={700} textAlignVertical="top" placeholder="Escribe sin juzgar; una observación concreta basta…" placeholderTextColor="#697282" style={styles.input} accessibilityLabel="Nota personal de reflexión" />
        <Text style={styles.charCount}>{reflection.length}/700</Text>
      </View>

      <Pressable style={styles.saveButton} onPress={save} accessibilityRole="button">
        <Check size={16} color={theme.background} /><Text style={styles.saveText}>{saved ? 'Guardado en este dispositivo' : 'Guardar registro de hoy'}</Text>
      </Pressable>

      <View style={styles.historyHeader}><Text style={styles.sectionTitle}>Entradas recientes</Text><Text style={styles.historyCount}>{logs.length} EN TOTAL</Text></View>
      {logs.length === 0 ? <View style={styles.empty}><Text style={styles.emptyText}>Tus registros aparecerán aquí. Solo se guardan en tu dispositivo.</Text></View> : logs.slice(0, 4).map((log) => <View key={log.id} style={styles.historyCard}>
        <Text style={styles.historyDate}>{format(new Date(`${log.date}T12:00:00`), 'd MMM', { locale: es })}</Text>
        <View style={styles.historyMetrics}><Text style={styles.historyMetric}><Moon size={11} color="#B7A3DF" /> {log.sleepHours} h</Text><Text style={styles.historyMetric}><Sun size={11} color={theme.mint} /> {log.sunlightMinutes} min</Text></View>
        {log.reflection ? <Text numberOfLines={2} style={styles.historyNote}>{log.reflection}</Text> : null}
      </View>)}
      <Text style={styles.disclaimer}>El diario es privado y local. Correlación no implica causalidad: la fase lunar no explica por sí sola el estado de ánimo.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.background }, content: { paddingHorizontal: 22, paddingTop: 59, paddingBottom: 30 }, eyebrow: { color: theme.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1.6 }, title: { color: theme.text, fontSize: 29, fontWeight: '600', letterSpacing: -0.6, marginTop: 8 }, intro: { color: theme.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  fieldCard: { padding: 15, backgroundColor: theme.surface, borderRadius: 17, borderColor: theme.border, borderWidth: 1, marginTop: 15 }, fieldHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, iconBox: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, fieldHeadingCopy: { flex: 1 }, fieldTitle: { color: theme.text, fontSize: 13, fontWeight: '600' }, fieldHint: { color: theme.muted, fontSize: 10, marginTop: 4 }, fieldValue: { color: theme.text, fontSize: 17, fontWeight: '700' }, unit: { color: theme.muted, fontSize: 10, fontWeight: '500' }, slider: { height: 38, marginHorizontal: -7, marginTop: 10 }, scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  noteCard: { padding: 15, backgroundColor: theme.surface, borderRadius: 17, borderColor: theme.border, borderWidth: 1, marginTop: 15 }, noteHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { minHeight: 112, color: theme.text, backgroundColor: theme.elevated, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 12, lineHeight: 18, marginTop: 12 }, charCount: { color: theme.muted, fontSize: 9, alignSelf: 'flex-end', marginTop: 6 },
  saveButton: { height: 49, borderRadius: 14, backgroundColor: theme.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 17 }, saveText: { color: theme.background, fontSize: 12, fontWeight: '700' }, historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 27, marginBottom: 10 }, sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '600' }, historyCount: { color: theme.muted, fontSize: 8, letterSpacing: 1 }, empty: { padding: 17, backgroundColor: theme.surface, borderRadius: 14, borderColor: theme.border, borderWidth: 1 }, emptyText: { color: theme.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' }, historyCard: { padding: 13, backgroundColor: theme.surface, borderRadius: 14, borderColor: theme.border, borderWidth: 1, marginBottom: 8 }, historyDate: { color: theme.text, fontSize: 12, fontWeight: '600' }, historyMetrics: { flexDirection: 'row', gap: 16, marginTop: 8 }, historyMetric: { color: theme.muted, fontSize: 10, gap: 5 }, historyNote: { color: theme.muted, fontSize: 10, lineHeight: 15, marginTop: 8 }, disclaimer: { color: '#667080', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 17, paddingHorizontal: 8 },
});
