import { useScrum } from "../../../context/ScrumContext";
import UserStoryCard from "./UserStoryCard";

const ProductBacklog = () => {
    const { stories } = useScrum();
    return (
        <div
        className="
            flex
            flex-col
            gap-4
        "
        >
        {stories.map((story) => (
            <UserStoryCard
            key={story.id}
            story={story}
            />
        ))}
        </div>
    );
};

export default ProductBacklog;