import { useState } from "react";
import { z } from "zod";

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
}

export function useFormValidation<T>({ schema, onSubmit }: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: unknown): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      if (validate(data)) {
        await onSubmit(data as T);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    isSubmitting,
    validate,
    handleSubmit,
    clearErrors,
  };
}
