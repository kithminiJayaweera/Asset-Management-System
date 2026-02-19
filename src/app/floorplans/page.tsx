import { FloorPlanManager } from '@/components/floorplan/FloorPlanManager';

export const metadata = {
  title: 'Floor Plans | Asset Management System',
  description: 'Manage floor plans and desk layouts',
};

export default function FloorPlansPage() {
  // In a real app, get organizationId from auth session
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '507f1f77bcf86cd799439011';

  return (
    <div className="container mx-auto py-8 px-4">
      <FloorPlanManager organizationId={organizationId} />
    </div>
  );
}
