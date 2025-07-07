
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface MonthlyDataItem {
  month: string;
  income: number;
  expenses: number;
}

interface RevenueExpensesChartProps {
  monthlyData: MonthlyDataItem[];
}

const RevenueExpensesChart: React.FC<RevenueExpensesChartProps> = ({ monthlyData }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>Six-month financial performance</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="linear"
              dataKey="income"
              name="Income"
              stroke="#9b87f5"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="linear"
              dataKey="expenses"
              name="Expenses"
              stroke="#7E69AB"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default RevenueExpensesChart;
