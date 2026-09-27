import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert } from 'react-native';
import { Star, Calendar, MapPin, ChevronDown } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppMenu } from '../../components/AppMenu';
import { useBioLunar } from '../../context/AppContext';
import { calculateNatalChart, type NatalChart, type ZodiacSign } from '../../core/natal/natalChart';
import { getSignInterpretation, getPlanetInterpretation, getHouseInterpretation } from '../../data/natalDatabase';
import { theme } from '../../theme';

export default function NatalChartScreen() {
  const { coordinates } = useBioLunar();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState('12:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [expandedSection, setExpandedSection] = useState<'sun' | 'moon' | 'ascendant' | 'planets' | null>('sun');

  const handleCalculateChart = () => {
    if (!birthDate) {
      Alert.alert('Error', 'Por favor ingresa tu fecha de nacimiento');
      return;
    }

    const [hours, minutes] = birthTime.split(':').map(Number);
    const fullBirthDate = new Date(birthDate);
    fullBirthDate.setHours(hours || 0, minutes || 0);

    const chart = calculateNatalChart(
      fullBirthDate,
      coordinates.latitude,
      coordinates.longitude,
      coordinates.label
    );
    setNatalChart(chart);
  };

  const handleDateChange = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      if (day && month && year) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          setBirthDate(date);
          setShowDatePicker(false);
        }
      }
    } catch {
      Alert.alert('Error', 'Formato de fecha inválido. Usa DD/MM/YYYY');
    }
  };

  const SignCard = ({ sign, label, meaning }: { sign: ZodiacSign; label: string; meaning?: string }) => {
    const signData = getSignInterpretation(sign);
    return (
      <View style={styles.signCard}>
        <View style={styles.signHeader}>
          <View style={styles.signInfo}>
            <Text style={styles.signLabel}>{label}</Text>
            <Text style={styles.signName}>{sign}</Text>
            <Text style={styles.element}>{signData.element}</Text>
          </View>
          <View style={[styles.signRuler, { backgroundColor: theme.accent + '20' }]}>
            <Star size={20} color={theme.accent} />
          </View>
        </View>
        {meaning && <Text style={styles.signMeaning}>{meaning}</Text>}
        <View style={styles.keywordsContainer}>
          {signData.keywords.slice(0, 3).map((keyword, i) => (
            <View key={i} style={styles.keyword}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.brand}>SYNAXIS</Text>
          <Text style={styles.sectionTag}>CARTA NATAL</Text>
        </View>
        <AppMenu />
      </View>

      <Text style={styles.title}>Tu mapa celeste de nacimiento</Text>
      <Text style={styles.intro}>Ingresa tu fecha y hora de nacimiento para calcular tu carta natal y descubrir tus cualidades de nacimiento.</Text>

      {!natalChart ? (
        <View style={styles.inputCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={birthDate ? format(birthDate, 'dd/MM/yyyy') : ''}
              onChangeText={handleDateChange}
              placeholderTextColor={theme.muted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Hora de Nacimiento</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={birthTime}
              onChangeText={setBirthTime}
              placeholderTextColor={theme.muted}
            />
            <Text style={styles.hint}>Si no conoces la hora exacta, usa 12:00 (mediodía)</Text>
          </View>

          <View style={styles.locationInfo}>
            <MapPin size={14} color={theme.muted} />
            <Text style={styles.locationText}>{coordinates.label}</Text>
          </View>

          <Pressable style={styles.calculateButton} onPress={handleCalculateChart}>
            <Text style={styles.calculateText}>Calcular Carta Natal</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.chartSummary}>
            <Text style={styles.summaryTitle}>Tu Triada Astrológica</Text>
            <View style={styles.triadeContainer}>
              <View style={styles.triadeItem}>
                <Text style={styles.triadeLabel}>SOL</Text>
                <Text style={styles.triadeSign}>{natalChart.solarSign}</Text>
              </View>
              <View style={styles.triadeItem}>
                <Text style={styles.triadeLabel}>LUNA</Text>
                <Text style={styles.triadeSign}>{natalChart.lunarSign}</Text>
              </View>
              <View style={styles.triadeItem}>
                <Text style={styles.triadeLabel}>ASCENDENTE</Text>
                <Text style={styles.triadeSign}>{natalChart.ascendant}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.expandableCard}
            onPress={() => setExpandedSection(expandedSection === 'sun' ? null : 'sun')}
          >
            <View style={styles.expandableHeader}>
              <Text style={styles.expandableTitle}>☉ Signo Solar - Tu Identidad Esencial</Text>
              <ChevronDown
                size={20}
                color={theme.accent}
                style={{ transform: [{ rotate: expandedSection === 'sun' ? '180deg' : '0deg' }] }}
              />
            </View>
            {expandedSection === 'sun' && (
              <View style={styles.expandableContent}>
                <SignCard sign={natalChart.solarSign} label="Tu signo solar" />
                <Text style={styles.description}>
                  {getSignInterpretation(natalChart.solarSign).description}
                </Text>
                <View style={styles.qualitiesGrid}>
                  <View style={styles.qualityColumn}>
                    <Text style={styles.qualityTitle}>Fortalezas</Text>
                    {getSignInterpretation(natalChart.solarSign).strengths.map((strength, i) => (
                      <Text key={i} style={styles.qualityText}>• {strength}</Text>
                    ))}
                  </View>
                  <View style={styles.qualityColumn}>
                    <Text style={styles.qualityTitle}>Desafíos</Text>
                    {getSignInterpretation(natalChart.solarSign).challenges.map((challenge, i) => (
                      <Text key={i} style={styles.qualityText}>• {challenge}</Text>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.expandableCard}
            onPress={() => setExpandedSection(expandedSection === 'moon' ? null : 'moon')}
          >
            <View style={styles.expandableHeader}>
              <Text style={styles.expandableTitle}>☽ Signo Lunar - Tu Mundo Emocional</Text>
              <ChevronDown
                size={20}
                color={theme.accent}
                style={{ transform: [{ rotate: expandedSection === 'moon' ? '180deg' : '0deg' }] }}
              />
            </View>
            {expandedSection === 'moon' && (
              <View style={styles.expandableContent}>
                <SignCard sign={natalChart.lunarSign} label="Tu signo lunar" />
                <Text style={styles.description}>
                  {getSignInterpretation(natalChart.lunarSign).description}
                </Text>
                <View style={styles.qualitiesGrid}>
                  <View style={styles.qualityColumn}>
                    <Text style={styles.qualityTitle}>Fortalezas</Text>
                    {getSignInterpretation(natalChart.lunarSign).strengths.map((strength, i) => (
                      <Text key={i} style={styles.qualityText}>• {strength}</Text>
                    ))}
                  </View>
                  <View style={styles.qualityColumn}>
                    <Text style={styles.qualityTitle}>Desafíos</Text>
                    {getSignInterpretation(natalChart.lunarSign).challenges.map((challenge, i) => (
                      <Text key={i} style={styles.qualityText}>• {challenge}</Text>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.expandableCard}
            onPress={() => setExpandedSection(expandedSection === 'ascendant' ? null : 'ascendant')}
          >
            <View style={styles.expandableHeader}>
              <Text style={styles.expandableTitle}>↗ Ascendente - Tu Máscara Social</Text>
              <ChevronDown
                size={20}
                color={theme.accent}
                style={{ transform: [{ rotate: expandedSection === 'ascendant' ? '180deg' : '0deg' }] }}
              />
            </View>
            {expandedSection === 'ascendant' && (
              <View style={styles.expandableContent}>
                <SignCard sign={natalChart.ascendant} label="Tu ascendente" />
                <Text style={styles.description}>
                  {getSignInterpretation(natalChart.ascendant).description}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.expandableCard}
            onPress={() => setExpandedSection(expandedSection === 'planets' ? null : 'planets')}
          >
            <View style={styles.expandableHeader}>
              <Text style={styles.expandableTitle}>✦ Posiciones Planetarias</Text>
              <ChevronDown
                size={20}
                color={theme.accent}
                style={{ transform: [{ rotate: expandedSection === 'planets' ? '180deg' : '0deg' }] }}
              />
            </View>
            {expandedSection === 'planets' && (
              <View style={styles.expandableContent}>
                {natalChart.planets.map((planet, i) => {
                  const planetData = getPlanetInterpretation(planet.body);
                  return (
                    <View key={i} style={styles.planetItem}>
                      <View style={styles.planetHeader}>
                        <Text style={styles.planetName}>{planetData.symbol} {planet.body}</Text>
                        <Text style={styles.planetSign}>{planet.zodiacSign}</Text>
                      </View>
                      <Text style={styles.planetArchetype}>{planetData.archetype}</Text>
                      <Text style={styles.planetDescription}>{planetData.description}</Text>
                      {planet.retrograde && (
                        <View style={styles.retrogradeTag}>
                          <Text style={styles.retrogradeText}>⟲ Retrógrado</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </Pressable>

          <Pressable style={styles.resetButton} onPress={() => setNatalChart(null)}>
            <Text style={styles.resetText}>Calcular otra carta</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            La carta natal es una herramienta reflexiva para el autoconocimiento. No es determinista ni predictiva. Úsala como un mapa para explorar tu complejidad.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 22, paddingTop: 50, paddingBottom: 30 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  brand: { color: theme.text, fontSize: 15, fontWeight: '700', letterSpacing: 1.1 },
  sectionTag: { color: theme.accent, fontSize: 8, fontWeight: '700', letterSpacing: 1.4, marginTop: 4 },
  title: { color: theme.text, fontSize: 27, fontWeight: '600', letterSpacing: -0.6, marginTop: 10 },
  intro: { color: theme.muted, fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 20 },

  inputCard: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 17, marginBottom: 20 },
  fieldGroup: { marginBottom: 16 },
  label: { color: theme.text, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.elevated, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: theme.text, fontSize: 12 },
  hint: { color: theme.muted, fontSize: 9, marginTop: 6 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.elevated, borderRadius: 10, padding: 10, marginBottom: 16 },
  locationText: { color: theme.muted, fontSize: 10 },
  calculateButton: { backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  calculateText: { color: theme.background, fontWeight: '700', fontSize: 12 },

  chartSummary: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 17, marginBottom: 20 },
  summaryTitle: { color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  triadeContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  triadeItem: { flex: 1, alignItems: 'center', backgroundColor: theme.elevated, borderRadius: 12, padding: 12 },
  triadeLabel: { color: theme.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  triadeSign: { color: theme.accent, fontSize: 14, fontWeight: '700', marginTop: 4 },

  expandableCard: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  expandableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 17, paddingVertical: 14 },
  expandableTitle: { color: theme.text, fontSize: 12, fontWeight: '600', flex: 1 },
  expandableContent: { borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 17, paddingVertical: 14 },

  signCard: { backgroundColor: theme.elevated, borderRadius: 12, padding: 12, marginBottom: 12 },
  signHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  signInfo: { flex: 1 },
  signLabel: { color: theme.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  signName: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
  element: { color: theme.accent, fontSize: 9, fontWeight: '600', marginTop: 3 },
  signRuler: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  signMeaning: { color: theme.muted, fontSize: 10, lineHeight: 15, marginBottom: 10 },
  keywordsContainer: { flexDirection: 'row', gap: 6 },
  keyword: { backgroundColor: theme.accentSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  keywordText: { color: theme.accent, fontSize: 8, fontWeight: '600' },

  description: { color: theme.muted, fontSize: 11, lineHeight: 16, marginBottom: 12 },
  qualitiesGrid: { flexDirection: 'row', gap: 12 },
  qualityColumn: { flex: 1 },
  qualityTitle: { color: theme.text, fontSize: 10, fontWeight: '700', marginBottom: 8 },
  qualityText: { color: theme.muted, fontSize: 10, lineHeight: 15, marginBottom: 4 },

  planetItem: { backgroundColor: theme.elevated, borderRadius: 12, padding: 12, marginBottom: 10 },
  planetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planetName: { color: theme.text, fontSize: 12, fontWeight: '700' },
  planetSign: { color: theme.accent, fontSize: 11, fontWeight: '600' },
  planetArchetype: { color: theme.accent, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  planetDescription: { color: theme.muted, fontSize: 10, lineHeight: 14, marginBottom: 8 },
  retrogradeTag: { backgroundColor: theme.accentSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  retrogradeText: { color: theme.accent, fontSize: 9, fontWeight: '600' },

  resetButton: { backgroundColor: theme.elevated, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingVertical: 12, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  resetText: { color: theme.accent, fontWeight: '700', fontSize: 12 },
  disclaimer: { color: theme.muted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 12 },
});
