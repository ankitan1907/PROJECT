import React from 'react';
import { UserRound, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import Card from '../ui/Card';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  actions?: React.ReactNode;
  onClick?: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  actions,
  onClick
}) => {
  return (
    <Card
      className={`h-full transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-103 hover:translate-y-[-4px]' : ''}`}
      onClick={onClick}
      actions={actions}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <UserRound size={24} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-800">{employee.fullName}</h3>
            <p className="text-sm text-gray-500">{employee.code}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Briefcase size={16} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {employee.designation}
              {employee.subDesignation && ` (${employee.subDesignation})`}
            </span>
          </div>
          
          <div className="flex items-center">
            <GraduationCap size={16} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{employee.qualification}</span>
          </div>
          
          <div className="flex items-center">
            <BookOpen size={16} className="text-gray-400 mr-2" />
            <span className="text-sm">
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  employee.hindiKnowledge === 'Good'
                    ? 'bg-green-100 text-green-800'
                    : employee.hindiKnowledge === 'Average'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {employee.hindiKnowledge}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeCard;