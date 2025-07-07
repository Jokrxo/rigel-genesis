
import { ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface ExpenseBreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface ExpenseBreakdownChartProps {
  expenseBreakdown: ExpenseBreakdownItem[];
}

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ expenseBreakdown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Expense Breakdown</CardTitle>
      <CardDescription>Where your money is going</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ChartContainer
          config={{
            expenses: {
              theme: {
                light: "#64748b",
                dark: "#94a3b8",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartPieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {expenseBreakdown.map((entry, index) => (
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

export default ExpenseBreakdownChart;
