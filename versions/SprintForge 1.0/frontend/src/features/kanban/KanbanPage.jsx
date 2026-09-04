import PageHeader from "../../components/ui/PageHeader";
import Board from "./components/Board";

const KanbanPage = () => {
  return (
    <>
      <PageHeader
        title="Kanban"
        subtitle="Gerencie o fluxo de trabalho da sua equipe."
      />

      <Board />
    </>
  );
};

export default KanbanPage;