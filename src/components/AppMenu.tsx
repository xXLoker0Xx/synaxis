import { useState } from 'react';
import { Link } from 'expo-router';
import { Menu, X, MoonStar, Compass, NotebookPen, Orbit } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const sections = [
  { href: '/', label: 'Ciclo solar y lunar', detail: 'Ritmo del día', Icon: MoonStar },
  { href: '/oracle', label: 'Decisiones', detail: 'Brújula personal', Icon: Compass },
  { href: '/journal', label: 'Diario', detail: 'Observaciones', Icon: NotebookPen },
  { href: '/planets', label: 'Planetas', detail: 'Efemérides JPL Horizons', Icon: Orbit },
] as const;

export function AppMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú de secciones"
        style={styles.trigger}
      >
        <Menu size={21} color={theme.accent} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Cerrar menú" />
          <View style={styles.panel}>
            <View style={styles.heading}>
              <View><Text style={styles.brand}>Synaxis</Text><Text style={styles.subheading}>SECCIONES</Text></View>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Cerrar menú" style={styles.close}>
                <X size={19} color={theme.text} />
              </Pressable>
            </View>
            <View style={styles.divider} />
            {sections.map(({ href, label, detail, Icon }) => (
              <Link key={href} href={href} asChild onPress={() => setOpen(false)}>
                <Pressable style={styles.item} accessibilityRole="link">
                  <View style={styles.itemIcon}><Icon size={18} color={theme.accent} /></View>
                  <View style={styles.itemText}><Text style={styles.itemTitle}>{label}</Text><Text style={styles.itemDetail}>{detail}</Text></View>
                </Pressable>
              </Link>
            ))}
            <Text style={styles.footer}>Más secciones podrán añadirse aquí.</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 42, height: 42, borderRadius: 15, backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(3, 5, 10, 0.72)', alignItems: 'flex-end' },
  panel: { width: '88%', maxWidth: 340, height: '100%', backgroundColor: theme.surface, borderLeftWidth: 1, borderColor: theme.border, paddingTop: 62, paddingHorizontal: 20, paddingBottom: 28 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: theme.text, fontSize: 23, fontWeight: '700', letterSpacing: -0.4 },
  subheading: { color: theme.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1.7, marginTop: 6 },
  close: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: theme.border, marginTop: 23, marginBottom: 13 },
  item: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 13, paddingHorizontal: 9 },
  itemIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  itemTitle: { color: theme.text, fontSize: 13, fontWeight: '600' },
  itemDetail: { color: theme.muted, fontSize: 10, marginTop: 4 },
  footer: { color: theme.muted, fontSize: 10, lineHeight: 16, borderTopColor: theme.border, borderTopWidth: 1, marginTop: 17, paddingTop: 16 },
});
