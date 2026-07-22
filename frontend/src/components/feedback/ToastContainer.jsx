// Componente para exibir o contêiner de notificações toast

import Toast from "./Toast";

const ToastContainer = ({ toasts }) => {
  return (
    <div
      className="
        fixed
        top-5
        right-5
        z-[9999]
        flex
        flex-col
        gap-3
      "
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </div>
  );
};

export default ToastContainer;