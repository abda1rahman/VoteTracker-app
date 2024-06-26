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
    }).optional(),
    ssn: string({
      required_error: "SSN is required",
    }),
    phone: string({
      required_error: "Phone number is required",
    }),
    city_id: number().int().min(1).max(12),
    role: z
      .string({
        required_error: "The role is required 'envoy' or 'candidate' ",
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

// Update envoy schema
export const updateEnvoySchema = object({
  body: object({
    firstName: string({
      required_error: "First name is required",
    }).optional(),
    lastName: string({
      required_error: "Last name is required",
    }).optional(),
    password: string({
      required_error: "Password is required",
    }).optional(),
    ssn: string({
      required_error: "SSN is required",
    }),
    newSSN: string({
      required_error: "newSSN is required",
    }).optional(),
    phone: string({
      required_error: "Phone number is required",
    }).optional(),

  }).strict(),
});

export const createEnvoySchema = object({
  body: createUserSchema.shape.body.extend({
    box_id: string({
      required_error: "box_id is required",
    }).refine(id => isValidObjectId(id), {message: "Invalid ObjectId format"}),
    candidate_id: string({
      required_error: "candidate_id is required"
    }).refine(id => isValidObjectId(id), {message: "Invalid ObjectId format"}),
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

// Candidate Params
export const getCandidateParamsSchema = object({
  params: object({
  candidate_id: string()
  .refine((id)=>  isValidObjectId(id), { message: "candidate_id must be valid id"})
  })
})

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type CreateEnvoyInput = TypeOf<typeof createEnvoySchema>["body"];
export type UpdateEnovyInput = TypeOf<typeof updateEnvoySchema>["body"]
export type CandidateParamsInput = TypeOf<typeof getCandidateParamsSchema>['params']
export type loginUserSchema = TypeOf<typeof loginUserSchema>["body"];

