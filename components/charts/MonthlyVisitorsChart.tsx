'use client';

import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

interface MonthlyVisitorsChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor: string | string[];
      borderWidth: number;
    }[];
  };
  title?: string;
  className?: string;
}

export default function MonthlyVisitorsChart({
  data,
  title = 'Monthly Visitors',
  className = ''
}: MonthlyVisitorsChartProps) {
  const chartRef = useRef<Chart<'bar'> | null>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill its container
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: string | number) {
            if (typeof value === 'number') {
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
            }
            return value;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    },
    borderRadius: 4,
    borderSkipped: false,
    barPercentage: 0.6,
    categoryPercentage: 0.7
  };

  useEffect(() => {
    // Animation effect when data changes
    if (chartRef.current) {
      // @ts-ignore
      const chart = chartRef.current;
      chart.update();
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-full ${className}`}
    >
      <div className="w-full h-64 sm:h-72 md:h-80">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </motion.div>
  );
}