import { type Post } from "../services/types";
import './PostCard.scss';

interface PostCardProps {
    post: Post;
    onReview?: (post: Post) => void;
}

function PostCard({ post, onReview }: PostCardProps) {
    const handleReviewClick = () => {
        if (onReview) {
            onReview(post);
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
                        className="reviewBtn"
                    >
                        Ответ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostCard;