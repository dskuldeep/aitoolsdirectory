import { submissionSchema } from '@/lib/validation'

describe('submissionSchema', () => {
  const validSubmission = {
    toolData: {
      name: 'Test Tool',
      description: 'This is a test tool description that is long enough to pass validation',
      category: 'Productivity',
      tags: ['ai', 'productivity'],
    },
    submitterEmail: 'test@example.com',
  }

  it('should validate correct submission', () => {
    const result = submissionSchema.safeParse(validSubmission)
    expect(result.success).toBe(true)
  })

  it('should reject submission with short description', () => {
    const invalid = {
      ...validSubmission,
      toolData: {
        ...validSubmission.toolData,
        description: 'Short',
      },
    }
    const result = submissionSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject submission without name', () => {
    const invalid = {
      ...validSubmission,
      toolData: {
        ...validSubmission.toolData,
        name: '',
      },
    }
    const result = submissionSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject submission with invalid email', () => {
    const invalid = {
      ...validSubmission,
      submitterEmail: 'invalid-email',
    }
    const result = submissionSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

