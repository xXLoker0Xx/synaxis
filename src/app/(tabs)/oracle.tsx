import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { ArrowRight, Check, CircleAlert, Pause, Sparkles, Zap } from 'lucide-react-native';
import { format } from 'date-fns';
import { evaluateDecisionContext, type DecisionCategory, type DecisionContext } from '../../core/decisionEngine/decisionEngine';
import { saveDecision } from '../../data/decisionStorage';
import { useBioLunar } from '../../context/AppContext';
import { theme } from '../../theme';

const options: { id: DecisionCategory; title: string; subtitle: string }[] = [
  { id: 'FINANZAS_CONTRATOS', title: 'Finanzas y contratos', subtitle: 'Elegir, negociar, comprometer' },
  { id: 'CREATIVIDAD_IDEACION', title: 'Creatividad e ideación', subtitle: 'Explorar, diseñar, comenzar' },
  { id: 'COMUNICACION_CONFLICTO', title: 'Conversación difícil', subtitle: 'Acordar, expresar, escuchar' },
  { id: 'DESCANSO_RETIRO', title: 'Descanso y retiro', subtitle: 'Recuperar, pausar, desconectar' },
  { id: 'AUDITORIA_CIERRE', title: 'Auditoría y cierre', subtitle: 'Revisar, depurar, concluir' },
];

export default function DecisionOracleScreen() {
  const { coordinates } = useBioLunar();
  const [category, setCategory] = useState<DecisionCategory>('CREATIVIDAD_IDEACION');
  const [energy, setEnergy] = useState(3);
  const [result, setResult] = useState<DecisionContext | null>(null);
  const [savedMessage, setSavedMessage] = useState('');

  const evaluate = async () => {
    const now = new Date();
    const decision = evaluateDecisionContext({
      category,
      userEnergyLevel: energy,
      currentTime: now,
      lat: coordinates.latitude,
      lon: coordinates.longitude,
    });
    setResult(decision);
    setSavedMessage('');
    try {
      await saveDecision({ id: `${now.getTime()}`, category, createdAt: now.toISOString(), result: decision });
      setSavedMessage('Evaluación guardada en este dispositivo');
    } catch {
      setSavedMessage('No se pudo guardar la evaluación');
    }
  };

  const tone = result?.recommendationLevel === 'FAVORABLE' ? theme.mint : result?.recommendationLevel === 'PROCEDER_CON_CAUTELA' ? theme.amber : theme.rose;
  const ResultIcon = result?.recommendationLevel === 'FAVORABLE' ? Check : result?.recommendationLevel === 'PROCEDER_CON_CAUTELA' ? CircleAlert : Pause;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>BRÚJULA DE DECISIONES</Text>
      <Text style={styles.title}>¿Es buen momento?</Text>
      <Text style={styles.intro}>Combina tu energía autopercibida y el contexto solar con una lectura lunar simbólica. Tú conservas la decisión.</Text>

      <Text style={styles.sectionTitle}>¿Qué tienes entre manos?</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.id === category;
          return (
            <Pressable key={option.id} onPress={() => setCategory(option.id)} style={[styles.option, selected && styles.optionSelected]} accessibilityRole="radio" accessibilityState={{ selected }}>
              <View style={[styles.optionMark, selected && styles.optionMarkSelected]}>{selected ? <Check size={12} color={theme.background} /> : null}</View>
              <View style={styles.optionCopy}><Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{option.title}</Text><Text style={styles.optionSubtitle}>{option.subtitle}</Text></View>
              <ArrowRight size={15} color={selected ? theme.accent : '#4F5867'} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.energyHeader}><View><Text style={styles.sectionTitle}>Tu energía ahora</Text><Text style={styles.helper}>Batería autopercibida · no es un dato biométrico</Text></View><View style={styles.energyBadge}><Zap size={13} color={theme.accent} /><Text style={styles.energyNumber}>{energy}/5</Text></View></View>
      <Slider
        minimumValue={1}
        maximumValue={5}
        step={1}
        value={energy}
        onValueChange={setEnergy}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.border}
        thumbTintColor={theme.accent}
        accessibilityLabel="Nivel de energía percibido de uno a cinco"
        style={styles.slider}
      />
      <View style={styles.scaleLabels}><Text style={styles.helper}>MUY BAJA</Text><Text style={styles.helper}>MUY ALTA</Text></View>

      <Pressable style={styles.evaluateButton} onPress={evaluate} accessibilityRole="button">
        <Sparkles size={17} color={theme.background} /><Text style={styles.evaluateText}>Evaluar momento</Text><ArrowRight size={17} color={theme.background} />
      </Pressable>

      {result && <View style={styles.resultCard}>
        <View style={styles.resultHeading}>
          <View style={[styles.resultIcon, { backgroundColor: `${tone}20` }]}><ResultIcon size={18} color={tone} /></View>
          <View style={styles.resultHeadingCopy}><Text style={styles.resultEyebrow}>LECTURA DE HOY · {format(new Date(), 'HH:mm')}</Text><Text style={[styles.resultLevel, { color: tone }]}>{result.recommendationLevel.replaceAll('_', ' ')}</Text></View>
          <Text style={[styles.score, { color: tone }]}>{result.viabilityScore}<Text style={styles.scoreOf}>/100</Text></Text>
        </View>
        <View style={styles.scoreTrack}><View style={[styles.scoreFill, { width: `${result.viabilityScore}%`, backgroundColor: tone }]} /></View>
        <View style={styles.resultBlock}><Text style={styles.resultLabel}>CONTEXTO BIOLÓGICO</Text><Text style={styles.resultBody}>{result.biologicalContext}</Text></View>
        <View style={styles.resultBlock}><Text style={styles.resultLabel}>PREGUNTA ARQUETÍPICA</Text><Text style={styles.resultBody}>{result.archetypalContext}</Text></View>
        <View style={styles.window}><Text style={styles.windowLabel}>VENTANA ORIENTATIVA</Text><Text style={styles.windowValue}>{result.bestWindowToday}</Text></View>
        {savedMessage ? <Text style={styles.saved}>{savedMessage}</Text> : null}
      </View>}
      <Text style={styles.disclaimer}>El puntaje es una heurística de reflexión; las fases lunares no predicen resultados. No es consejo financiero, médico ni legal.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.background }, content: { paddingHorizontal: 22, paddingTop: 59, paddingBottom: 30 }, eyebrow: { color: theme.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1.6 }, title: { color: theme.text, fontSize: 29, fontWeight: '600', letterSpacing: -0.6, marginTop: 8 }, intro: { color: theme.muted, fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 330 },
  sectionTitle: { color: theme.text, fontSize: 15, fontWeight: '600' }, options: { gap: 8, marginTop: 12 }, option: { minHeight: 61, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, optionSelected: { borderColor: '#8B7756', backgroundColor: '#191A1C' }, optionMark: { width: 20, height: 20, borderRadius: 7, borderWidth: 1, borderColor: '#465061', justifyContent: 'center', alignItems: 'center' }, optionMarkSelected: { borderColor: theme.accent, backgroundColor: theme.accent }, optionCopy: { flex: 1 }, optionTitle: { color: '#D4D6DC', fontSize: 12, fontWeight: '600' }, optionTitleSelected: { color: theme.text }, optionSubtitle: { color: theme.muted, fontSize: 10, marginTop: 3 },
  energyHeader: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, helper: { color: theme.muted, fontSize: 9, marginTop: 5 }, energyBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: theme.elevated }, energyNumber: { color: theme.text, fontSize: 12, fontWeight: '700' }, slider: { height: 36, marginHorizontal: -7, marginTop: 8 }, scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  evaluateButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: theme.accent, borderRadius: 14, height: 52, marginTop: 22 }, evaluateText: { color: theme.background, fontSize: 13, fontWeight: '700' }, resultCard: { backgroundColor: theme.surface, borderRadius: 20, borderColor: theme.border, borderWidth: 1, padding: 16, marginTop: 17 }, resultHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, resultIcon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, resultHeadingCopy: { flex: 1 }, resultEyebrow: { color: theme.muted, fontSize: 8, letterSpacing: 1 }, resultLevel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 }, score: { fontSize: 22, fontWeight: '700' }, scoreOf: { fontSize: 10, color: theme.muted }, scoreTrack: { height: 4, borderRadius: 4, backgroundColor: theme.border, marginTop: 14, overflow: 'hidden' }, scoreFill: { height: 4, borderRadius: 4 }, resultBlock: { marginTop: 17 }, resultLabel: { color: theme.accent, fontSize: 8, letterSpacing: 1.2, fontWeight: '700' }, resultBody: { color: '#C2C6D0', fontSize: 11, lineHeight: 17, marginTop: 6 }, window: { backgroundColor: theme.elevated, borderRadius: 12, padding: 12, marginTop: 16 }, windowLabel: { color: theme.muted, fontSize: 8, letterSpacing: 1 }, windowValue: { color: theme.text, fontSize: 14, fontWeight: '600', marginTop: 5 }, saved: { color: theme.mint, fontSize: 9, marginTop: 10 }, disclaimer: { color: '#667080', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 18, paddingHorizontal: 8 },
});
