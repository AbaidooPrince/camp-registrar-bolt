import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Tent } from 'lucide-react';

interface FormData {
  camperName: string;
  age: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  dietaryRestrictions: string;
  sessionPreference: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    camperName: '',
    age: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    dietaryRestrictions: '',
    sessionPreference: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('camp_registrations')
        .insert([{
          camper_name: formData.camperName,
          age: parseInt(formData.age),
          parent_name: formData.parentName,
          parent_email: formData.parentEmail,
          parent_phone: formData.parentPhone,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          medical_conditions: formData.medicalConditions,
          dietary_restrictions: formData.dietaryRestrictions,
          session_preference: formData.sessionPreference
        }]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      setFormData({
        camperName: '',
        age: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: '',
        dietaryRestrictions: '',
        sessionPreference: ''
      });

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering! We'll send a confirmation email to {formData.parentEmail} shortly.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Register Another Camper
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Tent className="w-10 h-10" />
              <h1 className="text-3xl font-bold">Summer Camp Registration</h1>
            </div>
            <p className="text-emerald-100">Join us for an unforgettable summer adventure!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Camper Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="camperName" className="block text-sm font-medium text-gray-700 mb-1">
                      Camper Full Name *
                    </label>
                    <input
                      type="text"
                      id="camperName"
                      name="camperName"
                      required
                      value={formData.camperName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      required
                      min="5"
                      max="17"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      required
                      value={formData.parentName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        required
                        value={formData.parentEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="parentPhone"
                        name="parentPhone"
                        required
                        value={formData.parentPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      required
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sessionPreference" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Preference *
                    </label>
                    <select
                      id="sessionPreference"
                      name="sessionPreference"
                      required
                      value={formData.sessionPreference}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select a session</option>
                      <option value="Week 1 (June 1-5)">Week 1 (June 1-5)</option>
                      <option value="Week 2 (June 8-12)">Week 2 (June 8-12)</option>
                      <option value="Week 3 (June 15-19)">Week 3 (June 15-19)</option>
                      <option value="Week 4 (June 22-26)">Week 4 (June 22-26)</option>
                      <option value="Full Month">Full Month</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Conditions or Allergies
                    </label>
                    <textarea
                      id="medicalConditions"
                      name="medicalConditions"
                      rows={3}
                      value={formData.medicalConditions}
                      onChange={handleChange}
                      placeholder="Please list any medical conditions, allergies, or medications..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
                      Dietary Restrictions
                    </label>
                    <textarea
                      id="dietaryRestrictions"
                      name="dietaryRestrictions"
                      rows={3}
                      value={formData.dietaryRestrictions}
                      onChange={handleChange}
                      placeholder="Please list any dietary restrictions or food allergies..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
