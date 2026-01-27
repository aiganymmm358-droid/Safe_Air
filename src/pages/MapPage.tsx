import { AQIMap } from "@/components/map";

const MapPage = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <AQIMap className="h-full w-full" />
    </div>
  );
};

export default MapPage;
