import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useEmployees } from '../../context/EmployeeContext';

type EmployeeFormProps = {
  onSubmit: (formData: any) => Promise<void>;
  buttonText?: string;
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit, buttonText = 'Submit' }) => {
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'designation') {
      setFormData((prev) => ({
        ...prev,
        subDesignation: '',
        subDesignation2: '',
      }));
      setShowSecondSubDesignation(false);
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

    if (formData.designation === 'Group' && !formData.subDesignation) {
      newErrors.subDesignation = 'At least one sub-designation is required for Group';
    }

    if (!formData.qualification) {
      newErrors.qualification = 'Qualification is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Adjusted handleSubmit to call onSubmit prop instead of fetch inside the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Clear form after successful submit (optional)
      setFormData({
        code: '',
        fullName: '',
        designation: 'Director',
        subDesignation: '',
        subDesignation2: '',
        hindiKnowledge: 'Null',
        qualification: '',
      });
    } catch (err) {
      // Error handling is done in AddEmployeePage
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

  const scientistSubDesignationOptions = customSubDesignations.map((sd) => ({
    value: sd,
    label: sd,
  }));

  const hindiKnowledgeOptions = [
    { value: 'Good', label: 'Good' },
    { value: 'Average', label: 'Average' },
    { value: 'Null', label: 'Null' },
  ];

  const qualificationOptions = qualifications.map((q) => ({
    value: q,
    label: q,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Employee Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            placeholder="EMP001"
          />

          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="John Doe"
          />

          <Select
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            options={designationOptions}
            error={errors.designation}
          />

          {formData.designation === 'Group Director' && (
            <Select
              label="Sub-Designation"
              name="subDesignation"
              value={formData.subDesignation}
              onChange={handleChange}
              options={groupDirectorSubDesignationOptions}
              error={errors.subDesignation}
            />
          )}

          {formData.designation === 'Group' && (
            <>
              <Select
                label="Primary Sub-Designation"
                name="subDesignation"
                value={formData.subDesignation}
                onChange={handleChange}
                options={groupDirectorSubDesignationOptions}
                error={errors.subDesignation}
              />

              {!showSecondSubDesignation ? (
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecondSubDesignation(true)}
                  >
                    Add Scientist Sub-Designation
                  </Button>
                </div>
              ) : (
                <Select
                  label="Scientist Sub-Designation"
                  name="subDesignation2"
                  value={formData.subDesignation2}
                  onChange={handleChange}
                  options={scientistSubDesignationOptions}
                  addButton={
                    <Button
                      type="button"
                      variant="success"
                      size="sm"
                      icon={<Plus size={16} />}
                      onClick={() => setIsSubDesignationModalOpen(true)}
                    />
                  }
                />
              )}
            </>
          )}

          <Select
            label="Knowledge of Hindi"
            name="hindiKnowledge"
            value={formData.hindiKnowledge}
            onChange={handleChange}
            options={hindiKnowledgeOptions}
            error={errors.hindiKnowledge}
          />

          <Select
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            options={qualificationOptions}
            error={errors.qualification}
            addButton={
              <Button
                type="button"
                variant="success"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => setIsQualificationModalOpen(true)}
              />
            }
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">{buttonText}</Button>
        </div>
      </form>

      {/* Qualification Modal */}
      <Modal
        isOpen={isQualificationModalOpen}
        onClose={() => setIsQualificationModalOpen(false)}
        title="Add New Qualification"
        footer={
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsQualificationModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleAddQualification}>Add</Button>
          </div>
        }
      >
        <Input
          label="Qualification"
          value={newQualification}
          onChange={(e) => setNewQualification(e.target.value)}
          placeholder="Enter qualification (e.g., PhD, MBA)"
          autoFocus
        />
      </Modal>

      {/* Sub-Designation Modal */}
      <Modal
        isOpen={isSubDesignationModalOpen}
        onClose={() => setIsSubDesignationModalOpen(false)}
        title="Add New Scientist Sub-Designation"
        footer={
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsSubDesignationModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubDesignation}>Add</Button>
          </div>
        }
      >
        <Input
          label="Sub-Designation"
          value={newSubDesignation}
          onChange={(e) => setNewSubDesignation(e.target.value)}
          placeholder="Enter scientist sub-designation (e.g., Scientist G)"
          autoFocus
        />
      </Modal>
    </>
  );
};

export default EmployeeForm;
