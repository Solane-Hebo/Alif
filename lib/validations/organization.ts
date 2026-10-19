import { z } from "zod";

export const updateOrganizationSettingsSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Company name must be at least 2 characters."
      )
      .max(
        100,
        "Company name is too long."
      ),

    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z]{3}$/,
        "Currency must be a valid 3-letter code."
      ),

    locale: z
      .string()
      .trim()
      .min(
        2,
        "Locale is required."
      )
      .max(
        35,
        "Locale is too long."
      ),

    timezone: z
      .string()
      .trim()
      .min(
        1,
        "Timezone is required."
      )
      .max(
        100,
        "Timezone is too long."
      ),

    calendar: z.enum(
      ["gregory", "ethiopic"],
      {
        message:
          "Please select a valid calendar.",
      }
    ),
  });