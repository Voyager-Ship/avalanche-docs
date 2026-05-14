import { describe, expect, it } from 'vitest'

import {
  detectHtmlInjection,
  validateTextInput,
} from '@/utils/input-validator'

describe('input-validator', () => {
  it('allows plain words that contain script as a substring', () => {
    expect(detectHtmlInjection('Voyager project')).toBe(false)
    expect(detectHtmlInjection('Short description')).toBe(false)
    expect(detectHtmlInjection('Full description')).toBe(false)
    expect(validateTextInput('Short description', 'Short description')).toBe(true)
  })

  it('still rejects HTML and script injection attempts', () => {
    expect(detectHtmlInjection("<script>alert('xss')</script>")).toBe(true)
    expect(detectHtmlInjection('<img src=x onerror=alert(1)>')).toBe(true)
    expect(detectHtmlInjection('javascript:alert(1)')).toBe(true)
    expect(detectHtmlInjection('eval(alert(1))')).toBe(true)
  })
})
