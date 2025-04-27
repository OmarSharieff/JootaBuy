"use client"; // Marks this file to run on the client side

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts"; // Import chart components from Recharts

// Props type for the Chart component
interface iAppProps {
  data: {
    date: string;
    revenue: number;
  }[];
}

// Helper function to aggregate revenue by date
const aggregateData = (data: any) => {
  const aggregated = data.reduce((acc: any, curr: any) => {
    if (acc[curr.date]) {
      acc[curr.date] += curr.revenue; // If date already exists, add to revenue
    } else {
      acc[curr.date] = curr.revenue; // Otherwise, initialize revenue
    }
    return acc;
  }, {});

  // Convert aggregated object back into an array
  return Object.keys(aggregated).map((date) => ({
    date,
    revenue: aggregated[date],
  }));
};

// Chart component that displays revenue over time
export function Chart({ data }: iAppProps) {
  const proccesedData = aggregateData(data); // Aggregate and prepare the data for the chart

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={proccesedData}>
        <CartesianGrid strokeDasharray="3 3" /> {/* Adds a grid to the chart */}
        <XAxis dataKey="date" /> {/* X-axis using the 'date' key */}
        <YAxis /> {/* Y-axis for revenue values */}
        <Tooltip /> {/* Shows data on hover */}
        <Legend /> {/* Displays a legend for the chart */}
        <Line
          type="monotone"
          stroke="#3b82f6"
          activeDot={{ r: 8 }}
          dataKey="revenue" // Draws the revenue line
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
