import { BuildingScreen } from "@/components/screens/building-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuildingScreen buildingId={id} />;
}
