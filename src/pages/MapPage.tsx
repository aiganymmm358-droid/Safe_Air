import { LiveAQIMap } from "@/components/LiveAQIMap";

const MapPage = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <LiveAQIMap className="h-full w-full" />
    </div>
  );
};

export default MapPage;
