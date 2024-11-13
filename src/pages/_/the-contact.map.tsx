import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

// MAIN ************************************************************************************************************************************
export default function TheContactMap({ className }: TheContactMapProps) {
  const center: [number, number] = [-21.142_107, 55.294_209];
  return (
    <MapContainer center={center} zoom={17} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}></Marker>
    </MapContainer>
  );
}

// TYPES *********************************************************************************************************************************
export type TheContactMapProps = {
  className: string;
};
