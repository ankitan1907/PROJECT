import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const PieChart = ({
  data,
  labels,
  title = 'Pie Chart',
  colors = ['#00B4D8', '#0077B6', '#90E0EF', '#03045E', '#FF6B6B', '#4CAF50', '#FFC107'],
  height = 300,
  doughnut = false
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
      
      // Process the data
      let chartData = [];
      let chartLabels = [];
      let chartColors = [];
      
      // If data is an array of objects with label and value
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        chartData = data.map(item => item.value);
        chartLabels = data.map(item => item.label);
        chartColors = data.map((item, index) => item.color || colors[index % colors.length]);
      } 
      // If data is a simple array and labels are provided
      else if (Array.isArray(data) && Array.isArray(labels)) {
        chartData = data;
        chartLabels = labels;
        chartColors = colors.slice(0, data.length);
      }
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: doughnut ? 'doughnut' : 'pie',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2,
            hoverOffset: 15,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 15,
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
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart',
          },
          cutout: doughnut ? '70%' : undefined
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, title, colors, doughnut]);
  
  return (
    <div className="chart-appear" style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PieChart;