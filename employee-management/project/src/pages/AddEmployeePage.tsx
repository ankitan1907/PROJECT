import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import EmployeeForm from '../components/employee/EmployeeForm';
import { useEmployees } from '../context/EmployeeContext';

const AddEmployeePage: React.FC = () => {
  const { addEmployee } = useEmployees();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (employeeData: any) => {
    try {
      await addEmployee(employeeData); // Wait until employee is added successfully
      setIsSuccess(true);
      setError(null); // Clear any previous error
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Failed to add employee. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <Layout title="Add Employee">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Employee Added Successfully
              </h2>
              <p className="text-gray-600">
                The employee information has been saved.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Add Employee">
      <div className="max-w-4xl mx-auto">
        <Card title="Add New Employee">
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}
          <EmployeeForm onSubmit ={handleSubmit} buttonText="Add Employee" />
        </Card>
      </div>
    </Layout>
  );
};

export default AddEmployeePage;
