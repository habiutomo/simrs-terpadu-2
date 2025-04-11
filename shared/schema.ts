import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, time, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // admin, dokter, perawat, apoteker, laborat, radiolog, etc.
  specialization: text("specialization"), // For doctors: umum, anak, bedah, etc.
  email: text("email"),
  phone: text("phone"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  medicalRecordNumber: text("medical_record_number").notNull().unique(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  birthPlace: text("birth_place"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  nationalId: text("national_id"), // NIK
  bloodType: text("blood_type"),
  religion: text("religion"),
  maritalStatus: text("marital_status"),
  occupation: text("occupation"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  insuranceNumber: text("insurance_number"),
  insuranceProvider: text("insurance_provider"),
  insuranceClass: text("insurance_class"),
  status: text("status").default("active"),
  satuSehatId: text("satu_sehat_id"),
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertPatientSchema = createInsertSchema(patients).omit({ 
  id: true, createdAt: true, satuSehatSynced: true
});
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

// Clinics/Poli
export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClinicSchema = createInsertSchema(clinics).omit({ 
  id: true, createdAt: true 
});
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;

// Clinic Schedules
export const clinicSchedules = pgTable("clinic_schedules", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  maxPatients: integer("max_patients"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClinicScheduleSchema = createInsertSchema(clinicSchedules).omit({ 
  id: true, createdAt: true 
});
export type InsertClinicSchedule = z.infer<typeof insertClinicScheduleSchema>;
export type ClinicSchedule = typeof clinicSchedules.$inferSelect;

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  appointmentNumber: text("appointment_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  queueNumber: integer("queue_number"),
  type: text("type").notNull(), // Konsultasi, Pemeriksaan, Kontrol, etc.
  complaint: text("complaint"), // Keluhan utama
  status: text("status").default("scheduled"), // scheduled, confirmed, in-progress, completed, cancelled
  confirmationStatus: text("confirmation_status").default("pending"), // pending, confirmed, rejected
  confirmationDate: timestamp("confirmation_date"),
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, createdAt: true, appointmentNumber: true,
  queueNumber: true, confirmationDate: true
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Queue Management
export const queueSettings = pgTable("queue_settings", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  prefix: text("prefix").notNull(),
  startNumber: integer("start_number").default(1),
  currentNumber: integer("current_number").default(0),
  resetDaily: boolean("reset_daily").default(true),
  lastResetDate: date("last_reset_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQueueSettingSchema = createInsertSchema(queueSettings).omit({ 
  id: true, createdAt: true, lastResetDate: true, currentNumber: true
});
export type InsertQueueSetting = z.infer<typeof insertQueueSettingSchema>;
export type QueueSetting = typeof queueSettings.$inferSelect;

// Queue Status
export const queueStatuses = pgTable("queue_statuses", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  date: date("date").notNull(),
  currentQueueNumber: integer("current_queue_number").default(0),
  nextEstimatedTime: time("next_estimated_time"),
  status: text("status").default("active"), // active, paused, closed
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQueueStatusSchema = createInsertSchema(queueStatuses).omit({ 
  id: true, updatedAt: true
});
export type InsertQueueStatus = z.infer<typeof insertQueueStatusSchema>;
export type QueueStatus = typeof queueStatuses.$inferSelect;

// Vital Signs
export const vitalSigns = pgTable("vital_signs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  recordedBy: integer("recorded_by").references(() => users.id),
  recordDate: date("record_date").notNull(),
  recordTime: time("record_time").notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  oxygenSaturation: integer("oxygen_saturation"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  bmi: decimal("bmi", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVitalSignSchema = createInsertSchema(vitalSigns).omit({ 
  id: true, createdAt: true, bmi: true
});
export type InsertVitalSign = z.infer<typeof insertVitalSignSchema>;
export type VitalSign = typeof vitalSigns.$inferSelect;

// Medical Records
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  recordNumber: text("record_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  clinicId: integer("clinic_id").references(() => clinics.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  vitalSignId: integer("vital_sign_id").references(() => vitalSigns.id),
  recordDate: date("record_date").notNull(),
  recordTime: time("record_time").notNull(),
  visitType: text("visit_type").notNull(), // Outpatient, Inpatient, Emergency
  subjective: text("subjective"), // Keluhan pasien
  objective: text("objective"), // Hasil pemeriksaan fisik
  assessment: text("assessment"), // Diagnosis
  plan: text("plan"), // Rencana pengobatan
  primaryDiagnosis: text("primary_diagnosis"),
  secondaryDiagnosis: text("secondary_diagnosis"),
  icd10Code: text("icd10_code"), // Kode diagnosis ICD-10
  followUpPlan: text("follow_up_plan"), 
  followUpDate: date("follow_up_date"),
  referral: boolean("referral").default(false),
  referralDestination: text("referral_destination"),
  attachments: jsonb("attachments"), // Array of attachment URLs/paths
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  satuSehatRecordId: text("satu_sehat_record_id"),
  status: text("status").default("draft"), // draft, final, amended
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at"),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ 
  id: true, createdAt: true, updatedAt: true, satuSehatSynced: true,
  recordNumber: true, satuSehatRecordId: true
});
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Medical Procedures
export const procedures = pgTable("procedures", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), 
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // diagnostic, therapeutic, surgical, etc.
  price: integer("price").notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProcedureSchema = createInsertSchema(procedures).omit({ 
  id: true, createdAt: true 
});
export type InsertProcedure = z.infer<typeof insertProcedureSchema>;
export type Procedure = typeof procedures.$inferSelect;

// Medical Procedures Performed
export const procedureRecords = pgTable("procedure_records", {
  id: serial("id").primaryKey(),
  medicalRecordId: integer("medical_record_id").notNull().references(() => medicalRecords.id),
  procedureId: integer("procedure_id").notNull().references(() => procedures.id),
  performedBy: integer("performed_by").references(() => users.id),
  performedDate: date("performed_date").notNull(),
  performedTime: time("performed_time"),
  notes: text("notes"),
  result: text("result"),
  status: text("status").default("ordered"), // ordered, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProcedureRecordSchema = createInsertSchema(procedureRecords).omit({ 
  id: true, createdAt: true 
});
export type InsertProcedureRecord = z.infer<typeof insertProcedureRecordSchema>;
export type ProcedureRecord = typeof procedureRecords.$inferSelect;

// Laboratory Tests
export const labTests = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // hematology, biochemistry, microbiology, etc. 
  sampleType: text("sample_type"), // blood, urine, stool, etc.
  normalValues: text("normal_values"),
  units: text("units"),
  price: integer("price").notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabTestSchema = createInsertSchema(labTests).omit({ 
  id: true, createdAt: true 
});
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;
export type LabTest = typeof labTests.$inferSelect;

// Laboratory Test Orders
export const labOrders = pgTable("lab_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  medicalRecordId: integer("medical_record_id").references(() => medicalRecords.id),
  orderedBy: integer("ordered_by").references(() => users.id),
  orderDate: date("order_date").notNull(),
  orderTime: time("order_time").notNull(),
  priority: text("priority").default("routine"), // routine, urgent, stat
  clinicalInfo: text("clinical_info"),
  status: text("status").default("ordered"), // ordered, specimen-collected, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabOrderSchema = createInsertSchema(labOrders).omit({ 
  id: true, createdAt: true, orderNumber: true
});
export type InsertLabOrder = z.infer<typeof insertLabOrderSchema>;
export type LabOrder = typeof labOrders.$inferSelect;

// Laboratory Order Items
export const labOrderItems = pgTable("lab_order_items", {
  id: serial("id").primaryKey(),
  labOrderId: integer("lab_order_id").notNull().references(() => labOrders.id),
  labTestId: integer("lab_test_id").notNull().references(() => labTests.id),
  status: text("status").default("pending"), // pending, in-progress, completed, cancelled
  result: text("result"),
  resultValue: text("result_value"),
  resultFlag: text("result_flag"), // normal, high, low, critical high, critical low
  performedBy: integer("performed_by").references(() => users.id),
  verifiedBy: integer("verified_by").references(() => users.id),
  performedAt: timestamp("performed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabOrderItemSchema = createInsertSchema(labOrderItems).omit({ 
  id: true, createdAt: true, performedAt: true
});
export type InsertLabOrderItem = z.infer<typeof insertLabOrderItemSchema>;
export type LabOrderItem = typeof labOrderItems.$inferSelect;

// Radiology Examinations
export const radiologyExams = pgTable("radiology_exams", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // X-ray, USG, CT Scan, MRI, etc.
  bodyPart: text("body_part"),
  price: integer("price").notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRadiologyExamSchema = createInsertSchema(radiologyExams).omit({ 
  id: true, createdAt: true 
});
export type InsertRadiologyExam = z.infer<typeof insertRadiologyExamSchema>;
export type RadiologyExam = typeof radiologyExams.$inferSelect;

// Radiology Orders
export const radiologyOrders = pgTable("radiology_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  medicalRecordId: integer("medical_record_id").references(() => medicalRecords.id),
  orderedBy: integer("ordered_by").references(() => users.id),
  orderDate: date("order_date").notNull(),
  orderTime: time("order_time").notNull(),
  priority: text("priority").default("routine"), // routine, urgent, stat
  clinicalInfo: text("clinical_info"),
  status: text("status").default("ordered"), // ordered, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRadiologyOrderSchema = createInsertSchema(radiologyOrders).omit({ 
  id: true, createdAt: true, orderNumber: true
});
export type InsertRadiologyOrder = z.infer<typeof insertRadiologyOrderSchema>;
export type RadiologyOrder = typeof radiologyOrders.$inferSelect;

// Radiology Order Items
export const radiologyOrderItems = pgTable("radiology_order_items", {
  id: serial("id").primaryKey(),
  radiologyOrderId: integer("radiology_order_id").notNull().references(() => radiologyOrders.id),
  radiologyExamId: integer("radiology_exam_id").notNull().references(() => radiologyExams.id),
  status: text("status").default("pending"), // pending, in-progress, completed, cancelled
  imagePath: text("image_path"), // Path to stored image
  findings: text("findings"),
  impression: text("impression"),
  performedBy: integer("performed_by").references(() => users.id),
  interpretedBy: integer("interpreted_by").references(() => users.id),
  performedAt: timestamp("performed_at"),
  interpretedAt: timestamp("interpreted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRadiologyOrderItemSchema = createInsertSchema(radiologyOrderItems).omit({ 
  id: true, createdAt: true, performedAt: true, interpretedAt: true
});
export type InsertRadiologyOrderItem = z.infer<typeof insertRadiologyOrderItemSchema>;
export type RadiologyOrderItem = typeof radiologyOrderItems.$inferSelect;

// Inpatient Management - Wards
export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWardSchema = createInsertSchema(wards).omit({ 
  id: true, createdAt: true 
});
export type InsertWard = z.infer<typeof insertWardSchema>;
export type Ward = typeof wards.$inferSelect;

// Inpatient Management - Rooms
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  roomType: text("room_type").notNull(), // standard, deluxe, VIP, ICU, etc.
  wardId: integer("ward_id").notNull().references(() => wards.id),
  floor: text("floor"),
  bedCount: integer("bed_count").notNull(),
  price: integer("price").notNull(),
  status: text("status").default("available"), // available, maintenance, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({ 
  id: true, createdAt: true 
});
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// Inpatient Management - Beds
export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  bedNumber: text("bed_number").notNull(),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  status: text("status").default("available"), // available, occupied, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBedSchema = createInsertSchema(beds).omit({ 
  id: true, createdAt: true 
});
export type InsertBed = z.infer<typeof insertBedSchema>;
export type Bed = typeof beds.$inferSelect;

// Inpatient Management - Admissions
export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  admissionNumber: text("admission_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  bedId: integer("bed_id").notNull().references(() => beds.id),
  attendingDoctorId: integer("attending_doctor_id").notNull().references(() => users.id),
  admissionDate: date("admission_date").notNull(),
  admissionTime: time("admission_time").notNull(),
  admissionType: text("admission_type").notNull(), // emergency, elective
  admissionReason: text("admission_reason"),
  dischargeDate: date("discharge_date"),
  dischargeTime: time("discharge_time"),
  dischargeType: text("discharge_type"), // home, transfer, death, etc.
  dischargeSummary: text("discharge_summary"),
  dischargeDiagnosis: text("discharge_diagnosis"),
  status: text("status").default("admitted"), // admitted, discharged, transferred
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertAdmissionSchema = createInsertSchema(admissions).omit({ 
  id: true, createdAt: true, admissionNumber: true,
  dischargeDate: true, dischargeTime: true
});
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Admission = typeof admissions.$inferSelect;

// Inpatient Management - Daily Care Records
export const dailyCareRecords = pgTable("daily_care_records", {
  id: serial("id").primaryKey(),
  admissionId: integer("admission_id").notNull().references(() => admissions.id),
  recordDate: date("record_date").notNull(),
  recordTime: time("record_time").notNull(),
  recordedBy: integer("recorded_by").notNull().references(() => users.id),
  vitalSignId: integer("vital_sign_id").references(() => vitalSigns.id),
  nursingNotes: text("nursing_notes"),
  medicationAdministered: boolean("medication_administered").default(false),
  intakeOutput: jsonb("intake_output"), // Fluid balance data
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyCareRecordSchema = createInsertSchema(dailyCareRecords).omit({ 
  id: true, createdAt: true 
});
export type InsertDailyCareRecord = z.infer<typeof insertDailyCareRecordSchema>;
export type DailyCareRecord = typeof dailyCareRecords.$inferSelect;

// Medications/Pharmacy
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  barcode: text("barcode"),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  category: text("category"), // antibiotics, analgesics, etc.
  type: text("type").notNull(), // tablet, capsule, syrup, injection, etc.
  unit: text("unit").notNull(), // mg, ml, etc.
  doseForm: text("dose_form"), // tablet, capsule, suspension, etc.
  packagingUnit: text("packaging_unit"), // box, bottle, etc.
  packagingSize: integer("packaging_size"), // units per packaging
  manufacturer: text("manufacturer"),
  minimumStock: integer("minimum_stock").default(10),
  reorderLevel: integer("reorder_level").default(20),
  purchasePrice: integer("purchase_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  isActive: boolean("is_active").default(true),
  isControlled: boolean("is_controlled").default(false),
  needsPrescription: boolean("needs_prescription").default(false),
  satuSehatCode: text("satu_sehat_code"),
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  storage: text("storage"),
  description: text("description"),
  sideEffects: text("side_effects"),
  contraindications: text("contraindications"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({ 
  id: true, createdAt: true, satuSehatSynced: true 
});
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Medication Inventory
export const medicationInventory = pgTable("medication_inventory", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  batchNumber: text("batch_number").notNull(),
  expiryDate: date("expiry_date").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").default("available"), // available, reserved, expired, depleted
  location: text("location"), // storage location
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationInventorySchema = createInsertSchema(medicationInventory).omit({ 
  id: true, createdAt: true 
});
export type InsertMedicationInventory = z.infer<typeof insertMedicationInventorySchema>;
export type MedicationInventory = typeof medicationInventory.$inferSelect;

// Medication Transactions
export const medicationTransactions = pgTable("medication_transactions", {
  id: serial("id").primaryKey(),
  transactionType: text("transaction_type").notNull(), // purchase, dispensing, adjustment, return
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  batchNumber: text("batch_number"),
  quantity: integer("quantity").notNull(),
  referenceNumber: text("reference_number"), // PO number, prescription number, etc.
  referenceId: integer("reference_id"), // ID of related record (prescriptionId, purchaseOrderId, etc.)
  transactionDate: date("transaction_date").notNull(),
  transactionTime: time("transaction_time").notNull(),
  notes: text("notes"),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationTransactionSchema = createInsertSchema(medicationTransactions).omit({ 
  id: true, createdAt: true 
});
export type InsertMedicationTransaction = z.infer<typeof insertMedicationTransactionSchema>;
export type MedicationTransaction = typeof medicationTransactions.$inferSelect;

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxId: text("tax_id"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ 
  id: true, createdAt: true 
});
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Medication Purchase Orders
export const medicationPurchaseOrders = pgTable("medication_purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  status: text("status").default("draft"), // draft, ordered, partial, received, cancelled
  totalAmount: integer("total_amount").default(0),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationPurchaseOrderSchema = createInsertSchema(medicationPurchaseOrders).omit({ 
  id: true, createdAt: true, orderNumber: true, totalAmount: true
});
export type InsertMedicationPurchaseOrder = z.infer<typeof insertMedicationPurchaseOrderSchema>;
export type MedicationPurchaseOrder = typeof medicationPurchaseOrders.$inferSelect;

// Medication Purchase Order Items
export const medicationPurchaseOrderItems = pgTable("medication_purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => medicationPurchaseOrders.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  status: text("status").default("ordered"), // ordered, partial, received, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationPurchaseOrderItemSchema = createInsertSchema(medicationPurchaseOrderItems).omit({ 
  id: true, createdAt: true, totalPrice: true, receivedQuantity: true
});
export type InsertMedicationPurchaseOrderItem = z.infer<typeof insertMedicationPurchaseOrderItemSchema>;
export type MedicationPurchaseOrderItem = typeof medicationPurchaseOrderItems.$inferSelect;

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionNumber: text("prescription_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  medicalRecordId: integer("medical_record_id").notNull().references(() => medicalRecords.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  prescriptionDate: date("prescription_date").notNull(),
  prescriptionTime: time("prescription_time").notNull(),
  diagnosis: text("diagnosis"),
  icd10Code: text("icd10_code"),
  status: text("status").default("pending"), // pending, processed, dispensed, cancelled
  notes: text("notes"),
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  satuSehatPrescriptionId: text("satu_sehat_prescription_id"),
  issuedBy: integer("issued_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ 
  id: true, createdAt: true, prescriptionNumber: true,
  satuSehatSynced: true, satuSehatPrescriptionId: true
});
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

// Prescription Items
export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull().references(() => prescriptions.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  quantity: integer("quantity").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  route: text("route").notNull(), // oral, IV, topical, etc.
  duration: integer("duration"), // in days
  instructions: text("instructions"),
  startDate: date("start_date"),
  dispensed: boolean("dispensed").default(false),
  dispensedQuantity: integer("dispensed_quantity").default(0),
  dispensedBy: integer("dispensed_by").references(() => users.id),
  dispensedAt: timestamp("dispensed_at"),
  status: text("status").default("ordered"), // ordered, partial, dispensed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({ 
  id: true, createdAt: true, dispensed: true, 
  dispensedQuantity: true, dispensedBy: true, dispensedAt: true
});
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").default(0),
  tax: integer("tax").default(0),
  total: integer("total").notNull(),
  status: text("status").default("unpaid"), // unpaid, partial, paid, cancelled
  paymentMethod: text("payment_method"),
  paymentDate: date("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  // Relationships for different invoice sources
  appointmentId: integer("appointment_id").references(() => appointments.id),
  admissionId: integer("admission_id").references(() => admissions.id),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  labOrderId: integer("lab_order_id").references(() => labOrders.id),
  radiologyOrderId: integer("radiology_order_id").references(() => radiologyOrders.id),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, createdAt: true, invoiceNumber: true
});
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  amount: integer("amount").notNull(),
  // Item sources
  itemType: text("item_type").notNull(), // consultation, medication, procedure, lab_test, radiology, room, etc.
  itemId: integer("item_id"), // ID of related item
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ 
  id: true, createdAt: true 
});
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: text("payment_number").notNull().unique(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, credit_card, bank_transfer, insurance
  paymentDate: date("payment_date").notNull(),
  paymentTime: time("payment_time").notNull(),
  referenceNumber: text("reference_number"), // For bank transfers, credit cards, etc.
  notes: text("notes"),
  receivedBy: integer("received_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, createdAt: true, paymentNumber: true
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // patient_registration, appointment, medical_record, prescription, invoice, etc.
  description: text("description").notNull(),
  entityType: text("entity_type"), // patient, appointment, medical_record, etc.
  entityId: integer("entity_id"), // Reference to specific entity
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true, timestamp: true, ipAddress: true, userAgent: true
});
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Satu Sehat Integration
export const satuSehatCredentials = pgTable("satu_sehat_credentials", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  organizationId: text("organization_id").notNull(),
  baseUrl: text("base_url").notNull(),
  tokenUrl: text("token_url").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertSatuSehatCredentialSchema = createInsertSchema(satuSehatCredentials).omit({ 
  id: true, createdAt: true, updatedAt: true, 
  accessToken: true, refreshToken: true, tokenExpiry: true
});
export type InsertSatuSehatCredential = z.infer<typeof insertSatuSehatCredentialSchema>;
export type SatuSehatCredential = typeof satuSehatCredentials.$inferSelect;

// Satu Sehat Sync Status
export const satuSehatSync = pgTable("satu_sehat_sync", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // patient, medical_record, medication, prescription
  entityId: integer("entity_id").notNull(),
  satuSehatResourceType: text("satu_sehat_resource_type").notNull(), // Patient, Encounter, Observation, MedicationRequest, etc.
  satuSehatResourceId: text("satu_sehat_resource_id"),
  syncStatus: text("sync_status").notNull(), // pending, success, failed
  syncDate: timestamp("sync_date"),
  syncMessage: text("sync_message"),
  syncResponse: jsonb("sync_response"),
  retryCount: integer("retry_count").default(0),
  lastRetryDate: timestamp("last_retry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertSatuSehatSyncSchema = createInsertSchema(satuSehatSync).omit({ 
  id: true, createdAt: true, syncDate: true, lastRetryDate: true
});
export type InsertSatuSehatSync = z.infer<typeof insertSatuSehatSyncSchema>;
export type SatuSehatSync = typeof satuSehatSync.$inferSelect;

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value"),
  settingDescription: text("setting_description"),
  settingGroup: text("setting_group"),
  dataType: text("data_type").default("string"), // string, number, boolean, json
  isEditable: boolean("is_editable").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ 
  id: true, updatedAt: true
});
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportCode: text("report_code").notNull().unique(),
  reportName: text("report_name").notNull(),
  reportDescription: text("report_description"),
  reportCategory: text("report_category").notNull(), // operational, financial, clinical, statistics
  reportQuery: text("report_query"),
  parameters: jsonb("parameters"), // Array of required parameters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  status: text("status").default("active"),
});

export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, createdAt: true, updatedAt: true
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
