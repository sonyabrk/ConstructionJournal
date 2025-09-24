class GeoService {
    // получение текущей позиции - возврат сразу массив [lat, lng]
    async getCurrentPosition(): Promise<[number, number]> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    resolve(coords);
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                }
            );
        });
    }

    // проверка (находится ли точка внутри полигона проекта)
    isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
        if (polygon.length < 3) return false;
        
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > point[1]) !== (yj > point[1])) &&
                (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // расчет расстояния между точками (в метрах)
    calculateDistance(coord1: [number, number], coord2: [number, number]): number {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;
        
        const R = 6371e3; // Earth radius in meters
        const f1 = lat1 * Math.PI / 180;
        const f2 = lat2 * Math.PI / 180;
        const ug1 = (lat2 - lat1) * Math.PI / 180;
        const ug2 = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(ug1/2) * Math.sin(ug1/2) +
                Math.cos(f1) * Math.cos(f2) *
                Math.sin(ug2/2) * Math.sin(ug2/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // проверка (находится ли пользователь вблизи объекта (в пределах радиуса) )
    isNearObject(userCoords: [number, number], objectCoords: [number, number], radiusMeters: number = 100): boolean {
        const distance = this.calculateDistance(userCoords, objectCoords);
        return distance <= radiusMeters;
    }
}

export const geoService = new GeoService();