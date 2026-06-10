const Card = ({ children }) => {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      {children}
    </div>
  );
};

export default Card;