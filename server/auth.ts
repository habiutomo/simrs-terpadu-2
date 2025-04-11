import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  console.log("[AUTH] Setting up authentication...");

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "simrs-secret-session-key",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 86400000, // 24 hours
      httpOnly: true
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // For demo purposes, use direct comparison (not secure for production)
        if (!user) {
          return done(null, false);
        }
        
        // Check if it's admin/dokter account with demo credentials
        if ((username === 'admin' && password === 'admin123') || 
            (username === 'dokter' && password === 'dokter123')) {
          return done(null, user);
        }
        
        // Otherwise try to compare hashed passwords
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        }
        
        return done(null, false);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("[AUTH] Serializing user:", user.id, user.username);
    // Store only the user ID in the session
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    console.log("[AUTH] Deserializing user with ID:", id);
    try {
      const user = await storage.getUser(id);
      if (!user) {
        console.log("[AUTH] User not found during deserialization");
        return done(null, false);
      }
      console.log("[AUTH] User deserialized successfully:", user.username);
      done(null, user);
    } catch (error) {
      console.error("[AUTH] Error deserializing user:", error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username sudah digunakan");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Log activity
      await storage.createAktivitas({
        userId: user.id,
        aktivitas: "Pendaftaran User",
        keterangan: `User ${user.username} berhasil terdaftar`,
        tanggal: new Date(),
        status: "Selesai"
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        console.log("[AUTH] Login failed - No user found");
        return res.status(401).json({ error: "Username atau password salah" });
      }
      
      // Log the login attempt
      console.log("[AUTH] Login attempt for user:", user.username);
      
      // Manually log in the user and establish session
      req.login(user, async (loginErr) => {
        if (loginErr) {
          console.error("[AUTH] Login error:", loginErr);
          return next(loginErr);
        }
        
        console.log("[AUTH] Login successful for:", user.username);
        console.log("[AUTH] Session ID after login:", req.sessionID);
        
        // Log activity
        await storage.createAktivitas({
          userId: user.id,
          aktivitas: "Login",
          keterangan: `User ${user.username} berhasil login`,
          tanggal: new Date(),
          status: "Selesai"
        });
        
        // Manual regeneration of session to ensure it's saved
        req.session.save((err) => {
          if (err) {
            console.error("[AUTH] Session save error:", err);
            return next(err);
          }
          
          // Return user info without password
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    // Log activity
    if (req.user) {
      await storage.createAktivitas({
        userId: req.user.id,
        aktivitas: "Logout",
        keterangan: `User ${req.user.username} berhasil logout`,
        tanggal: new Date(),
        status: "Selesai"
      });
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("[AUTH] GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("[AUTH] Session ID:", req.sessionID);
    console.log("[AUTH] Session:", req.session);
    
    // Debug user authentication
    if (!req.isAuthenticated()) {
      console.log("[AUTH] User not authenticated");
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log("[AUTH] Authenticated user:", req.user);
    res.json(req.user);
  });
}
