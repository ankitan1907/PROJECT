import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Filter } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useEmployees } from '../context/EmployeeContext';
import { Employee, EmployeeDesignation, HindiKnowledge } from '../types';
import EmployeeForm from '../components/employee/EmployeeForm';

const ViewEmployeesPage: React.FC = () => {
  const { employees, deleteEmployee, updateEmployee } = useEmployees();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    designation: string;
    hindiKnowledge: string;
    employeeCode: string;
  }>({
    designation: '',
    hindiKnowledge: '',
    employeeCode: '',
  });
  const [sortField, setSortField] = useState<keyof Employee>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete);
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = (updatedData: Partial<Employee>) => {
    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, updatedData);
      setIsEditModalOpen(false);
      setEmployeeToEdit(null);
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let result = employees.filter((employee) => {
      const matchesSearch = employee.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCode = employee.code
        .toLowerCase()
        .includes(filters.employeeCode.toLowerCase());

      const matchesDesignation =
        !filters.designation || employee.designation === filters.designation;

      const matchesHindiKnowledge =
        !filters.hindiKnowledge ||
        employee.hindiKnowledge === filters.hindiKnowledge;

      return (
        matchesSearch && matchesCode && matchesDesignation && matchesHindiKnowledge
      );
    });

    return result.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [employees, searchTerm, filters, sortField, sortDirection]);

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

  const columns = [
    {
      title: 'Code',
      field: 'code',
      sortable: true,
    },
    {
      title: 'Full Name',
      field: 'fullName',
      sortable: true,
    },
    {
      title: 'Designation',
      field: (employee: Employee) => {
        return employee.subDesignation
          ? `${employee.designation} (${employee.subDesignation})`
          : employee.designation;
      },
      sortable: false,
    },
    {
      title: 'Hindi Knowledge',
      field: 'hindiKnowledge',
      render: (value: HindiKnowledge) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === 'Good'
              ? 'bg-green-100 text-green-800'
              : value === 'Average'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
      sortable: true,
    },
    {
      title: 'Qualification',
      field: 'qualification',
      sortable: true,
    },
  ];

  return (
    <Layout title="View Employees">
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-card flex flex-wrap gap-4 items-center">
          <div className="flex-1 flex flex-wrap gap-4 items-center">
            <div className="w-64">
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="m-0"
              />
            </div>
            <div className="w-64">
              <Input
                placeholder="Search by employee code..."
                value={filters.employeeCode}
                name="employeeCode"
                onChange={handleFilterChange}
                className="m-0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setIsFilterModalOpen(true)}
            >
              More Filters
            </Button>
          </div>
        </div>

        {(filters.designation || filters.hindiKnowledge) && (
          <div className="flex gap-2 flex-wrap">
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
            <button
              onClick={() =>
                setFilters({ designation: '', hindiKnowledge: '', employeeCode: '' })
              }
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        <Table
          data={filteredAndSortedEmployees}
          columns={columns}
          keyField="id"
          sortColumn={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No employees found matching your criteria"
          actions={(employee) => (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={16} />}
                onClick={() => handleEdit(employee)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(employee.id)}
              >
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Employees"
        footer={
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ designation: '', hindiKnowledge: '', employeeCode: '' });
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        size="lg"
      >
        {employeeToEdit && (
          <EmployeeForm
            initialData={employeeToEdit}
            onSubmit={handleUpdateEmployee}
            buttonText="Update Employee"
          />
        )}
      </Modal>
    </Layout>
  );
};

export default ViewEmployeesPage;