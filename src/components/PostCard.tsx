import { type Post } from "../services/types";

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
                <strong>{post.author.username}</strong>
                <span>{post.author.position}</span>
                <span>{post.created_at}</span>
                <p className="postTitle">{post.title}</p>
                <button
                    className="reviewBtn"
                    onClick={handleReviewClick}
                    hidden
                >
                    Обзор
                </button>
            </div>
        </div>
    );
}

export default PostCard;