
import { ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface IncomeBreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface IncomeBreakdownChartProps {
  incomeBreakdown: IncomeBreakdownItem[];
}

const IncomeBreakdownChart: React.FC<IncomeBreakdownChartProps> = ({ incomeBreakdown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Income Sources</CardTitle>
      <CardDescription>Your revenue channels</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ChartContainer
          config={{
            income: {
              theme: {
                light: "#3B82F6",
                dark: "#60a5fa",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={incomeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {incomeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value: number) => `R ${value.toLocaleString()}`} />
            </RechartPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </CardContent>
  </Card>
);

export default IncomeBreakdownChart;
