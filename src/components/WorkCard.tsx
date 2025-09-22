import profileSvg from "../assets/profile.svg"

interface WorkCardProps {
    name: string;
    role: string;
    address: string;
    coordinates: { lat: number; lng: number };
    typeOfMessage: string;
    comment: string;
}

function WorkCard( {name, role, address, coordinates, typeOfMessage, comment} : WorkCardProps) {
    return (
        <>
            <div className="workCard">
                <div className="workCardProfile">
                    <img src={profileSvg} alt="Профиль"/>
                    <p className="nameAndRole">{name} ({role})</p>
                </div>
                <div className="card">
                    <p className="address">Местоположение: {address} {coordinates.lat} {coordinates.lng}</p>
                    <p className="typeOfMessage">{typeOfMessage}</p>
                    <p className="comment">{comment}</p>
                    <button className="reviewBtn">Обзор</button> 
                </div>
            </div>
        </>
    )
}

export default WorkCard;