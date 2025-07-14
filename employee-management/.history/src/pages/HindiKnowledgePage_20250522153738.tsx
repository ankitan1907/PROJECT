import React, { useState } from 'react';
import { UserPlus, User } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmployeeForm from '../components/employee/EmployeeForm';
import EmployeeCard from '../components/employee/EmployeeCard';
import { useEmployees } from '../context/EmployeeContext';
import { Employee, HindiKnowledge } from '../types';

const HindiKnowledgePage: React.FC = () => {
  const { 
    getEmployeesByHindiKnowledge, 
    getHindiKnowledgeCounts,
    addEmployee,
    deleteEmployee,
    updateEmployee
  } = useEmployees();

  // State for current selected filter/category
  const [selectedCategory, setSelectedCategory] = useState<HindiKnowledge | 'Total'>('Total');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Get counts for summary cards
  const counts = getHindiKnowledgeCounts();

  // When user clicks Add Employee, open add modal with current category
  const handleAdd = (category: HindiKnowledge) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  // Edit employee handler
  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  };

  // Remove employee handler
  const handleRemove = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  // Add employee form submit handler
  const handleAddSubmit = (employeeData: any) => {
    addEmployee({
      ...employeeData,
      hindiKnowledge: selectedCategory === 'Total' ? 'Null' : selectedCategory, // fallback if Total selected
    });
    setIsAddModalOpen(false);
  };

  // Edit employee form submit handler
  const handleEditSubmit = (updatedData: any) => {
    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, updatedData);
      setIsEditModalOpen(false);
      setEmployeeToEdit(null);
    }
  };

  // Confirm delete handler
  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Categories for the cards including "Total"
  const categories: (HindiKnowledge | 'Total')[] = ['Good', 'Average', 'Null', 'Total'];

  // Returns employees for the selected category or all if Total
  const getEmployeesToDisplay = () => {
    if (selectedCategory === 'Total') {
      // Combine all categories into one list
      return [
        ...getEmployeesByHindiKnowledge('Good'),
        ...getEmployeesByHindiKnowledge('Average'),
        ...getEmployeesByHindiKnowledge('Null'),
      ];
    }
    return getEmployeesByHindiKnowledge(selectedCategory);
  };

  return (
    <Layout title="Knowledge of Hindi">
      <div className="space-y-8">
        {/* Hindi Knowledge Summary */}
        <div className="text-gray-700 font-medium">
          Hindi Knowledge Summary – 
          Good: {counts.Good}, 
          Average: {counts.Average}, 
          Bad (Null): {counts.Null}
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <StatCard
              key={category}
              title={category}
              count={category === 'Total' ? counts.Total : counts[category as HindiKnowledge]}
              color={
                category === 'Good'
                  ? 'success'
                  : category === 'Average'
                  ? 'warning'
                  : category === 'Total'
                  ? 'primary'
                  : 'default'
              }
              onClick={() => setSelectedCategory(category)}
              isSelected={selectedCategory === category}
            />
          ))}
        </div>

        {/* Employees List Section */}
        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedCategory === 'Total'
                  ? 'All Employees'
                  : `Employees with ${selectedCategory} Hindi Knowledge`}
              </h2>
              {/* Only show Add Employee button for specific categories, not Total */}
              {selectedCategory !== 'Total' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserPlus size={16} />}
                  onClick={() => handleAdd(selectedCategory as HindiKnowledge)}
                >
                  Add Employee
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getEmployeesToDisplay().map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  actions={
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(employee)}
                      >
                        Remove
                      </Button>
                    </div>
                  }
                />
              ))}
              {getEmployeesToDisplay().length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No employees found in this category
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Employee with ${selectedCategory} Hindi Knowledge`}
        size="lg"
      >
        <EmployeeForm
          onSubmit={handleAddSubmit}
          initialData={{ hindiKnowledge: selectedCategory !== 'Total' ? selectedCategory : undefined }}
          buttonText="Add Employee"
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        size="lg"
      >
        {employeeToEdit && (
          <EmployeeForm
            onSubmit={handleEditSubmit}
            initialData={employeeToEdit}
            buttonText="Update Employee"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Remove"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to remove {employeeToDelete?.fullName} from the system? 
          This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  count: number;
  color: 'success' | 'warning' | 'default' | 'primary';
  onClick?: () => void;
  isSelected?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  color,
  onClick,
  isSelected
}) => {
  const colorClasses = {
    success: 'bg-green-50 border-green-100 text-green-700',
    warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    default: 'bg-gray-50 border-gray-100 text-gray-700',
    primary: 'bg-primary-50 border-primary-100 text-primary-700',
  };

  const iconColors = {
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary-100 text-primary-600',
  };

  return (
    <Card
      className={`border ${colorClasses[color]} ${
        onClick ? 'cursor-pointer transition-all hover:shadow-lg' : ''
      } ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${iconColors[color]} mr-3`}>
              <User size={20} />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          <div className="mt-4 text-3xl font-bold">{count}</div>
        </div>
      </div>
    </Card>
  );
};

export default HindiKnowledgePage;
