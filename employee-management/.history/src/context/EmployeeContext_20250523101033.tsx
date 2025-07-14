import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Employee, HindiKnowledge } from '../types';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByHindiKnowledge: (knowledge: HindiKnowledge) => Employee[];
  getHindiKnowledgeCounts: () => { Good: number; Average: number; Null: number; Total: number };
  qualifications: string[];
  addQualification: (qualification: string) => void;
  customSubDesignations: string[];
  addCustomSubDesignation: (subDesignation: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

interface EmployeeProviderProps {
  children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([
    'PhD',
    'MSc',
    'BSc',
    'MBA',
    'BTech',
    'MTech',
  ]);
  const [customSubDesignations, setCustomSubDesignations] = useState<string[]>([
    'Scientist A',
    'Scientist B',
    'Scientist C',
    'Scientist D',
    'Scientist E',
    'Scientist F',
  ]);

  // Fetch employees from backend on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost/employee-management/project/backend/api.php');
      const data = await response.json();
      // Assume backend returns array of employees
      // Convert date strings to Date objects if necessary:
      const employeesWithDates = data.map((emp: any) => ({
        ...emp,
        createdAt: new Date(emp.created_at || emp.createdAt),
      }));
      setEmployees(employeesWithDates);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost/employee-management/project/backend/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      const newEmployee = await response.json();
      // Assuming backend returns the newly created employee with ID and createdAt
      setEmployees((prev) => [...prev, { ...newEmployee, createdAt: new Date(newEmployee.createdAt) }]);
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };

  const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
    try {
      await fetch('http://localhost/employee-management/project/backend/api.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...updatedEmployee, id, action: 'update' }),
});


      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, ...updatedEmployee } : emp))
      );
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await fetch(`http://localhost/employee-management/project/backend/api.php?id=${id}`, {
        method: 'DELETE',
      });
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const getEmployeeById = (id: string) => employees.find((employee) => employee.id === id);

  const getEmployeesByHindiKnowledge = (knowledge: HindiKnowledge) =>
    employees.filter((employee) => employee.hindiKnowledge === knowledge);

  const getHindiKnowledgeCounts = () => {
    const counts = { Good: 0, Average: 0, Null: 0, Total: 0 };
    employees.forEach((employee) => {
      counts[employee.hindiKnowledge]++;
      counts.Total++;
    });
    return counts;
  };

  const addQualification = (qualification: string) => {
    if (!qualifications.includes(qualification)) {
      setQualifications((prev) => [...prev, qualification]);
    }
  };

  const addCustomSubDesignation = (subDesignation: string) => {
    if (!customSubDesignations.includes(subDesignation)) {
      setCustomSubDesignations((prev) => [...prev, subDesignation]);
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        getEmployeesByHindiKnowledge,
        getHindiKnowledgeCounts,
        qualifications,
        addQualification,
        customSubDesignations,
        addCustomSubDesignation,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployees must be used within an EmployeeProvider');
  return context;
};
