const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
}) => {

  const variants = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white",

    secondary:
      "bg-slate-800 hover:bg-slate-700 text-white",

    success:
      "bg-emerald-500 hover:bg-emerald-600 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-4
        py-2
        rounded-lg
        transition
        font-medium
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  );
};

export default Button;

//* Button.jsx