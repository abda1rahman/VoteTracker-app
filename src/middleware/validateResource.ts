import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      // If validation fails, handle the ZodError
      if (error instanceof ZodError) {
        // Extract and format the error details
        const errorMessage = error.errors.map((err: any) => ({
          code: err.code,
          message: err.message,
          expected: err.expected,
          received: err.received,
        }));

        // Return a 400 Bad Request response with the array of error objects
        return res.status(400).json({ errors: errorMessage });
      } else {
        // If the error is not a ZodError, return a generic error response
        return res
          .status(500)
          .json({ error: "An error occurred while processing the request." });
      }
    }
  };

export default validate;
