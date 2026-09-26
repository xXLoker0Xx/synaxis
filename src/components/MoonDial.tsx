import Svg, { Circle, Path } from 'react-native-svg';
import { Text, View, StyleSheet } from 'react-native';
import type { LunarCycleState } from '../core/astronomy/astronomy';
import { theme } from '../theme';

interface MoonDialProps {
  state: LunarCycleState;
}

export function MoonDial({ state }: MoonDialProps) {
  const radius = 41;
  const terminator = Math.max(0.8, radius * Math.abs(Math.cos(state.elongationDegrees * Math.PI / 180)));
  const waxing = state.elongationDegrees < 180;
  const innerSweep = state.illumination < 0.5 ? (waxing ? 0 : 1) : (waxing ? 1 : 0);
  const sideSweep = waxing ? 1 : 0;
  const path = `M 50 9 A 41 41 0 0 ${sideSweep} 50 91 A ${terminator.toFixed(2)} 41 0 0 ${innerSweep} 50 9 Z`;

  return (
    <View style={styles.wrap} accessibilityLabel={`${state.octant}, ${Math.round(state.illumination * 100)} por ciento iluminada`}>
      <Svg width={126} height={126} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="42" fill="#27303C" />
        <Path d={path} fill={theme.accent} />
        <Circle cx="50" cy="50" r="42" fill="none" stroke="#72644D" strokeWidth="0.7" />
      </Svg>
      <Text style={styles.day}>DÍA {Math.floor(state.cycleDay)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: 142, height: 142 },
  day: { position: 'absolute', bottom: 9, color: theme.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
});
