import { z } from 'zod'

export const submissionSchema = z.object({
  toolData: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    slug: z.string().optional(),
    tagline: z.string().max(300).optional(),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).min(1, 'At least one tag is required').max(10),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    github: z.string().url('Invalid URL').optional().or(z.literal('')),
    pricing: z.string().optional(),
    license: z.string().optional(),
    integrations: z.array(z.string()).optional(),
    screenshots: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional(),
        })
      )
      .optional(),
  }),
  submitterEmail: z.string().email('Invalid email address'),
  submitterName: z.string().optional(),
  honeypot: z.string().optional(), // Spam prevention
  recaptchaToken: z.string().optional(),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

