import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import type { ChartDataPoint } from '../types/models';
import { AppColors } from '../theme/colors';

interface BudgetHealthChartProps {
  data: ChartDataPoint[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <View style={styles.tooltip}>
        <Text style={styles.tooltipTitle}>{label}</Text>
        <Text style={styles.tooltipText}>Allocated: ${data.allocated.toFixed(2)}</Text>
        <Text style={styles.tooltipText}>Spent: ${data.spent.toFixed(2)}</Text>
        <Text style={styles.tooltipText}>Available: ${data.available.toFixed(2)}</Text>
        <Text style={styles.tooltipText}>
          Status: {data.spentPercentage.toFixed(0)}% used
        </Text>
      </View>
    );
  }
  return null;
};

export default function BudgetHealthChart({ data }: BudgetHealthChartProps) {
  const chartHeight = Math.max(300, data.length * 60);

  return (
    <View style={styles.container}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={AppColors.chartGrid} />
          <XAxis
            type="number"
            stroke={AppColors.textSecondary}
            tick={{ fill: AppColors.textSecondary }}
          />
          <YAxis
            dataKey="categoryName"
            type="category"
            width={90}
            stroke={AppColors.textSecondary}
            tick={{ fill: AppColors.textSecondary }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: AppColors.textSecondary }}
            iconType="circle"
          />
          <Bar
            dataKey="spent"
            stackId="a"
            fill={AppColors.oliveGreen}
            name="Spent"
            shape={(props: any) => {
              const { fill, ...rest } = props;
              const dataPoint = data.find(d => d.categoryName === props.categoryName);
              return <rect {...rest} fill={dataPoint?.healthColor || fill} />;
            }}
          />
          <Bar
            dataKey="available"
            stackId="a"
            fill={AppColors.chartNeutral}
            name="Available"
          />
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  tooltip: {
    backgroundColor: AppColors.surfaceElevated,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  tooltipTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  tooltipText: {
    fontSize: 12,
    marginBottom: 4,
    color: AppColors.textSecondary,
  },
});
