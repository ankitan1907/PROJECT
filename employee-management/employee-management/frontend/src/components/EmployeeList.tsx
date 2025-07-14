import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeList.css';
interface Employee {
  emp_code: string;
  name: string;
  designation: string; // combined designation string like 'Group A' or 'Scientist B'
  knowledge_of_hindi: string;
  qualification: string;
}
const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterQualification, setFilterQualification] = useState('');
  const [sortField, setSortField] = useState<'emp_code' | 'name'>('emp_code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Updated Designation categories according to new rules
  const designationCategories = ['Director', 'Group Director', 'Group'];
  const subDesignations = ['A', 'B', 'C', 'D']; // for Group Director and Group
  const additionalDesignations = [
    'Scientist A',
    'Scientist B',
    'Scientist C',
    'Scientist D',
    'Scientist E',
    'Scientist F',
  ]; // for Group additional designation
  const [qualifications, setQualifications] = useState([
    'B.A', 'B.Sc', 'M.A', 'M.Sc',
  ]);
  const knowledgeOptions = ['10th', 'Intermediate', 'More'];
  // State for modal form fields related to designation
  const [designationCategory, setDesignationCategory] = useState('');
  const [subDesignation, setSubDesignation] = useState('');
  const [additionalDesignation, setAdditionalDesignation] = useState('');
  const [modalError, setModalError] = useState('');
  useEffect(() => {
    axios
      .get<Employee[]>('http://localhost/employee-management/backend/api/employees.php')
      .then((res) => {
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch employees:', err);
      });
  }, []);
  useEffect(() => {
    let updated = [...employees];
    if (filterCode) {
      updated = updated.filter((emp) =>
        emp.emp_code.toLowerCase().includes(filterCode.toLowerCase())
      );
    }
    if (filterName) {
      updated = updated.filter((emp) =>
        emp.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    if (filterDesignation) {
      updated = updated.filter((emp) =>
        emp.designation.toLowerCase().includes(filterDesignation.toLowerCase())
      );
    }
    if (filterQualification) {
      updated = updated.filter((emp) =>
        emp.qualification.toLowerCase().includes(filterQualification.toLowerCase())
      );
    }
    updated.sort((a, b) => {
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredEmployees(updated);
    setCurrentPage(1); // Reset to first page on filters/sort change
  }, [
    filterCode,
    filterName,
    filterDesignation,
    filterQualification,
    sortField,
    sortOrder,
    employees,
  ]);


 const toggleSort = (field: 'emp_code' | 'name') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };


 // Pagination calculations
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);


 const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };


 const goToPrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };


 // When row clicked, parse the designation string to fill the category and dropdowns for editing
  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditMode(false);
    setModalError('');


   const desig = employee.designation;

   // Parsing logic based on new categories and dropdown rules
    if (desig === 'Director') {
      setDesignationCategory('Director');
      setSubDesignation('');
      setAdditionalDesignation('');
    } else if (desig.startsWith('Group Director ')) {
      setDesignationCategory('Group Director');
      // example: 'Group Director A'
      const sub = desig.replace('Group Director ', '');
      setSubDesignation(sub);
      setAdditionalDesignation('');
    } else if (desig.startsWith('Group ')) {
      setDesignationCategory('Group');
      // example: 'Group A Scientist C'
      const parts = desig.split(' ');
      setSubDesignation(parts[1] || '');
      const addDesig = parts.slice(2).join(' ') || '';
      setAdditionalDesignation(addDesig);
    } else {
      // fallback, treat as Director or unknown
      setDesignationCategory('Director');
      setSubDesignation('');
      setAdditionalDesignation('');
    }
  };



  const handleClosePopup = () => {
    setSelectedEmployee(null);
    setEditMode(false);
    setModalError('');
  };



  const handleDelete = (emp_code: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${emp_code}?`);
    if (confirmDelete) {
      axios
        .delete('http://localhost/employee-management/backend/api/employees.php', {
          data: { emp_code },
        })
        .then(() => {
          setEmployees((prev) => prev.filter((emp) => emp.emp_code !== emp_code));
          if (selectedEmployee?.emp_code === emp_code) {
            setSelectedEmployee(null);
            setEditMode(false);
          }
        })
        .catch((err) => {
          console.error('Failed to delete employee:', err);
        });
    }
  };



  const validateFields = () => {
    if (!designationCategory) return 'Please select Designation Category.';
    if (designationCategory === 'Group Director' && !subDesignation)
      return 'Please select Sub-Designation.';
    if (designationCategory === 'Group') {
      if (!subDesignation) return 'Please select Sub-Designation.';
      if (!additionalDesignation) return 'Please select Additional Designation.';
    }
    if (!selectedEmployee?.knowledge_of_hindi) return 'Please select Knowledge of Hindi.';
    if (!selectedEmployee?.qualification) return 'Please select Qualification.';
    return '';
  };


 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');


   // Construct designation string based on new rules
    let finalDesignation = '';
    if (designationCategory === 'Director') {
      finalDesignation = 'Director';
    } else if (designationCategory === 'Group Director') {

     finalDesignation = `Group Director ${subDesignation}`;
    } else if (designationCategory === 'Group') {
      finalDesignation = `Group ${subDesignation} ${additionalDesignation}`;
    }


   if (selectedEmployee) {
      const updatedEmployee: Employee = {
        ...selectedEmployee,
        designation: finalDesignation,
      };


     const validationError = validateFields();
      if (validationError) {
        setModalError(validationError);
        return;
      }


     try {
        await axios.post(
          'http://localhost/employee-management/backend/api/employees.php',
          JSON.stringify(updatedEmployee),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );


       setEmployees((prev) =>
          prev.map((emp) =>
            emp.emp_code === updatedEmployee.emp_code ? updatedEmployee : emp
          )
        );
        alert('Employee updated successfully');
        setEditMode(false);
        setSelectedEmployee(updatedEmployee);
      } catch {
        setModalError('Failed to submit form. Please try again.');
      }
    }
  };


 // Function to open new tab with the printable table + signature row + print button
  const handlePrintClick = () => {
    // Build HTML string for the new window
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;


   const printHTML = `
      <html>
        <head>
          <title>Print Employee List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            button {
              padding: 6px 12px;
              font-size: 14px;
              margin-bottom: 20px;
              cursor: pointer;
              border-radius: 4px;
              background-color: #007bff;
              color: white;
              border: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {

             border: 1px solid #000;
              padding: 8px;
              text-align: left;
              vertical-align: top;
              height: 40px;
            }
            th {
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Print</button>
          <table>
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Knowledge of Hindi</th>
                <th>Qualification</th>
                <th>Signature</th>
              </tr>

           </thead>
            <tbody>
              ${employees
                .map(
                  (emp) => `
                <tr>
                  <td>${emp.emp_code}</td>
                  <td>${emp.name}</td>
                  <td>${emp.designation}</td>

                 <td>${emp.knowledge_of_hindi}</td>
                  <td>${emp.qualification}</td>
                  <td></td>
                </tr>
              `

               )

               .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;



   printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
  };


 return (
    <div style={{ position: 'relative', padding: '20px' }}>
      {/* Print button top right */}
      <button
        onClick={handlePrintClick}
        style={{
          position: 'absolute',

         top: '10px',
          right: '10px',
          padding: '6px 10px',

          fontSize: '0.8rem',
          borderRadius: '5px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',

         cursor: 'pointer',
          userSelect: 'none',
          zIndex: 1000,
        }}

     >
        Print
      </button>


      <h2>Employee List</h2>

{/* Filters */}
<div
  className="filter-container"
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '15px',
  }}
>
  <input
    type="text"
    placeholder="Filter Emp Code"
    value={filterCode}
    onChange={(e) => setFilterCode(e.target.value)}
  />
  <input
    type="text"
    placeholder="Filter Name"
    value={filterName}
    onChange={(e) => setFilterName(e.target.value)}
  />
  <input
    type="text"
    placeholder="Filter Designation"
    value={filterDesignation}
    onChange={(e) => setFilterDesignation(e.target.value)}
  />
  <input
    type="text"
    placeholder="Filter Qualification"
    value={filterQualification}
    onChange={(e) => setFilterQualification(e.target.value)}
  />
  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    Items per page:
    <input
      type="number"
      min={1}
      max={100}
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value) || 5)}
      style={{ width: '60px' }}
    />
  </label>
</div>



     {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>

         <tr>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => toggleSort('emp_code')}
            >
              Emp Code {sortField === 'emp_code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th

              style={{ cursor: 'pointer' }}
              onClick={() => toggleSort('name')}
            >
              Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Designation</th>

           <th>Knowledge of Hindi</th>
            <th>Qualification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.map((emp) => (
            <tr
              key={emp.emp_code}
              onClick={() => handleRowClick(emp)}
              style={{ cursor: 'pointer' }}
            >
              <td>{emp.emp_code}</td>
              <td>{emp.name}</td>

             <td>{emp.designation}</td>
              <td>{emp.knowledge_of_hindi}</td>
              <td>{emp.qualification}</td>
              <td>
                <button
                  onClick={(e) => {

                   e.stopPropagation();
                    setSelectedEmployee(emp);
                    setEditMode(true);

                    handleRowClick(emp);
                  }}

                 style={{ marginRight: '8px' }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                   handleDelete(emp.emp_code);
                  }}

               >
                  Delete
                </button>

             </td>
            </tr>
          ))}

       </tbody>
      </table>


{/* Pagination Controls */}
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Previous Button */}
  <button
    onClick={goToPrevPage}
    disabled={currentPage === 1}
    style={{
      backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
      color: 'white',
      border: 'none',
      padding: '0',             // no padding for square shape
      borderRadius: '4px',
      fontSize: '14px',         // font size can stay readable
      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      width: '24px',            // square size
      height: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      lineHeight: '24px',
      userSelect: 'none',
    }}
  >
    &lt;
  </button>

  {/* Page Info */}
  <span style={{ fontWeight: '600', fontSize: '16px' }}>
    Page {currentPage} of {totalPages}
  </span>

  {/* Next Button */}
  <button
    onClick={goToNextPage}
    disabled={currentPage === totalPages}
    style={{
      backgroundColor: currentPage === totalPages ? '#ccc' : '#007bff',
      color: 'white',
      border: 'none',
      padding: '0',             // no padding for square shape
      borderRadius: '4px',
      fontSize: '14px',
      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      width: '24px',            // square size
      height: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      lineHeight: '24px',
      userSelect: 'none',
    }}
  >
    &gt;
  </button>
</div>



      {/* Edit Modal */}
      {selectedEmployee && (
        <div

         style={{

           position: 'fixed',
            top: 0,
            left: 0,

           width: '100vw',
            height: '100vh',

           backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',

           justifyContent: 'center',
            alignItems: 'center',

           zIndex: 2000,
          }}

         onClick={handleClosePopup}
        >

         <div
            style={{
              backgroundColor: 'white',
              padding: '20px',

             borderRadius: '5px',
              minWidth: '400px',
              maxHeight: '90vh',

             overflowY: 'auto',
            }}

           onClick={(e) => e.stopPropagation()}
         >
            {!editMode ? (
              <>

               <h3>Employee Details</h3>
                <p><b>Emp Code:</b> {selectedEmployee.emp_code}</p>

               <p><b>Name:</b> {selectedEmployee.name}</p>
                <p><b>Designation:</b> {selectedEmployee.designation}</p>

               <p><b>Knowledge of Hindi:</b> {selectedEmployee.knowledge_of_hindi}</p>
                <p><b>Qualification:</b> {selectedEmployee.qualification}</p>
                <button onClick={() => setEditMode(true)}>Edit</button>{' '}
                <button onClick={handleClosePopup}>Close</button>

            </>
            ) : (

             <>
                <h3>Edit Employee</h3>

               <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '10px' }}>

                   <label>
                      Designation Category:
                      <select
                        value={designationCategory}
                        onChange={(e) => {
                          setDesignationCategory(e.target.value);

                         // Reset dependent dropdowns on change

                         setSubDesignation('');
                          setAdditionalDesignation('');
                        }}
                        required

                      >
                        <option value="">--Select--</option>
                        {designationCategories.map((cat) => (

                         <option key={cat} value={cat}>

                           {cat}

                         </option>

                       ))}

                     </select>
                    </label>
                  </div>

                  {(designationCategory === 'Group Director' ||
                    designationCategory === 'Group') && (
                   <div style={{ marginBottom: '10px' }}>
                     <label>
                       Sub-Designation:
                       <select
                         value={subDesignation}
                         onChange={(e) => setSubDesignation(e.target.value)}
                         required
                       >
                         <option value="">--Select--</option>
                         {subDesignations.map((sub) => (
                           <option key={sub} value={sub}>
                             {sub}
                           </option>
                         ))}
                       </select>
                     </label>
                   </div>
                 )}
                  {designationCategory === 'Group' && (
                   <div style={{ marginBottom: '10px' }}>
                      <label>
                       Additional Designation:
                        <select
                          value={additionalDesignation}
                          onChange={(e) => setAdditionalDesignation(e.target.value)}
                          required
                        >
                          <option value="">--Select--</option>
                          {additionalDesignations.map((add) => (
                            <option key={add} value={add}>
                              {add}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                  <div style={{ marginBottom: '10px' }}>
                    <label>
                      Knowledge of Hindi:
                      <select
                        value={selectedEmployee.knowledge_of_hindi}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            knowledge_of_hindi: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">--Select--</option>
                        {knowledgeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label>
                      Qualification:
                      <select
                        value={selectedEmployee.qualification}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            qualification: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">--Select--</option>
                        {qualifications.map((qual) => (
                          <option key={qual} value={qual}>
                            {qual}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {modalError && (
                    <p style={{ color: 'red', marginBottom: '10px' }}>
                      {modalError}
                    </p>
                  )}
                  <button type="submit" style={{ marginRight: '10px' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setModalError('');
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeList;