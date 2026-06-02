import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  height?: number;
}

export const LineChart: React.FC<ChartProps> = ({ data, height = 160 }) => {
  const chartWidth = SCREEN_WIDTH - 64; // card padding
  const chartHeight = height - 40; // padding for labels

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 100);
  const minValue = 0;

  // Generate SVG path coordinates
  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 20) + 10;
    const y = chartHeight - ((d.value - minValue) / (maxValue - minValue)) * (chartHeight - 20) - 10;
    return { x, y };
  });

  // Construct SVG Path
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${chartHeight} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
      areaPath += ` L ${points[i].x} ${points[i].y}`;
    }

    areaPath += ` L ${points[points.length - 1].x} ${chartHeight} Z`;
  }

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = 10 + p * (chartHeight - 20);
          return (
            <Line
              key={idx}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={Colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area under curve */}
        {areaPath ? <Path d={areaPath} fill="url(#tealGrad)" /> : null}

        {/* Spark line */}
        {linePath ? (
          <Path d={linePath} fill="none" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" />
        ) : null}

        {/* Data point dots */}
        {points.map((p, idx) => (
          <Circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={Colors.surface}
            stroke={Colors.primary}
            strokeWidth={2}
          />
        ))}

        {/* X Axis Labels */}
        {data.map((d, index) => {
          // Render only a subset of labels if too dense
          if (data.length > 6 && index % 2 !== 0 && index !== data.length - 1) return null;
          const x = (index / (data.length - 1)) * (chartWidth - 20) + 10;
          return (
            <SvgText
              key={index}
              x={x}
              y={height - 5}
              fill={Colors.textSecondary}
              fontSize={10}
              fontWeight="500"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export const BarChart: React.FC<ChartProps> = ({ data, height = 160 }) => {
  const chartWidth = SCREEN_WIDTH - 64;
  const chartHeight = height - 40;

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 10);
  const barWidth = Math.max(12, (chartWidth - 40) / data.length - 12);
  const spacing = (chartWidth - 20 - barWidth * data.length) / (data.length - 1);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.softCopper} />
            <Stop offset="100%" stopColor={Colors.copper} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((p, idx) => {
          const y = 10 + p * (chartHeight - 20);
          return (
            <Line
              key={idx}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke={Colors.border}
              strokeWidth={1}
            />
          );
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const x = 10 + index * (barWidth + spacing);
          const barHeight = (d.value / maxValue) * (chartHeight - 20);
          const y = chartHeight - barHeight;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill="url(#copperGrad)"
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                fill={Colors.textSecondary}
                fontSize={10}
                fontWeight="500"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

export const DonutChart: React.FC<ChartProps> = ({ data, height = 150 }) => {
  const chartWidth = SCREEN_WIDTH - 64;
  const radius = 45;
  const strokeWidth = 14;
  const center = 60;
  const circumference = 2 * Math.PI * radius;

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Colors for donut slices
  const sliceColors = [
    Colors.primary,
    Colors.copper,
    Colors.success,
    Colors.warning,
    Colors.error,
  ];

  let accumulatedPercentage = 0;

  return (
    <View style={[styles.container, styles.donutRow]}>
      <Svg width={120} height={120}>
        {data.map((d, index) => {
          const percentage = d.value / total;
          const strokeDashoffset = circumference - percentage * circumference;
          const rotation = accumulatedPercentage * 360;
          accumulatedPercentage += percentage;

          const strokeColor = sliceColors[index % sliceColors.length];

          return (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              origin={`${center}, ${center}`}
              rotation={rotation}
              strokeLinecap="round"
            />
          );
        })}
        {/* Center label */}
        <SvgText
          x={center}
          y={center + 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill={Colors.textPrimary}
        >
          Categories
        </SvgText>
      </Svg>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((d, index) => (
          <View key={index} style={styles.legendRow}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: sliceColors[index % sliceColors.length] },
              ]}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {d.label} ({Math.round((d.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
