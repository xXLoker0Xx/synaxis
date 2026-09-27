import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Clock3, MapPin, Sun, Sunrise, Sunset } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoonDial } from '../../components/MoonDial';
import { AppMenu } from '../../components/AppMenu';
import { getCircadianTimeline, getLunarCycleState } from '../../core/astronomy/astronomy';
import { useBioLunar } from '../../context/AppContext';
import { theme } from '../../theme';

function timeLabel(value: Date | null): string {
  return value ? format(value, 'HH:mm') : '—';
}

export default function HomeScreen() {
  const { coordinates, locationStatus, requestLocation } = useBioLunar();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const moon = useMemo(() => getLunarCycleState(now), [now]);
  const sun = useMemo(() => getCircadianTimeline(coordinates.latitude, coordinates.longitude, now), [coordinates, now]);
  const nextSolarEvent = [sun.sunrise, sun.solarNoon, sun.sunset, sun.dusk]
    .filter((event): event is Date => event !== null && event.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const nextEventLabel = nextSolarEvent === sun.sunset ? 'Atardecer' : nextSolarEvent === sun.dusk ? 'Crepúsculo' : nextSolarEvent === sun.solarNoon ? 'Cénit solar' : 'Amanecer';
  const hoursToEvent = nextSolarEvent ? Math.max(0, Math.round((nextSolarEvent.getTime() - now.getTime()) / 3_600_000)) : null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>SISTEMA PERSONAL · {format(now, 'EEEE d MMMM', { locale: es }).toUpperCase()}</Text>
          <Text style={styles.title}>Synaxis</Text>
        </View>
        <AppMenu />
      </View>

      <View style={styles.locationRow}>
        <MapPin size={13} color={theme.muted} />
        <Text numberOfLines={1} style={styles.location}>{coordinates.label}</Text>
        <Pressable onPress={requestLocation} accessibilityRole="button" accessibilityLabel="Actualizar ubicación GPS" style={styles.locButton}>
          <Text style={styles.locButtonText}>GPS</Text>
        </Pressable>
      </View>
      <Text style={styles.locationStatus}>{locationStatus} · Los cálculos se realizan en el dispositivo</Text>

      <View style={styles.moonCard}>
        <View style={styles.moonLeft}>
          <View style={styles.moonCopy}>
            <Text style={styles.cardEyebrow}>CICLO LUNAR</Text>
            <Text style={styles.phase}>{moon.octant}</Text>
            <Text style={styles.phaseDescription}>Una lectura simbólica para observar, no para predecir.</Text>
            <View style={styles.pill}><Text style={styles.pillText}>{moon.zodiacSign.toUpperCase()} · TROPICAL</Text></View>
          </View>
          <View style={styles.moonStats}>
            <View><Text style={styles.statValue}>{Math.round(moon.illumination * 100)}%</Text><Text style={styles.statLabel}>ILUMINACIÓN</Text></View>
            <View><Text style={styles.statValue}>{moon.cycleDay.toFixed(1)}<Text style={styles.statSmall}> / 29.5</Text></Text><Text style={styles.statLabel}>DÍA DEL CICLO</Text></View>
          </View>
        </View>
        <MoonDial state={moon} />
      </View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Ritmo solar</Text><Text style={styles.sectionHint}>HOY · HORA LOCAL</Text></View>
      <View style={styles.solarCard}>
        <View style={styles.solarHeader}>
          <View><Text style={styles.cardEyebrow}>VENTANA DE LUZ DIURNA</Text><Text style={styles.solarHeadline}>{hoursToEvent === null ? 'El cielo marca otro ritmo' : `${nextEventLabel} en ${hoursToEvent} h`}</Text></View>
          <Clock3 size={18} color={theme.accent} />
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${sun.daylightProgress * 100}%` }]} /><View style={[styles.progressDot, { left: `${sun.daylightProgress * 100}%` }]} /></View>
        <View style={styles.eventRow}>
          <SolarEvent icon={<Sunrise size={15} color={theme.accent} />} label="AMANECER" time={timeLabel(sun.sunrise)} />
          <SolarEvent icon={<Sun size={15} color={theme.accent} />} label="CÉNIT" time={timeLabel(sun.solarNoon)} />
          <SolarEvent icon={<Sunset size={15} color={theme.accent} />} label="ATARDECER" time={timeLabel(sun.sunset)} />
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIcon}><Sunrise size={16} color={theme.mint} /></View>
        <View style={styles.tipCopy}><Text style={styles.tipTitle}>Próximo gesto biológico</Text><Text style={styles.tipText}>{sun.morningLightWindow ? `Luz exterior sugerida: ${format(sun.morningLightWindow.start, 'HH:mm')}–${format(sun.morningLightWindow.end, 'HH:mm')}. Al atardecer, considera atenuar pantallas.` : 'Prioriza un horario de sueño regular; hoy no se calculan eventos solares convencionales.'}</Text></View>
        <ArrowUpRight size={16} color={theme.muted} />
      </View>

      <Text style={styles.disclaimer}>El cronotipo y las respuestas individuales varían. Esta guía educativa no mide hormonas ni sustituye consejo médico.</Text>
    </ScrollView>
  );
}

function SolarEvent({ icon, label, time }: { icon: React.ReactNode; label: string; time: string }) {
  return <View style={styles.event}>{icon}<Text style={styles.eventLabel}>{label}</Text><Text style={styles.eventTime}>{time}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.background }, content: { paddingHorizontal: 22, paddingTop: 58, paddingBottom: 28 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: theme.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: '700' }, title: { color: theme.text, fontSize: 32, fontWeight: '600', letterSpacing: -0.8, marginTop: 5 },
  locationRow: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 7 }, location: { color: theme.muted, fontSize: 11, flex: 1 }, locButton: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 }, locButtonText: { color: theme.accent, fontWeight: '700', fontSize: 9, letterSpacing: 1 }, locationStatus: { color: '#626B7B', fontSize: 9, marginTop: 5, marginLeft: 20 },
  moonCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 23, padding: 17, marginTop: 23, flexDirection: 'row', alignItems: 'center', gap: 12 }, moonLeft: { flex: 1 }, moonCopy: { }, cardEyebrow: { color: theme.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: '700' }, phase: { color: theme.text, fontSize: 19, fontWeight: '600', marginTop: 7 }, phaseDescription: { color: theme.muted, fontSize: 10, lineHeight: 15, marginTop: 6 }, pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, marginTop: 10, backgroundColor: theme.elevated }, pillText: { color: theme.accent, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 }, moonStats: { flexDirection: 'row', borderTopColor: theme.border, borderTopWidth: 1, marginTop: 10, paddingTop: 13, justifyContent: 'space-between' }, statValue: { color: theme.text, fontSize: 17, fontWeight: '600' }, statSmall: { color: theme.muted, fontSize: 10, fontWeight: '400' }, statLabel: { color: theme.muted, fontSize: 8, letterSpacing: 1, marginTop: 5 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }, sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '600' }, sectionHint: { color: theme.muted, fontSize: 9, letterSpacing: 1.2 }, solarCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 17 }, solarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, solarHeadline: { color: theme.text, fontSize: 17, fontWeight: '600', marginTop: 7 }, progressTrack: { height: 5, backgroundColor: '#293140', borderRadius: 8, marginTop: 19, position: 'relative' }, progressFill: { position: 'absolute', height: 5, left: 0, top: 0, backgroundColor: theme.accent, borderRadius: 8 }, progressDot: { position: 'absolute', width: 11, height: 11, borderRadius: 6, backgroundColor: theme.text, top: -3, marginLeft: -5, borderWidth: 2, borderColor: theme.accent }, eventRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }, event: { gap: 5 }, eventLabel: { color: theme.muted, fontSize: 8, letterSpacing: 0.6 }, eventTime: { color: theme.text, fontSize: 12, fontWeight: '600' },
  tipCard: { backgroundColor: '#131D1D', borderColor: '#253635', borderWidth: 1, borderRadius: 16, marginTop: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, tipIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#20302E', justifyContent: 'center', alignItems: 'center' }, tipCopy: { flex: 1 }, tipTitle: { color: theme.text, fontWeight: '600', fontSize: 11 }, tipText: { color: theme.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, disclaimer: { color: '#667080', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 18, paddingHorizontal: 8 },
});
