import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
)

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter'
  data: any
  options?: any
  className?: string
}

export function Chart({ type, data, options = {}, className = '' }: ChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    ...options,
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={defaultOptions} />
      case 'bar':
        return <Bar data={data} options={defaultOptions} />
      case 'pie':
        return <Pie data={data} options={defaultOptions} />
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />
      case 'scatter':
        return <Scatter data={data} options={defaultOptions} />
      default:
        return null
    }
  }

  return (
    <div className={`w-full h-[300px] ${className}`}>
      {renderChart()}
    </div>
  )
} 