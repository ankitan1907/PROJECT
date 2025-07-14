import React, { useState } from 'react';
import axios from 'axios';
import './EmployeeForm.css';

const EmployeeForm: React.FC = () => {
  const [empCode, setEmpCode] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [subDesignation, setSubDesignation] = useState('');
  const [multiDesignation, setMultiDesignation] = useState('');
  const [knowledgeOfHindi, setKnowledgeOfHindi] = useState('');
  const [qualification, setQualification] = useState('');
  const [error, setError] = useState('');

  const [subDesignations, setSubDesignations] = useState(['A', 'B', 'C']);
  const [additionalDesignations, setAdditionalDesignations] = useState([
    'Scientist A', 'Scientist B', 'Scientist C', 'Scientist D'
  ]);
  const [qualifications, setQualifications] = useState([
    'B.A', 'B.Sc', 'M.A', 'M.Sc'
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [modalTarget, setModalTarget] = useState<'sub' | 'additional' | 'qualification' | null>(null);
  const [modalError, setModalError] = useState('');

  const openModal = (type: 'sub' | 'additional' | 'qualification') => {
    setModalTarget(type);
    setNewOption('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalAdd = () => {
    if (!newOption.trim()) {
      setModalError('Please enter a valid option.');
      return;
    }

    let list: string[] = [];
    let setter: React.Dispatch<React.SetStateAction<string[]>> = () => {};

    if (modalTarget === 'sub') {
      list = subDesignations;
      setter = setSubDesignations;
    } else if (modalTarget === 'additional') {
      list = additionalDesignations;
      setter = setAdditionalDesignations;
    } else if (modalTarget === 'qualification') {
      list = qualifications;
      setter = setQualifications;
    }

    if (list.includes(newOption.trim())) {
      setModalError('Already exists!');
    } else {
      setter([...list, newOption.trim()]);
      setIsModalOpen(false);
    }
  };

  const validateFields = () => {
    if (!empCode) return "Please enter Employee Code.";
    if (!name) return "Please enter Full Name.";
    if (!designation) return "Please select Designation.";
    if ((designation === 'Group Director' || designation === 'Group') && !subDesignation)
      return "Please select Sub Designation.";
    if (designation === 'Group' && !multiDesignation)
      return "Please select Additional Designation.";
    if (!knowledgeOfHindi) return "Please select Knowledge of Hindi.";
    if (!qualification) return "Please select Qualification.";
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await axios.post('http://localhost/employee-management/backend/api/check-emp-code.php', {
        emp_code: empCode,
      });
      if (res.data.exists) {
        setError('Employee Code already exists. Please use a different one.');
        return;
      }
    } catch {
      setError('Error checking Employee Code uniqueness.');
      return;
    }

    const fullDesignation = (designation === 'Group Director' || designation === 'Group')
      ? `${designation} ${subDesignation}`
      : designation;

    const finalDesignation = multiDesignation
      ? `${fullDesignation} / ${multiDesignation}`
      : fullDesignation;

    const payload = {
      emp_code: empCode,
      name,
      designation: finalDesignation,
      knowledge_of_hindi: knowledgeOfHindi,
      qualification
    };

    try {
      await axios.post('http://localhost/employee-management/backend/api/add-employee.php', payload);
      alert('Employee added successfully');

      setEmpCode('');
      setName('');
      setDesignation('');
      setSubDesignation('');
      setMultiDesignation('');
      setKnowledgeOfHindi('');
      setQualification('');
    } catch {
      setError('Failed to submit form. Please try again.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-3xl mx-auto bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Add New Employee</h2>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <input
          type="text"
          placeholder="Employee Code"
          value={empCode}
          onChange={(e) => setEmpCode(e.target.value)}
          className="border p-3 rounded w-full"
        />

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-3 rounded w-full"
        />

        <select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="border p-3 rounded w-full"
        >
          <option value="">Select Designation</option>
          <option value="Director">Director</option>
          <option value="Group Director">Group Director</option>
          <option value="Group">Group</option>
        </select>

        {(designation === 'Group Director' || designation === 'Group') && (
          <div className="input-row">
            <select
              value={subDesignation}
              onChange={(e) => setSubDesignation(e.target.value)}
              className="border p-3 rounded w-full"
            >
              <option value="">Select Sub Designation</option>
              {subDesignations.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
            <button type="button" className="add-button" onClick={() => openModal('sub')}>+</button>
          </div>
        )}

        {designation === 'Group' && (
          <div className="input-row">
            <select
              value={multiDesignation}
              onChange={(e) => setMultiDesignation(e.target.value)}
              className="border p-3 rounded w-full"
            >
              <option value="">Select Additional Designation</option>
              {additionalDesignations.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
            <button type="button" className="add-button" onClick={() => openModal('additional')}>+</button>
          </div>
        )}

        <select
          value={knowledgeOfHindi}
          onChange={(e) => setKnowledgeOfHindi(e.target.value)}
          className="border p-3 rounded w-full"
        >
          <option value="">Knowledge of Hindi</option>
          <option value="10th">10th</option>
          <option value="Intermediate">Intermediate</option>
          <option value="More">More</option>
        </select>

        <div className="input-row">
          <select
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="border p-3 rounded w-full"
          >
            <option value="">Select Qualification</option>
            {qualifications.map((q, index) => (
              <option key={index} value={q}>{q}</option>
            ))}
          </select>
          <button type="button" className="add-button" onClick={() => openModal('qualification')}>+</button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full text-lg"
        >
          Submit
        </button>
      </form>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add {modalTarget === 'sub' ? 'Sub Designation' : modalTarget === 'additional' ? 'Additional Designation' : 'Qualification'}</h3>
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Enter new option"
            />
            {modalError && <p className="error">{modalError}</p>}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="add-btn" onClick={handleModalAdd}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeForm;
