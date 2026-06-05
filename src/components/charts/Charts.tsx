import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path, Rect, Circle, Line, Defs, LinearGradient, Stop,
  G, Text as SvgText,
} from 'react-native-svg';
import Animated, {
  FadeIn, useSharedValue, useAnimatedProps, withTiming,
  withDelay, Easing,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildSmoothArea(points: { x: number; y: number }[], chartHeight: number): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${chartHeight} L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  d += ` L ${points[points.length - 1].x} ${chartHeight} Z`;
  return d;
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  height = 160,
  color = Colors.primary,
  gradientStart = Colors.primary,
  gradientEnd = Colors.accent,
}) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = height - 32;
  const areaOpacity = useSharedValue(0);
  const lineOpacity = useSharedValue(0);

  useEffect(() => {
    areaOpacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
    lineOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, [data]);

  const areaAnimProps = useAnimatedProps(() => ({ opacity: areaOpacity.value }));
  const lineAnimProps = useAnimatedProps(() => ({ opacity: lineOpacity.value }));

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values) * 1.1;
  const minValue = Math.min(...values) * 0.9;
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (chartWidth - 24) + 12,
    y: chartHeight - 20 - ((d.value - minValue) / range) * (chartHeight - 40),
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = buildSmoothArea(points, chartHeight - 20);
  const gradId = `lineGrad_${color.replace('#', '')}`;
  const areaId = `areaGrad_${color.replace('#', '')}`;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={gradientStart} />
            <Stop offset="100%" stopColor={gradientEnd} />
          </LinearGradient>
          <LinearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {[0, 0.5, 1].map((p, i) => (
          <Line
            key={i}
            x1="0" y1={10 + p * (chartHeight - 50)}
            x2={chartWidth} y2={10 + p * (chartHeight - 50)}
            stroke={Colors.border} strokeWidth={0.8}
          />
        ))}

        <AnimatedPath animatedProps={areaAnimProps} d={areaPath} fill={`url(#${areaId})`} />

        <AnimatedPath
          animatedProps={lineAnimProps}
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={Colors.surface} stroke={color} strokeWidth={1.5} />
          </G>
        ))}

        {data.map((d, i) => {
          if (data.length > 7 && i % 2 !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={i}
              x={(i / (data.length - 1)) * (chartWidth - 24) + 12}
              y={height - 4}
              fill={Colors.textMuted}
              fontSize={9}
              fontWeight="600"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </Animated.View>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  height = 165,
}) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = height - 36;

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values) * 1.1 || 10;
  const barCount = data.length;
  const totalBarSpace = chartWidth - 24;
  const barWidth = Math.min(28, (totalBarSpace / barCount) - 10);
  const gap = (totalBarSpace - barWidth * barCount) / (barCount - 1 || 1);

  // today is last bar (#2D6A4F), previous days are #B7E4C7
  const todayIndex = data.length - 1;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Svg width={chartWidth} height={height}>
        {[0, 0.5, 1].map((p, i) => (
          <Line
            key={i}
            x1="0" y1={8 + p * (chartHeight - 28)}
            x2={chartWidth} y2={8 + p * (chartHeight - 28)}
            stroke={Colors.border} strokeWidth={0.8}
          />
        ))}

        {data.map((d, i) => {
          const x = 12 + i * (barWidth + gap);
          const barH = Math.max(4, (d.value / maxValue) * (chartHeight - 36));
          const y = chartHeight - barH - 16;
          const fillColor = i === todayIndex ? Colors.primary : '#B7E4C7';
          return (
            <BarItem
              key={i}
              x={x} y={y}
              width={barWidth} barHeight={barH}
              fillColor={fillColor}
              label={d.label}
              chartHeight={chartHeight}
              height={height}
              delay={i * 60}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
};

function BarItem({ x, y, width, barHeight, fillColor, label, chartHeight, height, delay }: any) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, []);
  const animProps = useAnimatedProps(() => ({
    height: barHeight * progress.value,
    y: chartHeight - barHeight * progress.value - 16,
  }));
  return (
    <G>
      <AnimatedRect
        animatedProps={animProps}
        x={x} width={width} rx={5}
        fill={fillColor}
      />
      <SvgText
        x={x + width / 2} y={height - 4}
        fill={Colors.textMuted} fontSize={9} fontWeight="600" textAnchor="middle"
      >
        {label}
      </SvgText>
    </G>
  );
}

export const DonutChart: React.FC<ChartProps> = ({ data, height = 160 }) => {
  const radius = 52;
  const strokeWidth = 16;
  const center = 70;
  const circumference = 2 * Math.PI * radius;

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, c) => acc + c.value, 0);

  const palette = [
    Colors.primary, Colors.accent, '#F4A261', Colors.info, Colors.error, Colors.textSecondary,
  ];

  const slices = data.reduce<{
    color: string;
    offset: number;
    rotation: number;
    label: string;
    value: number;
    pct: number;
  }[]>((acc, d, i) => {
    const previous = acc.reduce((sum, slice) => sum + slice.value / total, 0);
    const pct = d.value / total;
    acc.push({
      color: palette[i % palette.length],
      offset: circumference - pct * circumference,
      rotation: previous * 360 - 90,
      label: d.label,
      value: d.value,
      pct: Math.round(pct * 100),
    });
    return acc;
  }, []);

  return (
    <Animated.View entering={FadeIn.delay(100).duration(500)} style={[styles.container, styles.donutRow]}>
      <View>
        <Svg width={center * 2} height={center * 2}>
          <Circle
            cx={center} cy={center} r={radius}
            fill="transparent"
            stroke={Colors.border}
            strokeWidth={strokeWidth}
          />
          {slices.map((s, i) => (
            <DonutSlice key={i} slice={s} center={center} radius={radius}
              strokeWidth={strokeWidth} circumference={circumference} delay={i * 80} />
          ))}
          <SvgText x={center} y={center - 5} textAnchor="middle" fontSize={9} fontWeight="700" fill={Colors.textSecondary}>
            TOTAL
          </SvgText>
          <SvgText x={center} y={center + 10} textAnchor="middle" fontSize={14} fontWeight="700" fill={Colors.textPrimary}>
            {total}
          </SvgText>
        </Svg>
      </View>

      <View style={styles.legendContainer}>
        {slices.map((s, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legendLabel} numberOfLines={1}>{s.label}</Text>
              <Text style={[styles.legendPct, { color: s.color }]}>{s.pct}%</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

function DonutSlice({ slice, center, radius, strokeWidth, circumference, delay }: any) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);
  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (circumference - slice.offset) * progress.value,
  }));
  return (
    <AnimatedCircle
      animatedProps={animProps}
      cx={center} cy={center} r={radius}
      fill="transparent"
      stroke={slice.color}
      strokeWidth={strokeWidth}
      strokeDasharray={`${circumference} ${circumference}`}
      origin={`${center}, ${center}`}
      rotation={slice.rotation}
      strokeLinecap="round"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    gap: 16,
  },
  legendContainer: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '700',
  },
});
