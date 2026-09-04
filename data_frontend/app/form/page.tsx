"use client"
import React from 'react';
import { useState } from 'react'
import DatePicker from 'react-datepicker';
import { Upload, X } from 'lucide-react';
import { FormFormData } from './types';
import "react-datepicker/dist/react-datepicker.css";
import { BACKEND_URL } from '../config/config';

const EMPTY_FORM: FormFormData = {
  projectName: '',
  formTheme: '',
  dateOfIdentification: '',
  location: '',
  gembaUnit: '',
  category: '',
  subCategory: '',
  department: '',
  currentSituation: '',
  rootCause: '',
  actionTaken: '',
  standardization: '',
  dateOfCompletion: '',
  beforePictures: [],
  afterPictures: [],
};

function Form() {
  const [formData, setFormData] = useState<FormFormData>(EMPTY_FORM);

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
    const key = type === 'beforePictures' ? 'before' : 'after';

    setPreviewImages(prev => ({
      ...prev,
      [key]: [...prev[key], ...previews]
    }));

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));

    e.target.value = '';
  };

  const removeImage = (type: 'beforePictures' | 'afterPictures', index: number) => {
    const key = type === 'beforePictures' ? 'before' : 'after';

    if (previewImages[key][index]) {
      URL.revokeObjectURL(previewImages[key][index]);
    }

    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));

    setPreviewImages(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const handleReset = () => {
    [...previewImages.before, ...previewImages.after].forEach(URL.revokeObjectURL);
    setFormData(EMPTY_FORM);
    setPreviewImages({ before: [], after: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.beforePictures.length === 0 || formData.afterPictures.length === 0) {
      alert('Add at least one Before photo and one After photo before submitting.');
      return;
    }

    const formDataToSend = new FormData();

    for (const [key, value] of Object.entries(formData)) {
      if (key === 'beforePictures' || key === 'afterPictures') {
        (value as File[]).forEach((file: File) => {
          formDataToSend.append(key, file);
        });
      } else {
        formDataToSend.append(key, String(value || ''));
      }
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/form`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Record submitted.');
        handleReset();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Server error:', errorData);
        alert(`Could not submit the record: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Could not reach the server. Check your connection and try again.');
    }
  };

  const req = <span className="wo-req" aria-hidden="true">*</span>;

  return (
    <div className="wo-shell">
      <form onSubmit={handleSubmit} className="wo-doc">
        {/* ---------------------------------------------------- masthead -- */}
        <header className="wo-masthead">
          <p className="wo-eyebrow">Kaizen · 改善 · Continuous Improvement</p>
          <h1 className="wo-title">
            Improvement <span>Record</span>
          </h1>
          <p className="wo-lede">
            Document a shop-floor improvement end to end — the state before the change,
            the root cause, the action taken, and the standardized result. Attach photo
            evidence of the before and after states.
          </p>
          <span className="wo-stamp">
            Work order — <b>auto-assigned on submit</b>
          </span>
        </header>

        {/* --------------------------------------------- 01 identification -- */}
        <section className="wo-section">
          <div className="wo-section__head">
            <span className="wo-section__num">01</span>
            <h2 className="wo-section__title">Identification</h2>
            <span className="wo-section__rule" />
          </div>

          <div className="wo-grid">
            <div className="wo-field">
              <label className="wo-label" htmlFor="projectName">Project name {req}</label>
              <input id="projectName" type="text" name="projectName"
                value={formData.projectName} onChange={handleInputChange} required
                placeholder="e.g. Line 3 changeover time reduction"
                className="wo-input" />
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="formTheme">Problem identification process {req}</label>
              <input id="formTheme" type="text" name="formTheme"
                value={formData.formTheme} onChange={handleInputChange} required
                placeholder="e.g. Daily Gemba walk"
                className="wo-input" />
            </div>

            <div className="wo-field">
              <label className="wo-label">Date of identification {req}</label>
              <DatePicker
                selected={formData.dateOfIdentification ? new Date(formData.dateOfIdentification) : null}
                onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, dateOfIdentification: date.toISOString() }))}
                className="wo-input"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                required
              />
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="location">Location {req}</label>
              <select id="location" name="location" value={formData.location}
                onChange={handleInputChange} required className="wo-select">
                <option value="">Select location</option>
                <option value="Plant 1">Plant 1</option>
                <option value="Plant 2">Plant 2</option>
                <option value="Plant 3">Plant 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* --------------------------------------------- 02 classification -- */}
        <section className="wo-section">
          <div className="wo-section__head">
            <span className="wo-section__num">02</span>
            <h2 className="wo-section__title">Classification</h2>
            <span className="wo-section__rule" />
          </div>

          <div className="wo-grid">
            <div className="wo-field">
              <label className="wo-label" htmlFor="category">Category {req}</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleInputChange} required className="wo-select">
                <option value="">Select category</option>
                <option value="Mission 1000 PSB">Mission 1000 PSB</option>
                <option value="Mission 2000 XM">Mission 2000 XM</option>
                <option value="Mission 2000 Defence">Mission 2000 Defence</option>
              </select>
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="subCategory">Sub category {req}</label>
              <select id="subCategory" name="subCategory" value={formData.subCategory}
                onChange={handleInputChange} required className="wo-select">
                <option value="">Select sub category</option>
                <option value="Efficiency">Efficiency</option>
                <option value="Quality">Quality</option>
                <option value="Cost Saving">Cost Saving</option>
              </select>
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="department">Department {req}</label>
              <select id="department" name="department" value={formData.department}
                onChange={handleInputChange} required className="wo-select">
                <option value="">Select department</option>
                <option value="Production">Production</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="gembaUnit">Gemba unit {req}</label>
              <select id="gembaUnit" name="gembaUnit" value={formData.gembaUnit}
                onChange={handleInputChange} required className="wo-select">
                <option value="">Select Gemba unit</option>
                <option value="Assembly Line">Assembly Line</option>
                <option value="Inspection Unit">Inspection Unit</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>

            <div className="wo-field">
              <label className="wo-label">Date of completion {req}</label>
              <DatePicker
                selected={formData.dateOfCompletion ? new Date(formData.dateOfCompletion) : null}
                onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, dateOfCompletion: date.toISOString() }))}
                className="wo-input"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                required
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- 03 analysis -- */}
        <section className="wo-section">
          <div className="wo-section__head">
            <span className="wo-section__num">03</span>
            <h2 className="wo-section__title">Analysis</h2>
            <span className="wo-section__rule" />
          </div>

          <div className="wo-stack">
            <div className="wo-field">
              <label className="wo-label" htmlFor="currentSituation">Current situation {req}</label>
              <textarea id="currentSituation" name="currentSituation" rows={4}
                value={formData.currentSituation} onChange={handleInputChange} required
                placeholder="Describe the problem as it stands today."
                className="wo-textarea" />
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="rootCause">Root cause {req}</label>
              <textarea id="rootCause" name="rootCause" rows={4}
                value={formData.rootCause} onChange={handleInputChange} required
                placeholder="What is the underlying cause? (e.g. 5-Why findings)"
                className="wo-textarea" />
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="actionTaken">Action taken {req}</label>
              <textarea id="actionTaken" name="actionTaken" rows={4}
                value={formData.actionTaken} onChange={handleInputChange} required
                placeholder="What was changed to address the root cause?"
                className="wo-textarea" />
            </div>

            <div className="wo-field">
              <label className="wo-label" htmlFor="standardization">Standardization {req}</label>
              <textarea id="standardization" name="standardization" rows={4}
                value={formData.standardization} onChange={handleInputChange} required
                placeholder="How is the improvement made permanent and repeatable?"
                className="wo-textarea" />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- 04 evidence -- */}
        <section className="wo-section">
          <div className="wo-section__head">
            <span className="wo-section__num">04</span>
            <h2 className="wo-section__title">Evidence</h2>
            <span className="wo-section__rule" />
          </div>

          <div className="wo-evidence">
            <ImageDrop
              variant="before"
              label="Before"
              hint="The state to be improved."
              files={formData.beforePictures}
              previews={previewImages.before}
              onAdd={(e) => handleFileChange(e, 'beforePictures')}
              onRemove={(i) => removeImage('beforePictures', i)}
            />

            <span className="wo-arrow" aria-hidden="true">→</span>

            <ImageDrop
              variant="after"
              label="After"
              hint="The standardized result."
              files={formData.afterPictures}
              previews={previewImages.after}
              onAdd={(e) => handleFileChange(e, 'afterPictures')}
              onRemove={(i) => removeImage('afterPictures', i)}
            />
          </div>
        </section>

        {/* ----------------------------------------------------- actions -- */}
        <div className="wo-actions">
          <p className="wo-actions__note">
            Fields marked <span className="wo-req">*</span> are required. Photo evidence is
            compared for similarity after submission.
          </p>
          <div className="wo-actions__buttons">
            <button type="button" onClick={handleReset} className="wo-btn wo-btn--ghost">
              Clear form
            </button>
            <button type="submit" className="wo-btn wo-btn--primary">
              Submit record
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
type ImageDropProps = {
  variant: 'before' | 'after';
  label: string;
  hint: string;
  files: File[];
  previews: string[];
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
};

function ImageDrop({ variant, label, hint, files, previews, onAdd, onRemove }: ImageDropProps) {
  return (
    <div className={`wo-drop wo-drop--${variant}`}>
      <span className="wo-drop__tag">{label} <span className="wo-req" aria-hidden="true">*</span></span>
      <p className="wo-drop__hint">{hint}</p>

      <label className="wo-drop__cta">
        <Upload size={16} />
        Choose photos
        <input type="file" onChange={onAdd} accept="image/*" multiple className="hidden" style={{ display: 'none' }} />
      </label>

      {files.length > 0 && (
        <div className="wo-thumbs">
          {files.map((file, index) => (
            <div key={index} className="wo-thumb">
              <div className="wo-thumb__meta">
                {previews[index] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[index]} alt={`${label} preview`} className="wo-thumb__img" />
                )}
                <span className="wo-thumb__name">{file.name}</span>
              </div>
              <button type="button" onClick={() => onRemove(index)} className="wo-thumb__remove" aria-label={`Remove ${file.name}`}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Form;
