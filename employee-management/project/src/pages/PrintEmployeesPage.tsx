import React, { useState, useRef } from 'react';
import { Printer, Download, Filter } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Employee, EmployeeDesignation, HindiKnowledge } from '../types';
import { useEmployees } from '../context/EmployeeContext';

const PrintEmployeesPage: React.FC = () => {
  const { employees } = useEmployees();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState({
    designation: '',
    hindiKnowledge: '',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContent.innerHTML;
      
      window.print();
      
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    return (
      (!filters.designation || employee.designation === filters.designation) &&
      (!filters.hindiKnowledge || employee.hindiKnowledge === filters.hindiKnowledge)
    );
  });

  const designationOptions = [
    { value: '', label: 'All Designations' },
    { value: 'Director', label: 'Director' },
    { value: 'Group Director', label: 'Group Director' },
    { value: 'Group', label: 'Group' },
  ];

  const hindiKnowledgeOptions = [
    { value: '', label: 'All Hindi Knowledge Levels' },
    { value: 'Good', label: 'Good' },
    { value: 'Average', label: 'Average' },
    { value: 'Null', label: 'Null' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Layout title="Print Employee Records">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Employee Records</h2>
              <p className="text-gray-500">
                {filteredEmployees.length} employees {filters.designation && `with ${filters.designation} designation`} {filters.hindiKnowledge && `having ${filters.hindiKnowledge} Hindi knowledge`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                icon={<Filter size={16} />}
                onClick={() => setIsFilterModalOpen(true)}
              >
                Filter
              </Button>
              <Button 
                variant="primary"
                icon={<Printer size={16} />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button 
                variant="secondary"
                icon={<Download size={16} />}
                onClick={() => {/* Would handle export to PDF/CSV */}}
              >
                Export
              </Button>
            </div>
          </div>
          
          {(filters.designation || filters.hindiKnowledge) && (
            <div className="mb-6 flex gap-2 flex-wrap">
              {filters.designation && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">Designation:</span>
                  <span className="font-medium">{filters.designation}</span>
                </div>
              )}
              {filters.hindiKnowledge && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">Hindi Knowledge:</span>
                  <span className="font-medium">{filters.hindiKnowledge}</span>
                </div>
              )}
            </div>
          )}
          
          <div ref={printRef} className="print-container">
            <div className="print-header text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Management System</h1>
              <p className="text-lg text-gray-700 mb-1">Employee Records</p>
              <p className="text-sm text-gray-500">Generated on {currentDate}</p>
            </div>
            
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No employees match the selected criteria.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hindi Knowledge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.designation}
                        {employee.subDesignation && ` (${employee.subDesignation})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            employee.hindiKnowledge === 'Good'
                              ? 'bg-green-100 text-green-800'
                              : employee.hindiKnowledge === 'Average'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.hindiKnowledge}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.qualification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Print Records"
        footer={
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ designation: '', hindiKnowledge: '' });
                setIsFilterModalOpen(false);
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={() => setIsFilterModalOpen(false)}>Apply</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Designation"
            name="designation"
            value={filters.designation}
            onChange={handleFilterChange}
            options={designationOptions}
          />
          <Select
            label="Hindi Knowledge"
            name="hindiKnowledge"
            value={filters.hindiKnowledge}
            onChange={handleFilterChange}
            options={hindiKnowledgeOptions}
          />
        </div>
      </Modal>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2cm;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PrintEmployeesPage;