import { useScrum } from "../../../context/ScrumContext";
import { useState } from "react";

import StoryModal from "./StoryModal";
import UserStoryCard from "./UserStoryCard";

const ProductBacklog = () => {
  const { stories } = useScrum();
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedStory, setSelectedStory] = useState(null);

  const handleNewStory = () => {
    setSelectedStory(null);
    setModalOpen(true);
  };

  const handleEditStory = (story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleNewStory}
          className="
          bg-blue-600
          hover:bg-blue-700
          transition
          px-4
          py-2
          rounded-lg
          font-medium
        "
        >
          + Nova User Story
        </button>
      </div>

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
            onClick={handleEditStory}
          />
        ))}
      </div>

      <StoryModal
        open={modalOpen}
        story={selectedStory}
        onClose={() => {
          setSelectedStory(null);
          setModalOpen(false);
        }}
        onSave={() => {}}
        onDelete={() => {}}
      />
    </>
  );
};

export default ProductBacklog;
