"use client"
import React from 'react';
import{useState} from  'react'
import DatePicker from 'react-datepicker';
import { Upload, X, Image } from 'lucide-react';
import { FormFormData } from './types';
import "react-datepicker/dist/react-datepicker.css";
import { BACKEND_URL } from '../config/config';


function Form() {
  const [formData, setFormData] = useState<FormFormData>({
    projectName: 'Test Project',
    formTheme: 'Test Theme',
    dateOfIdentification: '2025-03-20T18:30:00.000Z',
    location: 'Plant 1',
    gembaUnit: 'Assembly Line',
    category: 'Mission 1000 PSB',
    subCategory: 'Efficiency',
    department: 'Production',
    currentSituation: 'Test Current Situation',
    rootCause: 'Test Root Cause',
    actionTaken: 'Test Action Taken',
    standardization: 'Test Standardization',
    dateOfCompletion: '2025-03-21T18:30:00.000Z',
    beforePictures: [],
    afterPictures: [],
  });

  const [previewImages, setPreviewImages] = useState({
    before: [] as string[],
    after: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'beforePictures' | 'afterPictures') => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(file => URL.createObjectURL(file));

    setPreviewImages(prev => ({
      ...prev,
      [type === 'beforePictures' ? 'before' : 'after']: previews
    }));

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));

    e.target.value = '';
  };

  const removeImage = (type: 'beforePictures' | 'afterPictures', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));

    // Clean up the object URL to prevent memory leaks
    if (previewImages.before[index]) {
      URL.revokeObjectURL(previewImages.before[index]);
    }
    if (previewImages.after[index]) {
      URL.revokeObjectURL(previewImages.after[index]);
    }

    setPreviewImages(prev => ({
      ...prev,
      [type === 'beforePictures' ? 'before' : 'after']: prev[type === 'beforePictures' ? 'before' : 'after'].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.beforePictures.length === 0 || formData.afterPictures.length === 0) {
      alert('Please select at least one image for both before and after pictures.');
      return;
    }

    const formDataToSend = new FormData();

    for (const [key, value] of Object.entries(formData)) {
      if (key === 'beforePictures' || key === 'afterPictures') {
        value.forEach((file: File) => {
          formDataToSend.append(key, file);
        });
      } else {
        formDataToSend.append(key, String(value || ''));
      }
    }

    try {
        console.log("BACKEND_URL",BACKEND_URL)
      const response = await fetch(`${BACKEND_URL}/api/form`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        // setFormData({
        //   projectName: '',
        //   formTheme: '',
        //   dateOfIdentification: '',
        //   location: '',
        //   gembaUnit: '',
        //   category: '',
        //   subCategory: '',
        //   department: '',
        //   currentSituation: '',
        //   rootCause: '',
        //   actionTaken: '',
        //   standardization: '',
        //   dateOfCompletion: '',
        //   beforePictures: [],
        //   afterPictures: [],
        // });
        setPreviewImages({ before: [], after: [] });
      } else {
        
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Server error:', errorData);
        alert(`Error submitting form: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl text-gray-800 font-bold mb-6">Project Details</h1>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              className="w-full p-2 text-gray-600 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Identification Process <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="formTheme"
              value={formData.formTheme}
              onChange={handleInputChange}
              required
              className="w-full text-gray-600 p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Identification <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.dateOfIdentification ? new Date(formData.dateOfIdentification) : null}
              onChange={(date: Date) => setFormData(prev => ({ ...prev, dateOfIdentification: date.toISOString() }))}
              className="w-full p-2 border text-gray-600 rounded-md"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full text-gray-600 p-2 border rounded-md"
            >
              <option value="">Select Location</option>
              <option value="Plant 1">Plant 1</option>
              <option value="Plant 2">Plant 2</option>
              <option value="Plant 3">Plant 3</option>
            </select>
          </div>
        </div>

        {/* Category Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full text-gray-600 p-2 border rounded-md"
            >
              <option value="">Select Category</option>
              <option value="Mission 1000 PSB">Mission 1000 PSB</option>
              <option value="Mission 2000 XM">Mission 2000 XM</option>
              <option value="Mission 2000 Defence">Mission 2000 Defence</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              required
              className="w-full text-gray-600 p-2 border rounded-md"
            >
              <option value="">Select Sub Category</option>
              <option value="Efficiency">Efficiency</option>
              <option value="Quality">Quality</option>
              <option value="Cost Saving">Cost Saving</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full text-gray-600 p-2 border rounded-md"
            >
              <option value="">Select Department</option>
              <option value="Production">Production</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gemba Unit <span className=" text-gray-600 text-red-500">*</span>
            </label>
            <select
              name="gembaUnit"
              value={formData.gembaUnit}
              onChange={handleInputChange}
              required
              className="w-full  text-gray-600 p-2 border rounded-md"
            >
              <option value="">Select Gemba Unit</option>
              <option value="Assembly Line">Assembly Line</option>
              <option value="Inspection Unit">Inspection Unit</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Completion <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={formData.dateOfCompletion ? new Date(formData.dateOfCompletion) : null}
            onChange={(date: Date) => setFormData(prev => ({ ...prev, dateOfCompletion: date.toISOString() }))}
            className="w-full p-2 text-gray-600 border rounded-md"
            dateFormat="yyyy-MM-dd"
            required
          />
        </div>

        {/* Description Fields */}
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Situation <span className="text-red-500">*</span>
            </label>
            <textarea
              name="currentSituation"
              value={formData.currentSituation}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 text-gray-600 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Root Cause <span className="text-red-500">*</span>
            </label>
            <textarea
              name="rootCause"
              value={formData.rootCause}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 border text-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Taken <span className="text-red-500">*</span>
            </label>
            <textarea
              name="actionTaken"
              value={formData.actionTaken}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 border  text-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standardization <span className="text-red-500">*</span>
            </label>
            <textarea
              name="standardization"
              value={formData.standardization}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 border text-gray-600 rounded-md"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Before Pictures <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center">
                  <Upload size={20} className="mr-2" />
                  Choose Files
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'beforePictures')}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
              {formData.beforePictures.length > 0 && (
                <div className="space-y-2">
                  {formData.beforePictures.map((file, index) => (
                    <div key={index} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-start space-x-2">
                        <div className="w-12 h-12 bg-gray-100 rounded">
                          {previewImages.before[index] && (
                            <img 
                              src={previewImages.before[index]} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded" 
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage('beforePictures', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After Pictures <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md flex items-center">
                  <Upload size={20} className="mr-2" />
                  Choose Files
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'afterPictures')}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
              {formData.afterPictures.length > 0 && (
                <div className="space-y-2">
                  {formData.afterPictures.map((file, index) => (
                    <div key={index} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-start space-x-2">
                        <div className="w-12 h-12 bg-gray-100 rounded">
                          {previewImages.after[index] && (
                            <img 
                              src={previewImages.after[index]} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded" 
                            />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage('afterPictures', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Form;