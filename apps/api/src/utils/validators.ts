export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const Validators = {
  email(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  },

  password(password: string): void {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      throw new ValidationError('Password does not meet requirements', errors);
    }
  },

  passwordMatch(password: string, confirmPassword: string): void {
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }
  },

  required(value: unknown, fieldName: string): void {
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw new ValidationError(`${fieldName} is required`);
    }
  },
};
