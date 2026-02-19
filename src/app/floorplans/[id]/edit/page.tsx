import { FloorPlanEditor } from '@/components/floorplan/FloorPlanEditor';

export const metadata = {
  title: 'Edit Floor Plan | Asset Management System',
  description: 'Edit floor plan and manage desks',
};

interface FloorPlanEditPageProps {
  params: {
    id: string;
  };
}

export default function FloorPlanEditPage({ params }: FloorPlanEditPageProps) {
  return (
    <div>
      <FloorPlanEditor floorPlanId={params.id} />
    </div>
  );
}
