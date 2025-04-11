import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";

import { 
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  appointments, type Appointment, type InsertAppointment,
  medicalRecords, type MedicalRecord, type InsertMedicalRecord,
  medications, type Medication, type InsertMedication,
  prescriptions, type Prescription, type InsertPrescription,
  prescriptionItems, type PrescriptionItem, type InsertPrescriptionItem,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem,
  activities, type Activity, type InsertActivity,
  satuSehatSync, type SatuSehatSync, type InsertSatuSehatSync
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Patients
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByMedicalRecordNumber(mrn: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.medicalRecordNumber, mrn));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updatedPatient] = await db
      .update(patients)
      .set(patient)
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async listPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.select().from(patients).where(
      or(
        like(patients.name, `%${query}%`),
        like(patients.medicalRecordNumber, `%${query}%`),
        like(patients.nationalId, `%${query}%`),
        like(patients.phone, `%${query}%`)
      )
    );
  }

  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Generate appointment number
    const appointmentNumber = `APP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const [newAppointment] = await db
      .insert(appointments)
      .values({ ...appointment, appointmentNumber })
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async listAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async listAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentDate, date));
  }

  async listAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));
  }

  async listAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId));
  }

  // Medical Records
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    // Generate record number
    const recordNumber = `MR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const [newRecord] = await db
      .insert(medicalRecords)
      .values({ ...record, recordNumber })
      .returning();
    return newRecord;
  }

  async updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const [updatedRecord] = await db
      .update(medicalRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(medicalRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async listMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.recordDate));
  }

  // Medications
  async getMedication(id: number): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values(medication).returning();
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const [updatedMedication] = await db
      .update(medications)
      .set(medication)
      .where(eq(medications.id, id))
      .returning();
    return updatedMedication;
  }

  async listMedications(): Promise<Medication[]> {
    return await db.select().from(medications).where(eq(medications.isActive, true));
  }

  async searchMedications(query: string): Promise<Medication[]> {
    return await db.select().from(medications).where(
      and(
        eq(medications.isActive, true),
        or(
          like(medications.name, `%${query}%`),
          like(medications.code, `%${query}%`),
          like(medications.genericName, `%${query}%`)
        )
      )
    );
  }

  // Prescriptions
  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    // Generate prescription number
    const prescriptionNumber = `PRE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const [newPrescription] = await db
      .insert(prescriptions)
      .values({ ...prescription, prescriptionNumber })
      .returning();
    return newPrescription;
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set(prescription)
      .where(eq(prescriptions.id, id))
      .returning();
    return updatedPrescription;
  }

  async listPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.prescriptionDate));
  }

  async listPrescriptionsByDate(date: string): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.prescriptionDate, date));
  }

  // Prescription Items
  async getPrescriptionItem(id: number): Promise<PrescriptionItem | undefined> {
    const [item] = await db.select().from(prescriptionItems).where(eq(prescriptionItems.id, id));
    return item;
  }

  async createPrescriptionItem(item: InsertPrescriptionItem): Promise<PrescriptionItem> {
    const [newItem] = await db.insert(prescriptionItems).values(item).returning();
    return newItem;
  }

  async listPrescriptionItemsByPrescription(prescriptionId: number): Promise<PrescriptionItem[]> {
    return await db
      .select()
      .from(prescriptionItems)
      .where(eq(prescriptionItems.prescriptionId, prescriptionId));
  }

  // Invoices
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoice, invoiceNumber })
      .returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoice)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async listInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async listInvoicesByPatient(patientId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.patientId, patientId))
      .orderBy(desc(invoices.invoiceDate));
  }

  async listInvoicesByDate(date: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceDate, date));
  }

  async listInvoicesByStatus(status: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, status));
  }

  // Invoice Items
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
    return item;
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async listInvoiceItemsByInvoice(invoiceId: number): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  // Activities
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async listRecentActivities(limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  // Satu Sehat Sync
  async createSatuSehatSync(sync: InsertSatuSehatSync): Promise<SatuSehatSync> {
    const [newSync] = await db.insert(satuSehatSync).values(sync).returning();
    return newSync;
  }

  async updateSatuSehatSync(id: number, sync: Partial<InsertSatuSehatSync>): Promise<SatuSehatSync | undefined> {
    const [updatedSync] = await db
      .update(satuSehatSync)
      .set(sync)
      .where(eq(satuSehatSync.id, id))
      .returning();
    return updatedSync;
  }

  async listSatuSehatSyncByEntityType(entityType: string): Promise<SatuSehatSync[]> {
    return await db
      .select()
      .from(satuSehatSync)
      .where(eq(satuSehatSync.entityType, entityType));
  }

  async getSatuSehatSyncStats(): Promise<Record<string, { total: number, synced: number }>> {
    // Get the stats by querying the database directly
    type StatRow = {
      entityType: string;
      total: number;
      synced: number;
    };
    
    const queryResults = await db
      .select({
        entityType: satuSehatSync.entityType,
        total: sql<number>`COUNT(*)`,
        synced: sql<number>`SUM(CASE WHEN ${satuSehatSync.syncStatus} = 'success' THEN 1 ELSE 0 END)`
      })
      .from(satuSehatSync)
      .groupBy(satuSehatSync.entityType);
    
    const stats: Record<string, { total: number, synced: number }> = {};
    
    // Process results
    for (const row of queryResults) {
      stats[row.entityType] = {
        total: Number(row.total),
        synced: Number(row.synced) || 0
      };
    }
    
    return stats;
  }
}