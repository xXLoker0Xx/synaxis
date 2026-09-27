import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert, Modal } from 'react-native';
import { Star, Calendar, MapPin, ChevronDown, Clock, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DatePicker from 'react-native-date-picker';
import { AppMenu } from '../../components/AppMenu';
import { useBioLunar } from '../../context/AppContext';
import { calculateNatalChart, type NatalChart, type ZodiacSign } from '../../core/natal/natalChart';
import { getSignInterpretation, getPlanetInterpretation, getHouseInterpretation } from '../../data/natalDatabase';
import { theme } from '../../theme';

// Ubicaciones preestablecidas (latitud, longitud, nombre)
const PRESET_LOCATIONS = [
  { label: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { label: 'Barcelona', latitude: 41.3851, longitude: 2.1734 },
  { label: 'Valencia', latitude: 39.4699, longitude: -0.3763 },
  { label: 'Sevilla', latitude: 37.3886, longitude: -5.9823 },
  { label: 'Bilbao', latitude: 43.2627, longitude: -2.9253 },
  { label: 'Málaga', latitude: 36.7213, longitude: -4.4215 },
  { label: 'Ciudad de México', latitude: 19.4326, longitude: -99.1332 },
  { label: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
  { label: 'Bogotá', latitude: 4.7110, longitude: -74.0721 },
  { label: 'Nueva York', latitude: 40.7128, longitude: -74.0060 },
  { label: 'Londres', latitude: 51.5074, longitude: -0.1278 },
  { label: 'París', latitude: 48.8566, longitude: 2.3522 },
];

export default function NatalChartScreen() {
  const { coordinates } = useBioLunar();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthHour, setBirthHour] = useState('12');
  const [birthMinute, setBirthMinute] = useState('00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(coordinates);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [expandedSection, setExpandedSection] = useState<'sun' | 'moon' | 'ascendant' | 'planets' | null>('sun');

  const handleCalculateChart = () => {
    if (!birthDate) {
      Alert.alert('Error', 'Por favor selecciona tu fecha de nacimiento');
      return;
    }

    const hours = parseInt(birthHour, 10) || 0;
    const minutes = parseInt(birthMinute, 10) || 0;
    const fullBirthDate = new Date(birthDate);
    fullBirthDate.setHours(hours, minutes);

    const chart = calculateNatalChart(
      fullBirthDate,
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.label
    );
    setNatalChart(chart);
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
          {/* Date Picker Button */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📅 Fecha de Nacimiento</Text>
            <Pressable
              style={[styles.input, styles.datePickerButton]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={16} color={theme.accent} />
              <Text style={styles.datePickerText}>
                {birthDate ? format(birthDate, 'dd MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
              </Text>
            </Pressable>
          </View>

          {/* Time Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>🕐 Hora de Nacimiento</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Horas</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="00"
                  value={birthHour}
                  onChangeText={(text) => setBirthHour(text.slice(0, 2))}
                  placeholderTextColor={theme.muted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Minutos</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="00"
                  value={birthMinute}
                  onChangeText={(text) => setBirthMinute(text.slice(0, 2))}
                  placeholderTextColor={theme.muted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>
            <Text style={styles.hint}>Si no conoces la hora exacta, usa 12:00 (mediodía)</Text>
          </View>

          {/* Location Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>📍 Localización de Nacimiento</Text>
            <Pressable
              style={styles.locationButton}
              onPress={() => setShowLocationModal(true)}
            >
              <MapPin size={16} color={theme.accent} />
              <View style={styles.locationContent}>
                <Text style={styles.locationButtonText}>{selectedLocation.label}</Text>
                <Text style={styles.locationCoords}>
                  {selectedLocation.latitude.toFixed(2)}°, {selectedLocation.longitude.toFixed(2)}°
                </Text>
              </View>
              <ChevronDown size={16} color={theme.muted} />
            </Pressable>
          </View>

          {/* Calculate Button */}
          <Pressable style={styles.calculateButton} onPress={handleCalculateChart}>
            <Text style={styles.calculateText}>Calcular Carta Natal</Text>
          </Pressable>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DatePicker
              modal
              open={showDatePicker}
              date={birthDate || new Date()}
              onConfirm={(date) => {
                setBirthDate(date);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
              title="Selecciona tu fecha de nacimiento"
              confirmText="Confirmar"
              cancelText="Cancelar"
              locale="es"
              maximumDate={new Date()}
            />
          )}

          {/* Location Modal */}
          <Modal visible={showLocationModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.locationModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Selecciona tu localización</Text>
                  <Pressable onPress={() => setShowLocationModal(false)}>
                    <X size={24} color={theme.text} />
                  </Pressable>
                </View>
                <ScrollView style={styles.locationList}>
                  {PRESET_LOCATIONS.map((location) => (
                    <Pressable
                      key={location.label}
                      style={[
                        styles.locationListItem,
                        selectedLocation.label === location.label && styles.locationListItemActive,
                      ]}
                      onPress={() => {
                        setSelectedLocation(location);
                        setShowLocationModal(false);
                      }}
                    >
                      <View style={styles.locationListContent}>
                        <Text style={styles.locationListLabel}>{location.label}</Text>
                        <Text style={styles.locationListCoords}>
                          {location.latitude.toFixed(2)}° {location.longitude.toFixed(2)}°
                        </Text>
                      </View>
                      {selectedLocation.label === location.label && (
                        <View style={[styles.checkmark, { backgroundColor: theme.accent }]} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
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
  
  // Date Picker Styles
  datePickerButton: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  datePickerText: { color: theme.text, fontSize: 13, fontWeight: '500' },
  
  // Time Picker Styles
  timePickerContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timeInputGroup: { flex: 1 },
  timeLabel: { color: theme.muted, fontSize: 9, fontWeight: '600', marginBottom: 4 },
  timeInput: { backgroundColor: theme.elevated, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: theme.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  timeSeparator: { color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  
  // Location Button Styles
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.elevated, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  locationContent: { flex: 1 },
  locationButtonText: { color: theme.text, fontSize: 13, fontWeight: '500' },
  locationCoords: { color: theme.muted, fontSize: 9, marginTop: 2 },
  
  hint: { color: theme.muted, fontSize: 9, marginTop: 6 },
  
  calculateButton: { backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  calculateText: { color: theme.background, fontWeight: '700', fontSize: 12 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  locationModal: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.border },
  modalTitle: { color: theme.text, fontSize: 14, fontWeight: '600' },
  locationList: { paddingHorizontal: 22 },
  locationListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border + '20' },
  locationListItemActive: { backgroundColor: theme.elevated + '40', borderRadius: 8, paddingHorizontal: 12, marginHorizontal: -12 },
  locationListContent: { flex: 1 },
  locationListLabel: { color: theme.text, fontSize: 12, fontWeight: '500' },
  locationListCoords: { color: theme.muted, fontSize: 9, marginTop: 2 },
  checkmark: { width: 20, height: 20, borderRadius: 10 },

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
