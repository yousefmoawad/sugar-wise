const mongoose = require('mongoose');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const diabetesMonitoringSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    level: {
      type: Number,
      required: [true, 'Glucose level is required'],
      min: [0, 'Glucose level cannot be negative'],
      validate: {
        validator(value) {
          if (this.unit === 'mmol/L') {
            return value >= 1 && value <= 33.3;
          }
          return value >= 18 && value <= 600;
        },
        message:
          'Glucose level is out of supported range for selected unit',
      },
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
      match: [DATE_PATTERN, 'Date must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      match: [TIME_PATTERN, 'Time must be in HH:mm format'],
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Extra'],
      default: 'Breakfast',
    },
    foods: {
      type: [String],
      default: [],
    },
    insulin: {
      type: [String],
      default: [],
    },
    insulinUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

diabetesMonitoringSchema.pre('validate', function normalizeLists() {
  if (Array.isArray(this.foods)) {
    this.foods = this.foods
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (Array.isArray(this.insulin)) {
    this.insulin = this.insulin
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
});

module.exports = mongoose.model('DiabetesMonitoring', diabetesMonitoringSchema);
