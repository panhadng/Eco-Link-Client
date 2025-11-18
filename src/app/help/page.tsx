'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="p-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300">
            Need help? We're here for you!
          </p>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Help content coming soon...
          </p>
        </div>
        <div className="mt-6">
          <Link href="/feed" className="text-[hsl(38,55%,45%)] hover:underline dark:text-[hsl(38,65%,55%)]">
            ← Back to feed
          </Link>
        </div>
      </Card>
    </div>
  );
}

