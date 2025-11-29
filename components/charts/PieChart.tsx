'use client';

import { Pie } from 'react-chartjs-2';
import {
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import Chart from 'chart.js/auto';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  title?: string;
  className?: string;
}

export default function PieChart({
  data,
  title = 'Distribution Chart',
  className = ''
}: PieChartProps) {
  const chartRef = useRef<Chart<'pie'> | null>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const
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
        <Pie ref={chartRef} data={data} options={options} />
      </div>
    </motion.div>
  );
}