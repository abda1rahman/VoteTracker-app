import { TypeOf, number, object, string } from "zod";

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
    ssn: number({
      required_error: "SSN is required",
    }),
    phone: string({
      required_error: "Phone number is required",
    }),
    city_id: number().int().min(1).max(12),
  }),
});

export const loginUserSchema = object({
  body: object({
    ssn: number({
      required_error: "Password is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
export type loginUserSchema = TypeOf<typeof loginUserSchema>["body"];
