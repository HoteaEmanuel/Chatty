import { z } from 'zod';

const email = z.string().trim().min(1, 'Enter your email').email('Enter a valid email');
const password = z.string().min(6, 'Password must be at least 6 characters');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your name'),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
