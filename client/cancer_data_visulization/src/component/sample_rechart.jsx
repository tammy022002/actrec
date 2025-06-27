import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SampleRechart = () => {
  // Random sales data for different regions over months
  const lineChartData = [
    { month: 'January', North: 4000, South: 2400, East: 2400, West: 2000 },
    { month: 'February', North: 3000, South: 1398, East: 2210, West: 1900 },
    { month: 'March', North: 2000, South: 9800, East: 2290, West: 1500 },
    { month: 'April', North: 2780, South: 3908, East: 2000, West: 2300 },
    { month: 'May', North: 1890, South: 4800, East: 2181, West: 2900 },
    { month: 'June', North: 2390, South: 3800, East: 2500, West: 3100 },
    { month: 'July', North: 3490, South: 4300, East: 2100, West: 3200 },
  ];

  // Sales distribution by product categories for PieChart
  const pieChartData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Groceries', value: 300 },
    { name: 'Furniture', value: 200 },
    { name: 'Sports', value: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div>
      <h2>Sales Data Visualization</h2>
      
      {/* Line Chart for monthly sales data across regions */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="North" stroke="#8884d8" />
          <Line type="monotone" dataKey="South" stroke="#82ca9d" />
          <Line type="monotone" dataKey="East" stroke="#FF8042" />
          <Line type="monotone" dataKey="West" stroke="#AF19FF" />
        </LineChart>
      </ResponsiveContainer>

      {/* Pie Chart for product category sales distribution */}
      <div style={{ marginTop: '40px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SampleRechart;

