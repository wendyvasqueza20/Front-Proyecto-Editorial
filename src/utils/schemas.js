// Copyright © 2025 Editorial Guaymuras. Todos los derechos reservados.
// Esquemas de validación para formularios del sistema

import { z } from 'zod';

// Esquema para login
export const loginSchema = z.object({
  username: z.string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede exceder 50 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El usuario solo puede contener letras, números y guiones bajos")
    .trim(),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(70, "La contraseña es demasiado larga")
    .trim()
});

// Esquema para registro (opcional, por si lo usas después)
export const registerSchema = z.object({
  username: z.string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .trim(),
  fullName: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo")
    .trim(),
  password: z.string()
    .min(6)
    .max(70)
    .trim()
});