interface ObjectCardProps {
  address: string;
  coordinates: { lat: number; lng: number };
  supervision: string;
  contractor: string;
  objectStatus: 'Активно' | 'Не активно' | 'Завершено'; // пример union типа
}

function ObjectCard({ address, coordinates, supervision, contractor, objectStatus} : ObjectCardProps)
    {
    return (
        <>
            <div className="card">
                <p className="cardAddress">Адрес: {address} {coordinates.lat} {coordinates.lng}</p>
                <p className="card">Служба строительного контроля (ответственный):<br/>{supervision}</p>
                <p className="card">Подрядчик (ответственный):<br/>{contractor}</p>
                <p className="cardObjectStatus">Состояние объекта: {objectStatus}</p>
                <button className="objectBtn">Обзор</button>
            </div>
        </>
    )
}

export default ObjectCard;