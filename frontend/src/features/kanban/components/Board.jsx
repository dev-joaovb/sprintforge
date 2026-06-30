import Column from "./Column";

const columns = [
  {
    id: "backlog",
    title: "Backlog",
  },
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in-progress",
    title: "In Progress",
  },
  {
    id: "review",
    title: "Review",
  },
  {
    id: "done",
    title: "Done",
  },
];

const Board = () => {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-5
        gap-6
      "
    >
      {columns.map((column) => (
        <Column
          key={column.id}
          title={column.title}
        />
      ))}
    </div>
  );
};

export default Board;