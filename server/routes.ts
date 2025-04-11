import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { format } from "date-fns";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPatientSchema, 
  insertAppointmentSchema,
  insertMedicalRecordSchema,
  insertMedicationSchema,
  insertPrescriptionSchema,
  insertPrescriptionItemSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertActivitySchema,
  insertSatuSehatSyncSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // AUTH ROUTES
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real application, you'd use JWT or sessions
      // For simplicity, we're just returning the user without the password
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // USER ROUTES
  apiRouter.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      // Remove passwords from the response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Remove password from the response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PATIENT ROUTES
  apiRouter.get("/patients", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (query) {
        const patients = await storage.searchPatients(query);
        return res.json(patients);
      }
      
      const patients = await storage.listPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/patients", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      
      if (validatedData.medicalRecordNumber) {
        const existingPatient = await storage.getPatientByMedicalRecordNumber(validatedData.medicalRecordNumber);
        if (existingPatient) {
          return res.status(409).json({ message: "Medical record number already exists" });
        }
      }
      
      const patient = await storage.createPatient(validatedData);
      
      // Create activity log
      if (validatedData.createdBy) {
        await storage.createActivity({
          userId: validatedData.createdBy,
          activityType: "patient_registration",
          description: `Registered new patient: ${patient.name}`,
          entityType: "patient",
          entityId: patient.id
        });
      }
      
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.put("/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const existingPatient = await storage.getPatient(id);
      if (!existingPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Partial validation
      const validatedData = insertPatientSchema.partial().parse(req.body);
      
      const updatedPatient = await storage.updatePatient(id, validatedData);
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // APPOINTMENT ROUTES
  apiRouter.get("/appointments", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : undefined;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (date) {
        const appointments = await storage.listAppointmentsByDate(date);
        return res.json(appointments);
      }
      
      if (doctorId) {
        const appointments = await storage.listAppointmentsByDoctor(doctorId);
        return res.json(appointments);
      }
      
      if (patientId) {
        const appointments = await storage.listAppointmentsByPatient(patientId);
        return res.json(appointments);
      }
      
      const appointments = await storage.listAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/appointments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Validate that patient and doctor exist
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ message: "Patient not found" });
      }
      
      const doctor = await storage.getUser(validatedData.doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ message: "Doctor not found" });
      }
      
      const appointment = await storage.createAppointment(validatedData);
      
      // Create activity log
      if (validatedData.createdBy) {
        await storage.createActivity({
          userId: validatedData.createdBy,
          activityType: "appointment_created",
          description: `Created appointment for ${patient.name} with ${doctor.name}`,
          entityType: "appointment",
          entityId: appointment.id
        });
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.put("/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const existingAppointment = await storage.getAppointment(id);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Partial validation
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      
      const updatedAppointment = await storage.updateAppointment(id, validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // MEDICAL RECORDS ROUTES
  apiRouter.get("/medical-records", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (patientId) {
        const records = await storage.listMedicalRecordsByPatient(patientId);
        return res.json(records);
      }
      
      return res.status(400).json({ message: "Patient ID is required" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/medical-records/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const record = await storage.getMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/medical-records", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMedicalRecordSchema.parse(req.body);
      
      // Validate that patient and doctor exist
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ message: "Patient not found" });
      }
      
      const doctor = await storage.getUser(validatedData.doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ message: "Doctor not found" });
      }
      
      const record = await storage.createMedicalRecord(validatedData);
      
      // Create activity log
      if (validatedData.createdBy) {
        await storage.createActivity({
          userId: validatedData.createdBy,
          activityType: "medical_record_created",
          description: `Created medical record for ${patient.name}`,
          entityType: "medical_record",
          entityId: record.id
        });
      }
      
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // MEDICATION ROUTES
  apiRouter.get("/medications", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (query) {
        const medications = await storage.searchMedications(query);
        return res.json(medications);
      }
      
      const medications = await storage.listMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/medications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const medication = await storage.getMedication(id);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/medications", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PRESCRIPTION ROUTES
  apiRouter.get("/prescriptions", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const date = req.query.date as string;
      
      if (patientId) {
        const prescriptions = await storage.listPrescriptionsByPatient(patientId);
        return res.json(prescriptions);
      }
      
      if (date) {
        const prescriptions = await storage.listPrescriptionsByDate(date);
        return res.json(prescriptions);
      }
      
      return res.status(400).json({ message: "Patient ID or date is required" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/prescriptions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPrescriptionSchema.parse(req.body);
      
      // Validate that patient, doctor, and medical record exist
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ message: "Patient not found" });
      }
      
      const doctor = await storage.getUser(validatedData.doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ message: "Doctor not found" });
      }
      
      const medicalRecord = await storage.getMedicalRecord(validatedData.medicalRecordId);
      if (!medicalRecord) {
        return res.status(400).json({ message: "Medical record not found" });
      }
      
      const prescription = await storage.createPrescription(validatedData);
      
      // Create activity log
      if (validatedData.createdBy) {
        await storage.createActivity({
          userId: validatedData.createdBy,
          activityType: "prescription_created",
          description: `Created prescription for ${patient.name}`,
          entityType: "prescription",
          entityId: prescription.id
        });
      }
      
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PRESCRIPTION ITEMS ROUTES
  apiRouter.get("/prescription-items/:prescriptionId", async (req: Request, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.prescriptionId);
      if (isNaN(prescriptionId)) {
        return res.status(400).json({ message: "Invalid prescription ID" });
      }
      
      const items = await storage.listPrescriptionItemsByPrescription(prescriptionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/prescription-items", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPrescriptionItemSchema.parse(req.body);
      
      // Validate that prescription and medication exist
      const prescription = await storage.getPrescription(validatedData.prescriptionId);
      if (!prescription) {
        return res.status(400).json({ message: "Prescription not found" });
      }
      
      const medication = await storage.getMedication(validatedData.medicationId);
      if (!medication) {
        return res.status(400).json({ message: "Medication not found" });
      }
      
      const item = await storage.createPrescriptionItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // INVOICE ROUTES
  apiRouter.get("/invoices", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const date = req.query.date as string;
      const status = req.query.status as string;
      
      if (patientId) {
        const invoices = await storage.listInvoicesByPatient(patientId);
        return res.json(invoices);
      }
      
      if (date) {
        const invoices = await storage.listInvoicesByDate(date);
        return res.json(invoices);
      }
      
      if (status) {
        const invoices = await storage.listInvoicesByStatus(status);
        return res.json(invoices);
      }
      
      const invoices = await storage.listInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/invoices", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      
      // Validate that patient exists
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ message: "Patient not found" });
      }
      
      const invoice = await storage.createInvoice(validatedData);
      
      // Create activity log
      if (validatedData.createdBy) {
        await storage.createActivity({
          userId: validatedData.createdBy,
          activityType: "invoice_created",
          description: `Created invoice for ${patient.name}`,
          entityType: "invoice",
          entityId: invoice.id
        });
      }
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // INVOICE ITEMS ROUTES
  apiRouter.get("/invoice-items/:invoiceId", async (req: Request, res: Response) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      if (isNaN(invoiceId)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const items = await storage.listInvoiceItemsByInvoice(invoiceId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/invoice-items", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInvoiceItemSchema.parse(req.body);
      
      // Validate that invoice exists
      const invoice = await storage.getInvoice(validatedData.invoiceId);
      if (!invoice) {
        return res.status(400).json({ message: "Invoice not found" });
      }
      
      const item = await storage.createInvoiceItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ACTIVITIES ROUTES
  apiRouter.get("/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.listRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SATU SEHAT INTEGRATION ROUTES
  apiRouter.get("/satu-sehat/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getSatuSehatSyncStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/satu-sehat/sync", async (req: Request, res: Response) => {
    try {
      // This would actually call the Satu Sehat API in a real implementation
      // For now, we'll just update the sync status for demonstration
      
      // Sync all patients that are not synced
      const patients = await storage.listPatients();
      for (const patient of patients) {
        if (!patient.satuSehatSynced) {
          await storage.updatePatient(patient.id, { 
            satuSehatSynced: true,
            satuSehatId: `SS-PAT-${patient.id}` 
          });
          
          await storage.createSatuSehatSync({
            entityType: "patient",
            entityId: patient.id,
            syncStatus: "success",
            syncDate: new Date(),
            syncMessage: "Patient synced successfully",
            retryCount: 0
          });
        }
      }
      
      // Sync all medical records that are not synced
      const medicalRecords = [];
      for (const patient of patients) {
        const records = await storage.listMedicalRecordsByPatient(patient.id);
        medicalRecords.push(...records);
      }
      
      for (const record of medicalRecords) {
        if (!record.satuSehatSynced) {
          await storage.updateMedicalRecord(record.id, { 
            satuSehatSynced: true 
          });
          
          await storage.createSatuSehatSync({
            entityType: "medical_record",
            entityId: record.id,
            syncStatus: "success",
            syncDate: new Date(),
            syncMessage: "Medical record synced successfully",
            retryCount: 0
          });
        }
      }
      
      // Get updated stats
      const stats = await storage.getSatuSehatSyncStats();
      res.json({ message: "Sync completed", stats });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register the API router under the /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
