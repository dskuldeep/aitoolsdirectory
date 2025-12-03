import { slugify, formatDate, truncate } from '@/lib/utils'

describe('utils', () => {
  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('AI Tool 2024!')).toBe('ai-tool-2024')
      expect(slugify('Test---Multiple---Dashes')).toBe('test-multiple-dashes')
    })

    it('should handle special characters', () => {
      expect(slugify('Hello@World#Test')).toBe('helloworldtest')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toContain('January')
      expect(formatted).toContain('2024')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated'
      expect(truncate(text, 20)).toBe('This is a very long ...')
    })

    it('should not truncate short text', () => {
      const text = 'Short text'
      expect(truncate(text, 20)).toBe('Short text')
    })
  })
})

