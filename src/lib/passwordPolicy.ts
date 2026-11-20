/** Signup password: 8 is the usual web floor, plus 4 character types. */
export const PASSWORD_MIN_LENGTH = 8

export type PasswordRules = {
  length: boolean
  lower: boolean
  upper: boolean
  digit: boolean
  punct: boolean
}

export function passwordRules(password: string): PasswordRules {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    lower: /[a-zà-ÿ]/.test(password),
    upper: /[A-ZÀ-Ÿ]/.test(password),
    digit: /\d/.test(password),
    punct: /[.!]/.test(password),
  }
}

export function isPasswordStrong(password: string): boolean {
  const r = passwordRules(password)
  // Length + both cases + (digit or . / !) — matches the signup checklist on screen.
  return r.length && r.lower && r.upper && (r.digit || r.punct)
}
