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

// Interface defining all the CRUD operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;

  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByMedicalRecordNumber(mrn: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  listPatients(): Promise<Patient[]>;
  searchPatients(query: string): Promise<Patient[]>;

  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  listAppointments(): Promise<Appointment[]>;
  listAppointmentsByDate(date: string): Promise<Appointment[]>;
  listAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  listAppointmentsByPatient(patientId: number): Promise<Appointment[]>;

  // Medical Records
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined>;
  listMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;

  // Medications
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  listMedications(): Promise<Medication[]>;
  searchMedications(query: string): Promise<Medication[]>;

  // Prescriptions
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  listPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  listPrescriptionsByDate(date: string): Promise<Prescription[]>;

  // Prescription Items
  getPrescriptionItem(id: number): Promise<PrescriptionItem | undefined>;
  createPrescriptionItem(item: InsertPrescriptionItem): Promise<PrescriptionItem>;
  listPrescriptionItemsByPrescription(prescriptionId: number): Promise<PrescriptionItem[]>;

  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  listInvoices(): Promise<Invoice[]>;
  listInvoicesByPatient(patientId: number): Promise<Invoice[]>;
  listInvoicesByDate(date: string): Promise<Invoice[]>;
  listInvoicesByStatus(status: string): Promise<Invoice[]>;

  // Invoice Items
  getInvoiceItem(id: number): Promise<InvoiceItem | undefined>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  listInvoiceItemsByInvoice(invoiceId: number): Promise<InvoiceItem[]>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  listRecentActivities(limit: number): Promise<Activity[]>;

  // Satu Sehat Sync
  createSatuSehatSync(sync: InsertSatuSehatSync): Promise<SatuSehatSync>;
  updateSatuSehatSync(id: number, sync: Partial<InsertSatuSehatSync>): Promise<SatuSehatSync | undefined>;
  listSatuSehatSyncByEntityType(entityType: string): Promise<SatuSehatSync[]>;
  getSatuSehatSyncStats(): Promise<Record<string, { total: number, synced: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private medicalRecords: Map<number, MedicalRecord>;
  private medications: Map<number, Medication>;
  private prescriptions: Map<number, Prescription>;
  private prescriptionItems: Map<number, PrescriptionItem>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private activities: Map<number, Activity>;
  private satuSehatSyncs: Map<number, SatuSehatSync>;

  private userIdCounter: number;
  private patientIdCounter: number;
  private appointmentIdCounter: number;
  private medicalRecordIdCounter: number;
  private medicationIdCounter: number;
  private prescriptionIdCounter: number;
  private prescriptionItemIdCounter: number;
  private invoiceIdCounter: number;
  private invoiceItemIdCounter: number;
  private activityIdCounter: number;
  private satuSehatSyncIdCounter: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.medicalRecords = new Map();
    this.medications = new Map();
    this.prescriptions = new Map();
    this.prescriptionItems = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.activities = new Map();
    this.satuSehatSyncs = new Map();

    this.userIdCounter = 1;
    this.patientIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.medicalRecordIdCounter = 1;
    this.medicationIdCounter = 1;
    this.prescriptionIdCounter = 1;
    this.prescriptionItemIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.invoiceItemIdCounter = 1;
    this.activityIdCounter = 1;
    this.satuSehatSyncIdCounter = 1;

    // Initialize with some sample data
    this.seedSampleData();
  }

  // USERS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now, status: "active" };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // PATIENTS
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByMedicalRecordNumber(mrn: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.medicalRecordNumber === mrn
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientIdCounter++;
    const now = new Date();
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      createdAt: now, 
      status: "active", 
      satuSehatSynced: false 
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existingPatient = this.patients.get(id);
    if (!existingPatient) return undefined;
    
    const updatedPatient: Patient = { ...existingPatient, ...patientData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async listPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async searchPatients(query: string): Promise<Patient[]> {
    query = query.toLowerCase();
    return Array.from(this.patients.values()).filter(
      (patient) => 
        patient.name.toLowerCase().includes(query) || 
        patient.medicalRecordNumber.toLowerCase().includes(query) ||
        (patient.phone && patient.phone.includes(query))
    );
  }

  // APPOINTMENTS
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const now = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt: now };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;
    
    const updatedAppointment: Appointment = { ...existingAppointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async listAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async listAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.appointmentDate === date)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }

  async listAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.doctorId === doctorId);
  }

  async listAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.patientId === patientId);
  }

  // MEDICAL RECORDS
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.medicalRecordIdCounter++;
    const now = new Date();
    const record: MedicalRecord = { 
      ...insertRecord, 
      id, 
      createdAt: now, 
      satuSehatSynced: false 
    };
    this.medicalRecords.set(id, record);
    return record;
  }

  async updateMedicalRecord(id: number, recordData: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const existingRecord = this.medicalRecords.get(id);
    if (!existingRecord) return undefined;
    
    const updatedRecord: MedicalRecord = { ...existingRecord, ...recordData };
    this.medicalRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async listMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values())
      .filter(record => record.patientId === patientId);
  }

  // MEDICATIONS
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const now = new Date();
    const medication: Medication = { 
      ...insertMedication, 
      id, 
      createdAt: now, 
      satuSehatSynced: false 
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: number, medicationData: Partial<InsertMedication>): Promise<Medication | undefined> {
    const existingMedication = this.medications.get(id);
    if (!existingMedication) return undefined;
    
    const updatedMedication: Medication = { ...existingMedication, ...medicationData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async listMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async searchMedications(query: string): Promise<Medication[]> {
    query = query.toLowerCase();
    return Array.from(this.medications.values()).filter(
      (medication) => 
        medication.name.toLowerCase().includes(query) || 
        medication.code.toLowerCase().includes(query)
    );
  }

  // PRESCRIPTIONS
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionIdCounter++;
    const now = new Date();
    const prescription: Prescription = { 
      ...insertPrescription, 
      id, 
      createdAt: now, 
      satuSehatSynced: false 
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescription(id: number, prescriptionData: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const existingPrescription = this.prescriptions.get(id);
    if (!existingPrescription) return undefined;
    
    const updatedPrescription: Prescription = { ...existingPrescription, ...prescriptionData };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  async listPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter(prescription => prescription.patientId === patientId);
  }

  async listPrescriptionsByDate(date: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter(prescription => prescription.prescriptionDate === date);
  }

  // PRESCRIPTION ITEMS
  async getPrescriptionItem(id: number): Promise<PrescriptionItem | undefined> {
    return this.prescriptionItems.get(id);
  }

  async createPrescriptionItem(insertItem: InsertPrescriptionItem): Promise<PrescriptionItem> {
    const id = this.prescriptionItemIdCounter++;
    const now = new Date();
    const item: PrescriptionItem = { ...insertItem, id, createdAt: now };
    this.prescriptionItems.set(id, item);
    return item;
  }

  async listPrescriptionItemsByPrescription(prescriptionId: number): Promise<PrescriptionItem[]> {
    return Array.from(this.prescriptionItems.values())
      .filter(item => item.prescriptionId === prescriptionId);
  }

  // INVOICES
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.invoiceNumber === invoiceNumber
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const now = new Date();
    const invoice: Invoice = { ...insertInvoice, id, createdAt: now };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice: Invoice = { ...existingInvoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async listInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async listInvoicesByPatient(patientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.patientId === patientId);
  }

  async listInvoicesByDate(date: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.invoiceDate === date);
  }

  async listInvoicesByStatus(status: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.status === status);
  }

  // INVOICE ITEMS
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    return this.invoiceItems.get(id);
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.invoiceItemIdCounter++;
    const now = new Date();
    const item: InvoiceItem = { ...insertItem, id, createdAt: now };
    this.invoiceItems.set(id, item);
    return item;
  }

  async listInvoiceItemsByInvoice(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values())
      .filter(item => item.invoiceId === invoiceId);
  }

  // ACTIVITIES
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, timestamp: now };
    this.activities.set(id, activity);
    return activity;
  }

  async listRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // SATU SEHAT SYNC
  async createSatuSehatSync(insertSync: InsertSatuSehatSync): Promise<SatuSehatSync> {
    const id = this.satuSehatSyncIdCounter++;
    const now = new Date();
    const sync: SatuSehatSync = { ...insertSync, id, createdAt: now };
    this.satuSehatSyncs.set(id, sync);
    return sync;
  }

  async updateSatuSehatSync(id: number, syncData: Partial<InsertSatuSehatSync>): Promise<SatuSehatSync | undefined> {
    const existingSync = this.satuSehatSyncs.get(id);
    if (!existingSync) return undefined;
    
    const updatedSync: SatuSehatSync = { ...existingSync, ...syncData };
    this.satuSehatSyncs.set(id, updatedSync);
    return updatedSync;
  }

  async listSatuSehatSyncByEntityType(entityType: string): Promise<SatuSehatSync[]> {
    return Array.from(this.satuSehatSyncs.values())
      .filter(sync => sync.entityType === entityType);
  }

  async getSatuSehatSyncStats(): Promise<Record<string, { total: number, synced: number }>> {
    // For patients
    const totalPatients = this.patients.size;
    const syncedPatients = Array.from(this.patients.values()).filter(p => p.satuSehatSynced).length;
    
    // For medical records
    const totalMedicalRecords = this.medicalRecords.size;
    const syncedMedicalRecords = Array.from(this.medicalRecords.values()).filter(m => m.satuSehatSynced).length;
    
    // For medications
    const totalMedications = this.medications.size;
    const syncedMedications = Array.from(this.medications.values()).filter(m => m.satuSehatSynced).length;
    
    // For prescriptions
    const totalPrescriptions = this.prescriptions.size;
    const syncedPrescriptions = Array.from(this.prescriptions.values()).filter(p => p.satuSehatSynced).length;
    
    return {
      patients: { total: totalPatients, synced: syncedPatients },
      medicalRecords: { total: totalMedicalRecords, synced: syncedMedicalRecords },
      medications: { total: totalMedications, synced: syncedMedications },
      prescriptions: { total: totalPrescriptions, synced: syncedPrescriptions },
    };
  }

  // Seed initial sample data
  private seedSampleData(): void {
    // Create sample users
    const user1 = this.createUser({
      username: "dr.rahmat",
      password: "password",
      name: "Dr. Rahmat",
      role: "doctor",
      email: "dr.rahmat@hospital.com",
      phone: "081234567890"
    });

    const user2 = this.createUser({
      username: "dr.siti",
      password: "password",
      name: "Dr. Siti Aminah",
      role: "doctor",
      email: "dr.siti@hospital.com",
      phone: "081234567891"
    });

    const user3 = this.createUser({
      username: "apt.dewi",
      password: "password",
      name: "Apt. Dewi",
      role: "pharmacist",
      email: "apt.dewi@hospital.com",
      phone: "081234567892"
    });

    const user4 = this.createUser({
      username: "admin",
      password: "password",
      name: "Admin",
      role: "admin",
      email: "admin@hospital.com",
      phone: "081234567893"
    });

    // Create sample medications
    this.createMedication({
      code: "MED001",
      name: "Paracetamol",
      type: "Tablet",
      unit: "500mg",
      price: 5000,
      stock: 100,
      satuSehatCode: "SC001"
    });

    this.createMedication({
      code: "MED002",
      name: "Amoxicillin",
      type: "Capsule",
      unit: "500mg",
      price: 10000,
      stock: 80,
      satuSehatCode: "SC002"
    });

    this.createMedication({
      code: "MED003",
      name: "Ibuprofen",
      type: "Tablet",
      unit: "400mg",
      price: 8000,
      stock: 90,
      satuSehatCode: "SC003"
    });

    // We'll create more sample data when needed
  }
}

export const storage = new MemStorage();
