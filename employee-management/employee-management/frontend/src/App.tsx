import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container">
          <h1>Employee Management System</h1>
          <div className="nav-buttons">
            <Link to="/add"><button>Add Employee</button></Link>
            <Link to="/list"><button>View Employees</button></Link>
          </div>
          <Routes>
            {/* Route to add employee form */}
            <Route path="/add" element={<EmployeeForm />} />

            {/* Route to view employee list */}
            <Route path="/list" element={<EmployeeList />} />

            {/* Route to edit an employee (based on emp_code) */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
