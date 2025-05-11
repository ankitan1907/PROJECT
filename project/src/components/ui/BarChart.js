import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const BarChart = ({
  data,
  labels,
  title = 'Bar Chart',
  yAxisLabel = '',
  xAxisLabel = '',
  colors = ['#00B4D8', '#0077B6', '#FF6B6B', '#4CAF50', '#FFC107'],
  horizontal = false,
  height = 300,
  stacked = false
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Make sure we have a reference and data
    if (chartRef.current && data && labels) {
      const ctx = chartRef.current.getContext('2d');
      
      // Process datasets
      let datasets = [];
      
      // If data is an array of objects with dataset structure
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].hasOwnProperty('data')) {
        datasets = data.map((dataset, index) => ({
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data,
          backgroundColor: dataset.color || colors[index % colors.length],
          borderColor: dataset.borderColor || 'rgba(255, 255, 255, 0.5)',
          borderWidth: dataset.borderWidth || 1,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        }));
      } 
      // If data is a simple array, create a single dataset
      else if (Array.isArray(data)) {
        datasets = [{
          label: title,
          data: data,
          backgroundColor: colors[0],
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        }];
      }
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: horizontal ? 'bar' : 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          indexAxis: horizontal ? 'y' : 'x',
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                }
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1e293b',
              bodyColor: '#475569',
              titleFont: {
                size: 13,
                weight: 'bold',
                family: "'Inter', sans-serif",
              },
              bodyFont: {
                size: 12,
                family: "'Inter', sans-serif",
              },
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              padding: 10,
              boxPadding: 3,
              usePointStyle: true
            }
          },
          scales: {
            x: {
              stacked: stacked,
              title: {
                display: !!xAxisLabel,
                text: xAxisLabel,
                color: '#64748b',
                font: {
                  size: 12,
                  weight: 'normal'
                }
              },
              grid: {
                display: horizontal // Show grid lines for horizontal bars
              },
              ticks: {
                font: {
                  size: 11,
                  family: "'Inter', sans-serif"
                },
                color: '#94a3b8'
              }
            },
            y: {
              stacked: stacked,
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel,
                color: '#64748b',
                font: {
                  size: 12,
                  weight: 'normal'
                }
              },
              grid: {
                display: !horizontal // Hide grid lines for horizontal bars
              },
              ticks: {
                font: {
                  size: 11,
                  family: "'Inter', sans-serif"
                },
                color: '#94a3b8'
              },
              beginAtZero: true
            }
          },
          animations: {
            y: {
              duration: 1000,
              delay: (context) => context.dataIndex * 100
            },
            x: {
              duration: 1000,
              delay: (context) => context.dataIndex * 100
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, title, yAxisLabel, xAxisLabel, colors, horizontal, stacked]);
  
  return (
    <div className="chart-appear" style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default BarChart;