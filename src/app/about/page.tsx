'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="p-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">About EcoLink</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700">
            Welcome to EcoLink - The Global Nature Network. This is a social platform dedicated to connecting people who care about nature and the environment.
          </p>
          <p className="mt-4 text-gray-700">
            Content coming soon...
          </p>
        </div>
        <div className="mt-6">
          <Link href="/feed" className="text-primary hover:underline">
            ← Back to feed
          </Link>
        </div>
      </Card>
    </div>
  );
}

