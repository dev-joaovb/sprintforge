import initialStories from "../data/initialStories";
import UserStoryCard from "./UserStoryCard";

const ProductBacklog = () => {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
      "
    >
      {initialStories.map((story) => (
        <UserStoryCard
          key={story.id}
          story={story}
        />
      ))}
    </div>
  );
};

export default ProductBacklog;