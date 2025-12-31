'use client';

import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BookingChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor?: string;
      tension: number;
      fill?: boolean;
    }[];
  };
  title?: string;
  className?: string;
}

export default function BookingChart({
  data,
  title = 'Monthly Bookings',
  className = ''
}: BookingChartProps) {
  const chartRef = useRef<Chart<'line'> | null>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: '#3b82f6',
        borderColor: '#fff',
        borderWidth: 2
      }
    }
  };

  useEffect(() => {
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
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </motion.div>
  );
}