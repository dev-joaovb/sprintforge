import { useState } from "react";
import { useScrum } from "../../../context/ScrumContext";

const SprintPlanning = () => {
const { setSprint } = useScrum();

const [name, setName] = useState("");
const [goal, setGoal] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const handleCreateSprint = () => {
if (
!name.trim() ||
!goal.trim() ||
!startDate ||
!endDate
) {
return;
}

setSprint({
  id: Date.now(),
  name,
  goal,
  startDate,
  endDate,
  status: "planning",
  storyIds: [],
});

};

return (
<div className="space-y-6">

  <div>
    <h2 className="text-xl font-semibold">
      Planejamento da Sprint
    </h2>

    <p className="text-slate-400 mt-1 text-sm">
      Configure as informações iniciais da Sprint.
    </p>
  </div>

  <div className="space-y-5">

    <div>
      <label className="block mb-2">
        Nome da Sprint
      </label>

      <input
        type="text"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Ex.: Sprint 01"
        className="
          w-full
          bg-slate-800
          rounded-lg
          p-3
          outline-none
          border
          border-slate-700
          focus:border-blue-500
        "
      />
    </div>

    <div>
      <label className="block mb-2">
        Objetivo da Sprint
      </label>

      <textarea
        rows="3"
        value={goal}
        onChange={(e) =>
          setGoal(e.target.value)
        }
        placeholder="Qual é o objetivo principal desta Sprint?"
        className="
          w-full
          bg-slate-800
          rounded-lg
          p-3
          outline-none
          border
          border-slate-700
          focus:border-blue-500
        "
      />
    </div>

    <div className="grid grid-cols-2 gap-4">

      <div>
        <label className="block mb-2">
          Data de início
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          className="
            w-full
            bg-slate-800
            rounded-lg
            p-3
            outline-none
            border
            border-slate-700
            focus:border-blue-500
          "
        />
      </div>

      <div>
        <label className="block mb-2">
          Data de término
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
          className="
            w-full
            bg-slate-800
            rounded-lg
            p-3
            outline-none
            border
            border-slate-700
            focus:border-blue-500
          "
        />
      </div>

    </div>

    <div className="flex justify-end">

      <button
        onClick={handleCreateSprint}
        className="
          bg-blue-600
          hover:bg-blue-700
          transition
          px-5
          py-2
          rounded-lg
          font-medium
        "
      >
        Criar Sprint
      </button>

    </div>

  </div>
</div>

);
};

export default SprintPlanning;