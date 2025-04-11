import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
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
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  idNumber: text("id_number"),
  bloodType: text("blood_type"),
  insuranceNumber: text("insurance_number"),
  insuranceProvider: text("insurance_provider"),
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

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  type: text("type").notNull(), // Konsultasi, Pemeriksaan, Kontrol, etc.
  status: text("status").default("scheduled"), // scheduled, in-progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, createdAt: true 
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Medical Records
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  recordDate: date("record_date").notNull(),
  subjective: text("subjective"), // Keluhan pasien
  objective: text("objective"), // Hasil pemeriksaan fisik
  assessment: text("assessment"), // Diagnosis
  plan: text("plan"), // Rencana pengobatan
  icd10Code: text("icd10_code"), // Kode diagnosis ICD-10
  vitalSigns: jsonb("vital_signs"), // BP, HR, RR, temp, etc.
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ 
  id: true, createdAt: true, satuSehatSynced: true 
});
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Tablet, Capsule, Syrup, etc.
  unit: text("unit").notNull(), // mg, ml, etc.
  price: integer("price").notNull(),
  stock: integer("stock").default(0),
  satuSehatCode: text("satu_sehat_code"),
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({ 
  id: true, createdAt: true, satuSehatSynced: true 
});
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  medicalRecordId: integer("medical_record_id").notNull().references(() => medicalRecords.id),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  prescriptionDate: date("prescription_date").notNull(),
  status: text("status").default("pending"), // pending, processed, completed, cancelled
  notes: text("notes"),
  satuSehatSynced: boolean("satu_sehat_synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ 
  id: true, createdAt: true, satuSehatSynced: true 
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
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({ 
  id: true, createdAt: true 
});
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").default(0),
  tax: integer("tax").default(0),
  total: integer("total").notNull(),
  status: text("status").default("unpaid"), // unpaid, paid, cancelled
  paymentMethod: text("payment_method"),
  paymentDate: date("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, createdAt: true 
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
  itemType: text("item_type").notNull(), // consultation, medication, procedure, etc.
  itemId: integer("item_id"), // Reference to specific item (medication_id, service_id, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ 
  id: true, createdAt: true 
});
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // patient_registration, appointment, medical_record, prescription, invoice, etc.
  description: text("description").notNull(),
  entityType: text("entity_type"), // patient, appointment, medical_record, etc.
  entityId: integer("entity_id"), // Reference to specific entity
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true, timestamp: true 
});
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// SatuSehat Sync Status
export const satuSehatSync = pgTable("satu_sehat_sync", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // patient, medical_record, medication, prescription
  entityId: integer("entity_id").notNull(),
  syncStatus: text("sync_status").notNull(), // pending, success, failed
  syncDate: timestamp("sync_date"),
  syncMessage: text("sync_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSatuSehatSyncSchema = createInsertSchema(satuSehatSync).omit({ 
  id: true, createdAt: true 
});
export type InsertSatuSehatSync = z.infer<typeof insertSatuSehatSyncSchema>;
export type SatuSehatSync = typeof satuSehatSync.$inferSelect;
