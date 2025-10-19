import { type User } from '../services/types';
import './WorkCard.scss';

interface WorkCardProps {
    user: User;
    onReview: (user: User) => void;
    currentUserRole?: string;
}

const WorkCard = ({ user, onReview, currentUserRole }: WorkCardProps) => {
    const canEdit = currentUserRole === 'ROLE_CONTRACTOR' || currentUserRole === 'ROLE_SUPERVISION';
    const handleReviewClick = () => {
        if (onReview) {
            onReview(user);
        }
    };
    
    return (
        <div className="workCard">
            <h4>{user.username}</h4>
            <p>{user.position}</p>
            <p>{user.email}</p>
            
            {canEdit && (
                <button 
                    className="reviewBtn"
                    onClick={handleReviewClick}
                >
                    Просмотр
                </button>
            )}
        </div>
    );
};

export default WorkCard;