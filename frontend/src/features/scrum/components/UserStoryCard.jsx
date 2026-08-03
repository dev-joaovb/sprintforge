const priorityColors = {
  Baixa: "bg-green-500/20 text-green-400",
  Média: "bg-yellow-500/20 text-yellow-400",
  Alta: "bg-red-500/20 text-red-400",
};

const UserStoryCard = ({ story }) => {
  return (
    <div
      className="
        bg-slate-800
        border
        border-slate-700
        rounded-lg
        p-4
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-xl
        cursor-pointer
      "
    >
      {/* Título */}
      <h3 className="font-semibold text-white">
        {story.title}
      </h3>

      {/* Descrição */}
      <p className="text-sm text-slate-400 mt-2">
        {story.description}
      </p>

      {/* Rodapé */}
      <div className="flex justify-between items-center mt-4">

        <span
          className={`
            text-xs
            px-2
            py-1
            rounded-full
            ${priorityColors[story.priority]}
          `}
        >
          {story.priority}
        </span>

        <span
          className="
            bg-blue-600/20
            text-blue-400
            text-xs
            px-2
            py-1
            rounded-full
          "
        >
          {story.storyPoints} SP
        </span>

      </div>
    </div>
  );
};

export default UserStoryCard;