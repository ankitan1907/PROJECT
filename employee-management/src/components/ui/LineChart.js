import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const LineChart = ({ 
  data, 
  labels, 
  title = 'Line Chart', 
  yAxisLabel = '',
  xAxisLabel = '',
  colors = ['#00B4D8', '#0077B6', '#FF6B6B'],
  height = 300
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
          borderColor: dataset.color || colors[index % colors.length],
          backgroundColor: `${dataset.color || colors[index % colors.length]}20`,
          borderWidth: 2,
          pointBackgroundColor: dataset.color || colors[index % colors.length],
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: dataset.fill || false,
        }));
      } 
      // If data is a simple array, create a single dataset
      else if (Array.isArray(data)) {
        datasets = [{
          label: title,
          data: data,
          borderColor: colors[0],
          backgroundColor: `${colors[0]}20`,
          borderWidth: 2,
          pointBackgroundColor: colors[0],
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
        }];
      }
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
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
              usePointStyle: true,
              callbacks: {
                // Format label to include the value
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString();
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
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
                display: false
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
                color: 'rgba(226, 232, 240, 0.6)'
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
            tension: {
              duration: 1000,
              easing: 'easeOutQuad',
              from: 0.8,
              to: 0.3,
              loop: false
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
  }, [data, labels, title, yAxisLabel, xAxisLabel, colors]);
  
  return (
    <div className="chart-appear" style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LineChart;