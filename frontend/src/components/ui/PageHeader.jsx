const PageHeader = ({
  title,
  subtitle,
}) => {
  return (
    <div className="mb-8">

      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      {subtitle && (
        <p className="text-slate-400 mt-2">
          {subtitle}
        </p>
      )}

    </div>
  );
};

export default PageHeader;