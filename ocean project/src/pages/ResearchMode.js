import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUpload,
  FaDownload,
  FaTrash,
  FaChartBar,
  FaTable,
  FaSearch,
  FaFile,
  FaFileCsv,
  FaFileCode,
  FaTimes // ✅ Add this here
} from 'react-icons/fa';


// Components
import LineChart from '../components/ui/LineChart';
import BarChart from '../components/ui/BarChart';
import PieChart from '../components/ui/PieChart';

// API
import { fetchResearchData, fetchResearchDataByFilename, uploadResearchData } from '../api';

const ResearchMode = () => {
  const [loading, setLoading] = useState(true);
  const [researchFiles, setResearchFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', or 'pie'
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    dataType: 'temperature', // Default data type
    file: null
  });
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const files = await fetchResearchData();
        setResearchFiles(files);
      } catch (error) {
        console.error("Error fetching research data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter files based on search term
  const filteredFiles = researchFiles.filter(file => 
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.data_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle file selection
  const handleFileSelect = async (file) => {
    try {
      setLoading(true);
      setSelectedFile(file);
      const data = await fetchResearchDataByFilename(file.filename);
      setSelectedData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching file data:", error);
      setLoading(false);
    }
  };
  
  // Handle upload form changes
  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    setUploadForm({
      ...uploadForm,
      file: e.target.files[0]
    });
  };
  
  // Handle upload form submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.title) {
      alert('Please provide a title and select a file');
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('data_type', uploadForm.dataType);
      
      await uploadResearchData(formData);
      
      // Reset form and refresh data
      setUploadForm({
        title: '',
        description: '',
        dataType: 'temperature',
        file: null
      });
      
      setUploadModalOpen(false);
      
      // Refresh the file list
      const files = await fetchResearchData();
      setResearchFiles(files);
      
      setLoading(false);
    } catch (error) {
      console.error("Error uploading research data:", error);
      setLoading(false);
    }
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!selectedData || !selectedData.data) return null;
    
    const data = selectedData.data;
    
    // Check if data is an array of objects with common keys
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      // Get all numeric keys
      const keys = Object.keys(data[0]).filter(key => 
        typeof data[0][key] === 'number'
      );
      
      // Get dates or other x-axis values
      let labels = [];
      
      // Look for date-like fields
      const dateFields = ['date', 'timestamp', 'time', 'year', 'month', 'day'];
      const dateField = dateFields.find(field => data[0][field] !== undefined);
      
      if (dateField) {
        labels = data.map(item => {
          if (typeof item[dateField] === 'string' && 
              (item[dateField].includes('-') || 
               item[dateField].includes('/') || 
               item[dateField].includes('T'))) {
            return new Date(item[dateField]).toLocaleDateString();
          }
          return item[dateField].toString();
        });
      } else {
        // Use the first string field or just indices
        const firstStringField = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'string'
        );
        
        if (firstStringField) {
          labels = data.map(item => item[firstStringField]);
        } else {
          labels = data.map((_, index) => `Item ${index + 1}`);
        }
      }
      
      // Create datasets
      const datasets = keys.map((key, index) => ({
        label: key,
        data: data.map(item => item[key]),
        color: [
          '#00B4D8', '#0077B6', '#FF6B6B', 
          '#4CAF50', '#FFC107', '#03045E', 
          '#CAF0F8', '#90E0EF', '#48CAE4'
        ][index % 9]
      }));
      
      return { labels, datasets };
    }
    
    // Handle other data formats or return null if not chartable
    return null;
  };
  
  // Prepare pie chart data
  const preparePieChartData = () => {
    if (!selectedData || !selectedData.data) return null;
    
    const data = selectedData.data;
    
    // Check if data is an object with keys and numeric values for pie chart
    if (!Array.isArray(data) && typeof data === 'object') {
      const labels = Object.keys(data);
      const values = Object.values(data).filter(value => typeof value === 'number');
      
      if (values.length > 0) {
        return {
          data: values,
          labels: labels.slice(0, values.length)
        };
      }
    }
    
    // Check if data is an array of objects with a name/label and value property
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      // Look for common name/value patterns
      const nameFields = ['name', 'label', 'category', 'type', 'key'];
      const valueFields = ['value', 'count', 'amount', 'total'];
      
      const nameField = nameFields.find(field => data[0][field] !== undefined);
      const valueField = valueFields.find(field => 
        data[0][field] !== undefined && typeof data[0][field] === 'number'
      );
      
      if (nameField && valueField) {
        return {
          data: data.map(item => item[valueField]),
          labels: data.map(item => item[nameField])
        };
      }
      
      // If we can't find standard name/value pairs, return null
      return null;
    }
    
    return null;
  };
  
  const chartData = prepareChartData();
  const pieChartData = preparePieChartData();
  
  // Get file icon based on data type
  const getFileIcon = (dataType) => {
    switch (dataType) {
      case 'temperature':
      case 'salinity':
      case 'ph':
        return <FaChartBar className="text-ocean" />;
      case 'species':
      case 'migration':
        return <FaFileCsv className="text-algae" />;
      case 'custom':
        return <FaFileCode className="text-coral" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };
  
  // Format file size
  const formatFileSize = (size) => {
    if (!size) return 'Unknown';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Render loading state
  if (loading && !selectedFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="ocean-loader"></div>
        <p className="ml-4 text-lg text-ocean-dark">Loading research data...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Research Mode</h1>
          <p className="text-gray-600">Upload and analyze your own ocean datasets</p>
        </div>
        <button
          className="btn-primary flex items-center"
          onClick={() => setUploadModalOpen(true)}
        >
          <FaUpload className="mr-2" />
          Upload Data
        </button>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File browser */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Research Datasets</h2>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-ocean-medium"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* File list */}
          <div className="border rounded-md overflow-hidden">
            {filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No research datasets found</p>
                <p className="text-sm mt-1">Upload a dataset to get started</p>
              </div>
            ) : (
              <ul className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredFiles.map((file, index) => (
                  <li 
                    key={index}
                    className={`border-b last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer ${
                      selectedFile?.filename === file.filename ? 'bg-ocean-lightest' : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-gray-100 rounded-md">
                        {getFileIcon(file.data_type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-800">{file.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{file.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>{file.data_type}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Data viewer */}
        <div className="lg:col-span-2">
          {selectedData ? (
            <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedData.title}</h2>
                  <p className="text-sm text-gray-600">{selectedData.description}</p>
                </div>
                
                <div className="flex">
                  <button
                    className={`px-3 py-1 rounded-l-md border ${
                      viewMode === 'chart' 
                        ? 'bg-ocean text-white border-ocean' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('chart')}
                  >
                    <FaChartBar className="h-4 w-4" />
                  </button>
                  <button
                    className={`px-3 py-1 rounded-r-md border border-l-0 ${
                      viewMode === 'table' 
                        ? 'bg-ocean text-white border-ocean' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('table')}
                  >
                    <FaTable className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Chart type selector (only for chart view) */}
              {viewMode === 'chart' && (
                <div className="flex space-x-2 mb-4">
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      chartType === 'line' 
                        ? 'bg-ocean text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      chartType === 'bar' 
                        ? 'bg-ocean text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${
                      chartType === 'pie' 
                        ? 'bg-ocean text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setChartType('pie')}
                  >
                    Pie
                  </button>
                </div>
              )}
              
              <div className="flex-1 overflow-auto">
                {viewMode === 'chart' ? (
                  <div className="h-full flex flex-col">
                    {chartType === 'line' && chartData ? (
                      <div className="flex-1">
                        <LineChart 
                          data={chartData.datasets}
                          labels={chartData.labels}
                          height={500}
                        />
                      </div>
                    ) : chartType === 'bar' && chartData ? (
                      <div className="flex-1">
                        <BarChart 
                          data={chartData.datasets}
                          labels={chartData.labels}
                          height={500}
                        />
                      </div>
                    ) : chartType === 'pie' && pieChartData ? (
                      <div className="flex-1">
                        <PieChart 
                          data={pieChartData.data}
                          labels={pieChartData.labels}
                          height={500}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FaChartBar className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                          <p>Data format not suitable for selected chart type</p>
                          <p className="text-sm mt-1">Try a different chart type or view as table</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    {selectedData.data ? (
                      Array.isArray(selectedData.data) ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(selectedData.data[0]).map((key, index) => (
                                <th 
                                  key={index} 
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedData.data.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {Object.values(row).map((value, valueIndex) => (
                                  <td 
                                    key={valueIndex} 
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 space-y-2">
                          {Object.entries(selectedData.data).map(([key, value], index) => (
                            <div key={index} className="flex">
                              <span className="text-sm font-medium text-gray-700 w-40">{key}:</span>
                              <span className="text-sm text-gray-500">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FaTable className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                          <p>No data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedData.upload_date && (
                    <span>
                      Uploaded: {new Date(selectedData.upload_date).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex items-center px-3 py-1 text-sm bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">
                    <FaDownload className="mr-1 h-3 w-3" />
                    Download
                  </button>
                  <button className="flex items-center px-3 py-1 text-sm bg-white border border-gray-200 rounded-md text-red-500 hover:bg-red-50 hover:border-red-200">
                    <FaTrash className="mr-1 h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700">No dataset selected</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a dataset from the list to view its contents, or upload a new dataset.
                </p>
                <button
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ocean hover:bg-ocean-dark focus:outline-none"
                  onClick={() => setUploadModalOpen(true)}
                >
                  <FaUpload className="mr-2 h-4 w-4" />
                  Upload Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Upload modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Upload Research Data</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setUploadModalOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleUploadSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-medium focus:border-ocean-medium"
                      required
                      value={uploadForm.title}
                      onChange={handleUploadFormChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-medium focus:border-ocean-medium"
                      value={uploadForm.description}
                      onChange={handleUploadFormChange}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">
                      Data Type
                    </label>
                    <select
                      id="dataType"
                      name="dataType"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-medium focus:border-ocean-medium"
                      value={uploadForm.dataType}
                      onChange={handleUploadFormChange}
                    >
                      <option value="temperature">Temperature Data</option>
                      <option value="salinity">Salinity Data</option>
                      <option value="ph">pH Data</option>
                      <option value="species">Species Data</option>
                      <option value="migration">Migration Data</option>
                      <option value="custom">Custom Dataset</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                      JSON File <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-ocean-medium hover:text-ocean-dark focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              accept=".json"
                              onChange={handleFileInputChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        
                        <p className="text-xs text-gray-500">JSON files only, max 10MB</p>
                        
                        {uploadForm.file && (
                          <p className="text-sm text-ocean-dark font-medium mt-2">
                            {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setUploadModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ocean hover:bg-ocean-dark focus:outline-none"
                    disabled={!uploadForm.file || !uploadForm.title}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ResearchMode;