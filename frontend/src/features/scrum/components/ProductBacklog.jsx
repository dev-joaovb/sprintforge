import { useScrum } from "../../../context/ScrumContext";
import { useToast } from "../../../context/ToastContext";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import { useState } from "react";

import StoryModal from "./StoryModal";
import UserStoryCard from "./UserStoryCard";

const ProductBacklog = () => {
  const { stories, setStories } = useScrum();

  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedStory, setSelectedStory] = useState(null);
  const [deleteStory, setDeleteStory] = useState(null);

  const handleNewStory = () => {
    setSelectedStory(null);
    setModalOpen(true);
  };

  const handleEditStory = (story) => {
    setSelectedStory(story);
    setModalOpen(true);
  };

  const handleSaveStory = (storyData) => {
    if (storyData.id) {
      // Editar
      setStories((previousStories) =>
        previousStories.map((story) =>
          story.id === storyData.id
            ? {
                ...story,
                ...storyData,
              }
            : story,
        ),
      );

      showToast("User Story atualizada com sucesso.", "info");
    } else {
      // Criar
      setStories((previousStories) => [
        ...previousStories,
        {
          id: Date.now(),
          status: "Backlog",
          ...storyData,
        },
      ]);

      showToast("User Story criada com sucesso.", "success");
    }

    setSelectedStory(null);
    setModalOpen(false);
  };

  const handleDeleteStory = (story) => {
    setDeleteStory(story);
  };

  const confirmDeleteStory = () => {
    if (!deleteStory) return;

    setStories((previousStories) =>
      previousStories.filter((story) => story.id !== deleteStory.id),
    );

    showToast("User Story excluída com sucesso.", "success");

    setDeleteStory(null);
    setSelectedStory(null);
    setModalOpen(false);
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

      {/* Story Modal */}
      <StoryModal
        open={modalOpen}
        story={selectedStory}
        onClose={() => {
          setSelectedStory(null);
          setModalOpen(false);
        }}
        onSave={handleSaveStory}
        onDelete={handleDeleteStory}
      />

      {/* Confirm Delete Dialog */}
      
      <ConfirmDialog
        open={!!deleteStory}
        title="Excluir User Story"
        message={`Deseja realmente excluir a User Story "${deleteStory?.title}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteStory}
        onCancel={() => setDeleteStory(null)}
      />
    </>
  );
};

export default ProductBacklog;
