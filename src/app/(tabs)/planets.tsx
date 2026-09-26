import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, ArrowUpRight, Orbit, RefreshCw, Satellite } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppMenu } from '../../components/AppMenu';
import { useBioLunar } from '../../context/AppContext';
import { fetchPlanetPositions, type PlanetPositionsResponse } from '../../data/planetaryPositions';
import { theme } from '../../theme';

const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const;

function compassDirection(azimuth: number): string {
  return directions[Math.round(((azimuth % 360) + 360) % 360 / 45) % 8];
}

function degrees(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}°`;
}

export default function PlanetPositionsScreen() {
  const { coordinates, requestLocation, locationStatus } = useBioLunar();
  const [data, setData] = useState<PlanetPositionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculate = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchPlanetPositions(coordinates.latitude, coordinates.longitude));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar NASA/JPL Horizons.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = data ? format(new Date(data.requestedAt), "d 'de' MMMM · HH:mm", { locale: es }) : null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topbar}><View><Text style={styles.brand}>SYNAXIS</Text><Text style={styles.sectionTag}>EFEMÉRIDES</Text></View><AppMenu /></View>
      <Text style={styles.title}>Posición planetaria</Text>
      <Text style={styles.intro}>Consulta la posición aparente de los planetas sobre el horizonte local usando datos calculados por JPL Horizons.</Text>

      <View style={styles.locationCard}>
        <View style={styles.locationIcon}><Satellite size={17} color={theme.accent} /></View>
        <View style={styles.locationCopy}>
          <Text style={styles.locationLabel}>OBSERVADOR</Text>
          <Text style={styles.locationText}>{coordinates.label}</Text>
          <Text style={styles.coordinates}>{coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°</Text>
        </View>
        <Pressable onPress={requestLocation} style={styles.gpsButton} accessibilityRole="button" accessibilityLabel="Actualizar ubicación GPS">
          <Text style={styles.gpsText}>GPS</Text>
        </Pressable>
      </View>
      <Text style={styles.permissionHint}>{locationStatus}. El permiso GPS es opcional; también puedes usar la ubicación de referencia.</Text>

      <Pressable onPress={calculate} disabled={loading} style={[styles.calculateButton, loading && styles.buttonDisabled]} accessibilityRole="button">
        {loading ? <ActivityIndicator size="small" color={theme.background} /> : data ? <RefreshCw size={17} color={theme.background} /> : <Orbit size={17} color={theme.background} />}
        <Text style={styles.calculateText}>{loading ? 'Consultando JPL Horizons…' : data ? 'Actualizar posiciones' : 'Calcular posiciones'}</Text>
      </Pressable>

      {error ? <View style={styles.errorCard}><AlertCircle size={17} color={theme.rose} /><Text style={styles.errorText}>{error}</Text></View> : null}

      {data ? <>
        <View style={styles.resultHeading}>
          <View><Text style={styles.resultTitle}>Sistema solar · hoy</Text><Text style={styles.resultDate}>{formattedDate} · hora local</Text></View>
          <View style={styles.sourceBadge}><Text style={styles.sourceText}>JPL</Text></View>
        </View>
        {data.positions.map((planet) => {
          const aboveHorizon = planet.elevationDegrees !== null && planet.elevationDegrees >= 0;
          return (
            <View key={planet.id} style={styles.planetCard}>
              <View style={styles.planetTop}>
                <View style={styles.planetNameRow}>
                  <Text style={styles.planetSymbol}>{planet.symbol}</Text>
                  <View><Text style={styles.planetName}>{planet.name}</Text><Text style={styles.planetConstellation}>{planet.constellation ? `En ${planet.constellation}` : 'Constelación no disponible'}</Text></View>
                </View>
                <View style={[styles.horizonBadge, planet.status === 'unavailable' ? styles.unavailableBadge : planet.status === 'reference' ? styles.referenceBadge : aboveHorizon ? styles.aboveBadge : styles.belowBadge]}>
                  <Text style={[styles.horizonText, planet.status === 'unavailable' ? styles.unavailableText : planet.status === 'reference' ? styles.referenceBadgeText : aboveHorizon ? styles.aboveText : styles.belowText]}>
                    {planet.status === 'unavailable' ? 'SIN DATO' : planet.status === 'reference' ? 'ORIGEN' : aboveHorizon ? 'SOBRE HORIZONTE' : 'BAJO HORIZONTE'}
                  </Text>
                </View>
              </View>
              {planet.status === 'ok' ? <>
                <View style={styles.measurements}>
                  <Metric label="AZIMUTAL" value={`${degrees(planet.azimuthDegrees)}${planet.azimuthDegrees === null ? '' : ` · ${compassDirection(planet.azimuthDegrees)}`}`} />
                  <Metric label="ELEVACIÓN" value={degrees(planet.elevationDegrees)} />
                </View>
                {planet.azimuthDegrees !== null ? <View style={styles.azimuthScale}>
                  <View style={styles.azimuthTrack} />
                  <View style={[styles.azimuthMarker, { left: `${planet.azimuthDegrees / 360 * 100}%` }]} />
                  <View style={styles.compassLabels}><Text style={styles.compassLabel}>N</Text><Text style={styles.compassLabel}>E</Text><Text style={styles.compassLabel}>S</Text><Text style={styles.compassLabel}>O</Text><Text style={styles.compassLabel}>N</Text></View>
                </View> : null}
              </> : planet.status === 'reference' ? (
                <Text style={styles.referencePlanetText}>Punto geocéntrico de observación. No se calcula una elevación de la Tierra respecto de su propia superficie.</Text>
              ) : (
                <Text style={styles.planetError}>{planet.error ?? 'JPL no devolvió datos para este cuerpo.'}</Text>
              )}
            </View>
          );
        })}
        <View style={styles.referenceCard}><ArrowUpRight size={14} color={theme.muted} /><Text style={styles.referenceText}>Las coordenadas son topocéntricas. “Sobre el horizonte” describe geometría, no garantiza que el planeta sea visible a simple vista.</Text></View>
      </> : null}

      {!data && !error ? <View style={styles.emptyCard}><Orbit size={24} color={theme.accent} /><Text style={styles.emptyTitle}>Efeméride bajo demanda</Text><Text style={styles.emptyText}>Al calcular, Synaxis consulta los ocho planetas del Sistema Solar a través de su función segura de Vercel y JPL Horizons. Las posiciones se actualizan al solicitarlo.</Text></View> : null}
      <Text style={styles.disclaimer}>Coordenadas topocéntricas aparentes: azimut y elevación sin refracción, más constelación IAU. Fuente: NASA/JPL Horizons; no es interpretación astrológica.</Text>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 22, paddingTop: 50, paddingBottom: 30 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 17 },
  brand: { color: theme.text, fontSize: 15, fontWeight: '700', letterSpacing: 1.1 },
  sectionTag: { color: theme.accent, fontSize: 8, fontWeight: '700', letterSpacing: 1.4, marginTop: 4 },
  title: { color: theme.text, fontSize: 27, fontWeight: '600', letterSpacing: -0.6 },
  intro: { color: theme.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 13, marginTop: 19 },
  locationIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1 }, locationLabel: { color: theme.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  locationText: { color: theme.text, fontSize: 11, fontWeight: '600', marginTop: 4 }, coordinates: { color: theme.muted, fontSize: 9, marginTop: 3 },
  gpsButton: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 }, gpsText: { color: theme.accent, fontSize: 9, fontWeight: '700' },
  permissionHint: { color: theme.muted, fontSize: 9, lineHeight: 14, marginTop: 7, marginLeft: 3 },
  calculateButton: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: theme.accent, borderRadius: 14, marginTop: 17 },
  buttonDisabled: { opacity: 0.72 }, calculateText: { color: theme.background, fontSize: 12, fontWeight: '700' },
  errorCard: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 13, backgroundColor: '#2A191D', borderColor: '#573036', borderWidth: 1, borderRadius: 13, marginTop: 14 },
  errorText: { color: '#F0B7B4', fontSize: 11, lineHeight: 16, flex: 1 },
  resultHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 11 },
  resultTitle: { color: theme.text, fontSize: 17, fontWeight: '600' }, resultDate: { color: theme.muted, fontSize: 9, marginTop: 4, textTransform: 'capitalize' },
  sourceBadge: { backgroundColor: theme.elevated, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 }, sourceText: { color: theme.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  planetCard: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 9 },
  planetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, planetNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planetSymbol: { color: theme.accent, fontSize: 23, width: 30, textAlign: 'center' }, planetName: { color: theme.text, fontSize: 13, fontWeight: '600' }, planetConstellation: { color: theme.muted, fontSize: 9, marginTop: 3 },
  horizonBadge: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 5 }, aboveBadge: { backgroundColor: '#183029' }, belowBadge: { backgroundColor: '#302A20' }, unavailableBadge: { backgroundColor: '#312126' }, referenceBadge: { backgroundColor: '#222A38' },
  horizonText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.55 }, aboveText: { color: theme.mint }, belowText: { color: theme.amber }, unavailableText: { color: theme.rose }, referenceBadgeText: { color: theme.accent },
  measurements: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border, marginTop: 12, paddingTop: 10 }, metric: { flex: 1 }, metricLabel: { color: theme.muted, fontSize: 7, letterSpacing: 1, fontWeight: '700' }, metricValue: { color: theme.text, fontSize: 12, fontWeight: '600', marginTop: 4 },
  azimuthScale: { height: 14, justifyContent: 'center', marginTop: 6, marginHorizontal: 3 }, azimuthTrack: { position: 'absolute', left: 0, right: 0, height: 2, borderRadius: 2, backgroundColor: theme.border },
  azimuthMarker: { position: 'absolute', top: 2, width: 8, height: 8, marginLeft: -4, borderRadius: 5, borderWidth: 2, borderColor: theme.accent, backgroundColor: theme.surface },
  compassLabels: { flexDirection: 'row', justifyContent: 'space-between' }, compassLabel: { color: theme.muted, fontSize: 7 },
  planetError: { color: theme.rose, fontSize: 9, lineHeight: 14, marginTop: 12 }, referencePlanetText: { color: theme.muted, fontSize: 9, lineHeight: 14, marginTop: 12 },
  referenceCard: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: theme.elevated, borderRadius: 12, padding: 12, marginTop: 3 }, referenceText: { color: theme.muted, fontSize: 9, lineHeight: 14, flex: 1 },
  emptyCard: { alignItems: 'center', backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 18, padding: 22, marginTop: 18 }, emptyTitle: { color: theme.text, fontSize: 14, fontWeight: '600', marginTop: 13 }, emptyText: { color: theme.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 7 },
  disclaimer: { color: '#667080', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 18, paddingHorizontal: 8 },
});
