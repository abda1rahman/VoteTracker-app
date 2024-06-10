import { isValidObjectId } from "mongoose";
import { TypeOf, number, object, string, z } from "zod";

export const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }),
    lastName: string({
      required_error: "Last name is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
    ssn: string({
      required_error: "SSN is required",
    }),
    phone: string({
      required_error: "Phone number is required",
    }),
    city_id: number().int().min(1).max(12),
    role: z
      .string({
        required_error: "The role is required 'admin' or 'employ' ",
      })
      .refine(
        (value: string) =>
          ["envoy", "candidate", "developer"].includes(value.toLowerCase()),
        {
          message: "Role must be either 'envoy' or 'candidate' or 'developer'",
        }
      ),
  }),
});

export const createEnvoySchema = object({
  body: createUserSchema.shape.body.extend({
    box_id: string({
      required_error: "box_id is required",
    }).refine(id => isValidObjectId(id), {message: "Invalid ObjectId format"}),
    candidate_id: string({
      required_error: "candidateId is required"
    })
  }),
});

export const loginUserSchema = object({
  body: object({
    ssn: string({
      required_error: "Password is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type CreateEnvoyInput = TypeOf<typeof createEnvoySchema>["body"];
export type loginUserSchema = TypeOf<typeof loginUserSchema>["body"];
