'use client';

import { use } from 'react';
import { ConnectionsPage } from '../connections-page';

export default function FollowersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ConnectionsPage slug={slug} type="followers" />;
}

