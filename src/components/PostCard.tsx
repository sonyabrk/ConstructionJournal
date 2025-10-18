import { type Post } from "../services/types";
import './PostCard.scss';

interface PostCardProps {
    post: Post;
    onReview?: (post: Post) => void;
    onAnswer?: (post: Post) => void; // добавляем новый пропс
}

function PostCard({ post, onReview, onAnswer }: PostCardProps) {
    const handleReviewClick = () => {
        if (onReview) {
            onReview(post);
        }
    };

    const handleAnswerClick = () => {
        if (onAnswer) {
            onAnswer(post);
        }
    };

    

    return (
        <div className="postCard">
            <div className="card">
                <h4>{post.author.username}</h4>
                <span>{post.author.position}</span>
                <span>{post.created_at}</span>
                <p className="postTitle">{post.title}</p>
                <div className="postCardBtn">
                    <button
                        className="reviewBtn"
                        onClick={handleReviewClick}
                    >
                        Обзор
                    </button>
                    <button
                        className="answerBtn"
                        onClick={handleAnswerClick}
                    >
                        Ответ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostCard;