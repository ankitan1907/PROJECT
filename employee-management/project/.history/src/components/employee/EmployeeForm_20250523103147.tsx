import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useEmployees } from '../../context/EmployeeContext';

const EmployeeForm: React.FC = () => {
  const {
    qualifications,
    addQualification,
    customSubDesignations,
    addCustomSubDesignation,
  } = useEmployees();

  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    designation: 'Director',
    subDesignation: '',
    subDesignation2: '',
    hindiKnowledge: 'Null',
    qualification: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecondSubDesignation, setShowSecondSubDesignation] = useState(false);

  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
  const [newQualification, setNewQualification] = useState('');

  const [isSubDesignationModalOpen, setIsSubDesignationModalOpen] = useState(false);
  const [newSubDesignation, setNewSubDesignation] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === 'designation') {
        updated.subDesignation = '';
        updated.subDesignation2 = '';
        setShowSecondSubDesignation(false);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Employee code is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.designation === 'Group Director' && !formData.subDesignation) {
      newErrors.subDesignation = 'Sub-designation is required for Group Director';
    }

    if (formData.designation === 'Group') {
      if (!formData.subDesignation) {
        newErrors.subDesignation = 'Primary sub-designation is required for Group';
      }
      if (!formData.subDesignation2) {
        newErrors.subDesignation2 = 'Scientist sub-designation is required for Group';
      }
    }

    if (!formData.qualification) {
      newErrors.qualification = 'Qualification is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost/employee-management/project/backend/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Employee added successfully!');
        setFormData({
          code: '',
          fullName: '',
          designation: 'Director',
          subDesignation: '',
          subDesignation2: '',
          hindiKnowledge: 'Null',
          qualification: '',
        });
        setShowSecondSubDesignation(false);
      } else {
        alert('Error: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to submit data. Check console.');
      console.error('Submission error:', error);
    }
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      addQualification(newQualification);
      setFormData((prev) => ({
        ...prev,
        qualification: newQualification,
      }));
      setNewQualification('');
      setIsQualificationModalOpen(false);
    }
  };

  const handleAddSubDesignation = () => {
    if (newSubDesignation.trim()) {
      addCustomSubDesignation(newSubDesignation);
      setFormData((prev) => ({
        ...prev,
        subDesignation2: newSubDesignation,
      }));
      setNewSubDesignation('');
      setIsSubDesignationModalOpen(false);
    }
  };

  const designationOptions = [
    { value: 'Director', label: 'Director' },
    { value: 'Group Director', label: 'Group Director' },
    { value: 'Group', label: 'Group' },
  ];

  const groupDirectorSubDesignationOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex flex-col gap-2 p-5 border border-gray-300 rounded-lg bg-white"
      >
        <h2 className="text-xl font-semibold mb-4">Add Employee</h2>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label htmlFor="code" className="block font-semibold mb-1">
              Employee Code <span className="text-red-500">*</span>
            </label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              error={errors.code}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="w-1/2">
            <label htmlFor="fullName" className="block font-semibold mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              error={errors.fullName}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label htmlFor="designation" className="block font-semibold mb-1">
              Designation <span className="text-red-500">*</span>
            </label>
            <Select
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              options={designationOptions}
            />
          </div>

          {(formData.designation === 'Group Director' ||
            formData.designation === 'Group') && (
            <div className="w-1/3">
              <label
                htmlFor="subDesignation"
                className="block font-semibold mb-1"
              >
                {formData.designation === 'Group Director'
                  ? 'Sub Designation'
                  : 'Primary Sub Designation'}{' '}
                <span className="text-red-500">*</span>
              </label>
              {formData.designation === 'Group Director' ? (
                <Select
                  id="subDesignation"
                  name="subDesignation"
                  value={formData.subDesignation}
                  onChange={handleChange}
                  options={groupDirectorSubDesignationOptions}
                  error={errors.subDesignation}
                />
              ) : (
                <Input
                  id="subDesignation"
                  name="subDesignation"
                  value={formData.subDesignation}
                  onChange={handleChange}
                  placeholder="Enter primary sub designation"
                  error={errors.subDesignation}
                />
              )}
              {errors.subDesignation && (
                <p className="text-xs text-red-500">{errors.subDesignation}</p>
              )}
            </div>
          )}

          {formData.designation === 'Group' && (
            <div className="w-1/3">
              <label
                htmlFor="subDesignation2"
                className="block font-semibold mb-1"
              >
                Scientist Sub Designation <span className="text-red-500">*</span>
              </label>
              <Select
                id="subDesignation2"
                name="subDesignation2"
                value={formData.subDesignation2}
                onChange={handleChange}
                options={customSubDesignations.map((sd) => ({
                  value: sd,
                  label: sd,
                }))}
                error={errors.subDesignation2}
              />
              {errors.subDesignation2 && (
                <p className="text-xs text-red-500">{errors.subDesignation2}</p>
              )}
              <Button
                type="button"
                className="mt-1 flex items-center gap-1"
                onClick={() => setIsSubDesignationModalOpen(true)}
              >
                <Plus size={14} /> Add New Scientist Sub Designation
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-4">
          <div className="w-1/3">
            <label htmlFor="hindiKnowledge" className="block font-semibold mb-1">
              Hindi Knowledge
            </label>
            <Select
              id="hindiKnowledge"
              name="hindiKnowledge"
              value={formData.hindiKnowledge}
              onChange={handleChange}
              options={[
                { value: 'Good', label: 'Good' },
                { value: 'Average', label: 'Average' },
                { value: 'Null', label: 'Null' },
              ]}
            />
          </div>

          <div className="w-1/3">
            <label htmlFor="qualification" className="block font-semibold mb-1">
              Qualification <span className="text-red-500">*</span>
            </label>
            <Select
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              options={qualifications.map((q) => ({ value: q, label: q }))}
              error={errors.qualification}
            />
            {errors.qualification && (
              <p className="text-xs text-red-500">{errors.qualification}</p>
            )}
            <Button
              type="button"
              className="mt-1 flex items-center gap-1"
              onClick={() => setIsQualificationModalOpen(true)}
            >
              <Plus size={14} /> Add New Qualification
            </Button>
          </div>
        </div>

        <Button type="submit" className="mt-5 w-full">
          Add Employee
        </Button>
      </form>

      {/* Modal to add qualification */}
      <Modal
        open={isQualificationModalOpen}
        onOpenChange={setIsQualificationModalOpen}
        title="Add Qualification"
        actionLabel="Add"
        onAction={handleAddQualification}
      >
        <Input
          value={newQualification}
          onChange={(e) => setNewQualification(e.target.value)}
          placeholder="Enter new qualification"
        />
      </Modal>

      {/* Modal to add subDesignation2 */}
      <Modal
        open={isSubDesignationModalOpen}
        onOpenChange={setIsSubDesignationModalOpen}
        title="Add Scientist Sub Designation"
        actionLabel="Add"
        onAction={handleAddSubDesignation}
      >
        <Input
          value={newSubDesignation}
          onChange={(e) => setNewSubDesignation(e.target.value)}
          placeholder="Enter new scientist sub designation"
        />
      </Modal>
    </>
  );
};

export default EmployeeForm;
