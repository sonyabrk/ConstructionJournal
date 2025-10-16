import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// иконка для маркера
const customIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapComponentProps {
    coordinates: Array<{
        x: number;
        y: number;
    }>;
    zoom?: number;
    height?: string;
    className?: string;
    popupText?: string;
}

const MapComponent = ({ 
    coordinates, 
    zoom = 15,
    height = '400px',
    className = '',
    popupText = 'Объект'
}: MapComponentProps) => {

    if (!coordinates || coordinates.length !== 2) {
        return (
            <div className="mapNotFound">Координаты объекта не указаны</div>
        );
    }

    const leafletCoordinates = coordinates.map(coord => [coord.y, coord.x] as [number, number]);

    return (
        <div className={className} style={{ height, width: '100%' }}>
            <MapContainer 
                center={leafletCoordinates[0]} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
                {leafletCoordinates.map((position, index) => (

                    <Marker key={index} position={position} icon={customIcon}>
                        <Popup>
                            {popupText}<br />
                            Координаты: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;