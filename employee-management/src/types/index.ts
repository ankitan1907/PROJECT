export type EmployeeDesignation = 'Director' | 'Group Director' | 'Group';
export type GroupDirectorSubDesignation = 'A' | 'B' | 'C' | 'D';
export type HindiKnowledge = 'Good' | 'Average' | 'Null';

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  designation: EmployeeDesignation;
  subDesignation?: string;
  hindiKnowledge: HindiKnowledge;
  qualification: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In a real app, this would never be stored like this
}