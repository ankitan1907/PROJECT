import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Employee, HindiKnowledge } from '../types';

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByHindiKnowledge: (knowledge: HindiKnowledge) => Employee[];
  getHindiKnowledgeCounts: () => { Good: number; Average: number; Null: number; Total: number };
  qualifications: string[];
  addQualification: (qualification: string) => void;
  customSubDesignations: string[];
  addCustomSubDesignation: (subDesignation: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Sample data
const initialEmployees: Employee[] = [
  {
    id: '1',
    code: 'EMP001',
    fullName: 'John Doe',
    designation: 'Director',
    hindiKnowledge: 'Good',
    qualification: 'PhD',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    code: 'EMP002',
    fullName: 'Jane Smith',
    designation: 'Group Director',
    subDesignation: 'A',
    hindiKnowledge: 'Average',
    qualification: 'MBA',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    code: 'EMP003',
    fullName: 'Robert Johnson',
    designation: 'Group',
    subDesignation: 'Scientist B',
    hindiKnowledge: 'Null',
    qualification: 'MSc',
    createdAt: new Date('2023-03-10'),
  },
  {
    id: '4',
    code: 'EMP004',
    fullName: 'Emily Chen',
    designation: 'Group',
    subDesignation: 'Scientist A',
    hindiKnowledge: 'Good',
    qualification: 'PhD',
    createdAt: new Date('2023-04-05'),
  },
  {
    id: '5',
    code: 'EMP005',
    fullName: 'Michael Brown',
    designation: 'Group Director',
    subDesignation: 'B',
    hindiKnowledge: 'Average',
    qualification: 'MSc',
    createdAt: new Date('2023-05-12'),
  },
];

const initialQualifications = ['PhD', 'MSc', 'BSc', 'MBA', 'BTech', 'MTech'];
const initialCustomSubDesignations = ['Scientist A', 'Scientist B', 'Scientist C', 'Scientist D', 'Scientist E', 'Scientist F'];

interface EmployeeProviderProps {
  children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [qualifications, setQualifications] = useState<string[]>(initialQualifications);
  const [customSubDesignations, setCustomSubDesignations] = useState<string[]>(initialCustomSubDesignations);

  // Load initial data
  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    const storedQualifications = localStorage.getItem('qualifications');
    const storedSubDesignations = localStorage.getItem('customSubDesignations');

    setEmployees(storedEmployees ? JSON.parse(storedEmployees) : initialEmployees);
    setQualifications(storedQualifications ? JSON.parse(storedQualifications) : initialQualifications);
    setCustomSubDesignations(storedSubDesignations ? JSON.parse(storedSubDesignations) : initialCustomSubDesignations);
  }, []);

  // Save data on changes
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('qualifications', JSON.stringify(qualifications));
  }, [qualifications]);

  useEffect(() => {
    localStorage.setItem('customSubDesignations', JSON.stringify(customSubDesignations));
  }, [customSubDesignations]);

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
    setEmployees((prev) => 
      prev.map((employee) => 
        employee.id === id ? { ...employee, ...updatedEmployee } : employee
      )
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const getEmployeeById = (id: string) => {
    return employees.find((employee) => employee.id === id);
  };

  const getEmployeesByHindiKnowledge = (knowledge: HindiKnowledge) => {
    return employees.filter((employee) => employee.hindiKnowledge === knowledge);
  };

  const getHindiKnowledgeCounts = () => {
    const counts = {
      Good: 0,
      Average: 0,
      Null: 0,
      Total: 0,
    };

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

  const value = {
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
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};