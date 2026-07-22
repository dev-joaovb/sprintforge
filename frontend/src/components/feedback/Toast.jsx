// Componente para exibir notificações toast

const Toast = ({
  message,
  type = "success",
}) => {
  const colors = {
    success:
      "bg-green-600 border-green-500",

    error:
      "bg-red-600 border-red-500",

    warning:
      "bg-yellow-500 border-yellow-400 text-slate-900",

    info:
      "bg-blue-600 border-blue-500",
  };

  return (
    <div
      className={`
        min-w-[320px]
        px-5
        py-4
        rounded-lg
        border
        shadow-xl
        text-white
        font-medium
        animate-in
        fade-in
        slide-in-from-right-5
        duration-300
        ${colors[type]}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;