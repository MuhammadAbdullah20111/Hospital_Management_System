import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Calendar, Clock, Edit, FileText, CheckCircle } from 'lucide-react';
import { updateDailySummaryAPI } from '../../../api/admin/attendance';
import toast from 'react-hot-toast';

const ManualAttendanceModal = ({ isOpen, onClose, onSuccess, summary }) => {
  useEffect(() => {
    if (summary) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Format to YYYY-MM-DDTHH:MM local time for datetime-local inputs
        const pad = (num) => String(num).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      formik.setValues({
        checkIn: formatDateForInput(summary.checkIn),
        checkOut: formatDateForInput(summary.checkOut),
        status: summary.status || 'PRESENT',
        overrideNotes: summary.overrideNotes || ''
      });
    }
  }, [summary]);

  const formik = useFormik({
    initialValues: {
      checkIn: '',
      checkOut: '',
      status: 'PRESENT',
      overrideNotes: ''
    },
    validationSchema: Yup.object({
      checkIn: Yup.string().nullable().optional(),
      checkOut: Yup.string().nullable().optional(),
      status: Yup.string().required('Status is required'),
      overrideNotes: Yup.string().min(5, 'Notes must be at least 5 characters').required('Override reason is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await updateDailySummaryAPI(summary.id, {
          checkIn: values.checkIn || null,
          checkOut: values.checkOut || null,
          status: values.status,
          overrideNotes: values.overrideNotes
        });

        if (response.success) {
          toast.success('Attendance summary updated successfully');
          onSuccess();
          onClose();
        }
      } catch (error) {
        console.error('Failed to update attendance summary:', error);
        toast.error(error.message || 'Failed to update attendance summary');
      }
    }
  });

  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-teal-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-50 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-800">Manual Attendance Override</h3>
              <p className="text-xs text-slate-500">{summary.staff?.name} ({summary.staff?.role?.name || 'Staff'})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-teal-100/50 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          
          {/* Check-In */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Check-In Timestamp
            </label>
            <input
              type="datetime-local"
              name="checkIn"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              {...formik.getFieldProps('checkIn')}
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Check-Out Timestamp
            </label>
            <input
              type="datetime-local"
              name="checkOut"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              {...formik.getFieldProps('checkOut')}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              Attendance Status
            </label>
            <select
              name="status"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              {...formik.getFieldProps('status')}
            >
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="EARLY_DEPARTURE">EARLY DEPARTURE</option>
              <option value="LATE_AND_EARLY_DEPART">LATE & EARLY DEPART</option>
              <option value="ABSENT">ABSENT</option>
              <option value="HALFDAY">HALF DAY</option>
              <option value="OFF_DAY">OFF DAY (WEEKEND)</option>
              <option value="INCOMPLETE">INCOMPLETE (NO OUT-PUNCH)</option>
            </select>
          </div>

          {/* Override Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Reason for Correction <span className="text-red-500">*</span>
            </label>
            <textarea
              name="overrideNotes"
              rows="3"
              placeholder="Provide a clear justification (e.g. Employee forgot to punch card, device offline...)"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all ${
                formik.touched.overrideNotes && formik.errors.overrideNotes
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
              {...formik.getFieldProps('overrideNotes')}
            />
            {formik.touched.overrideNotes && formik.errors.overrideNotes && (
              <p className="text-xs text-red-500 font-medium">{formik.errors.overrideNotes}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              Apply Correction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;
