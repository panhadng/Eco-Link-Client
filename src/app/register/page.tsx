'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SIMPLE_SIGNUP } from '@/lib/graphql/mutations';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// Terms and conditions version - should match backend
const TERMS_VERSION = '1.0.0';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [simpleSignupMutation] = useMutation(SIMPLE_SIGNUP);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const { data: result } = await simpleSignupMutation({
        variables: {
          email: data.email,
          name: data.name,
          password: data.password,
          termsAndConditionsAgreedVersion: TERMS_VERSION,
          locale: 'en',
        },
      });

      if (result?.SimpleSignup) {
        toast.success('Account created successfully!');
        // Automatically log in the user after successful signup
        try {
          await login(data.email, data.password);
          router.push('/');
        } catch (loginError) {
          // If auto-login fails, redirect to login page
          console.error('Auto-login failed:', loginError);
          toast.error('Account created! Please log in.');
          router.push('/login');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Registration failed';
      
      // Show user-friendly error messages
      let displayMessage = errorMessage;
      if (errorMessage.includes('email already exists') || errorMessage.includes('already exists')) {
        displayMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      }
      
      setFormError(displayMessage);
      toast.error(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <p className="font-semibold">Registration failed</p>
                <p className="mt-1">{formError}</p>
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="default" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

