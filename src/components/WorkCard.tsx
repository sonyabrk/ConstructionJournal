import profileSvg from "../assets/profile.svg";
import { type User } from "../services/types";

interface WorkCardProps {
    user: User;
    onReview?: (user: User) => void;
}

function WorkCard({ user, onReview }: WorkCardProps) {
    const handleReviewClick = () => {
        if (onReview) {
            onReview(user);
        }
    };

    return (
        <div className="workCard">
            <div className="workCardProfile">
                <img src={profileSvg} alt="Профиль"/>
                <div className="nameAndRole">
                    <strong>{user.username}</strong>
                    <span>{user.position}</span>
                </div>
            </div>
            <div className="card">
                <p className="email">Email: {user.email}</p>
                <p className="userId">ID: {user.id}</p>
                <button 
                    className="reviewBtn" 
                    onClick={handleReviewClick}
                >
                    Обзор
                </button> 
            </div>
        </div>
    );
}

export default WorkCard;