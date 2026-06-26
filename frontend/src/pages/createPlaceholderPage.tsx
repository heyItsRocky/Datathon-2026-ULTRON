import { PageHeader } from '@/shared/components';

export function createPlaceholderPage(title: string) {
  return function PlaceholderPage() {
    return <PageHeader title={title} subtitle="Coming soon" />;
  };
}
