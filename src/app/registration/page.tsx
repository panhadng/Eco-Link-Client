'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SIGNUP_VERIFICATION } from '@/lib/graphql/mutations';
import { VERIFY_NONCE } from '@/lib/graphql/queries';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Terms and conditions version - should match backend
const TERMS_VERSION = '1.0.0';

function RegistrationVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const email = searchParams.get('email') || '';
  const nonce = searchParams.get('nonce') || '';

  const { data: verifyData, loading: verifyLoading } = useQuery(VERIFY_NONCE, {
    variables: { email, nonce },
    skip: !email || !nonce,
    onCompleted: (data) => {
      setIsValid(data?.VerifyNonce === true);
      setIsVerifying(false);
    },
    onError: () => {
      setIsValid(false);
      setIsVerifying(false);
    },
  });

  const [signupVerificationMutation] = useMutation(SIGNUP_VERIFICATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!email || !nonce) {
      toast.error('Invalid verification link. Please check your email and try again.');
      router.push('/register');
    }
  }, [email, nonce, router]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    if (!email || !nonce) {
      toast.error('Missing verification information');
      return;
    }

    setIsLoading(true);
    try {
      const { data: result } = await signupVerificationMutation({
        variables: {
          nonce,
          email,
          name: data.name,
          password: data.password,
          termsAndConditionsAgreedVersion: TERMS_VERSION,
          locale: 'en',
        },
      });

      if (result?.SignupVerification) {
        toast.success('Account created successfully!');
        // Refetch user to update auth state
        await refetchUser();
        // Redirect to home page
        router.push('/');
      }
    } catch (error: any) {
      console.error('Registration verification error:', error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying || verifyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Invalid verification link</CardTitle>
            <CardDescription>The verification link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>This verification link is no longer valid. Please request a new verification email.</p>
            </div>
            <Link href="/register">
              <Button className="w-full">Request new verification email</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Complete your registration</CardTitle>
          <CardDescription>Enter your information to finish creating your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <p className="font-semibold">Email verified!</p>
            <p className="mt-1 text-xs">{email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full" isLoading={isLoading}>
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

export default function RegistrationVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <RegistrationVerificationContent />
    </Suspense>
  );
}

