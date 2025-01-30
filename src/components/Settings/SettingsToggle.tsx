const SettingsToggle: React.FC<{ value: boolean; toggleMethod: () => void; label: string }> = ({ value, toggleMethod, label }) => {
  return (
    <div>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="toggle toggle-success" checked={value} onChange={toggleMethod} />
        <span className="text-text-light dark:text-text-dark font-semibold">
            {label}
        </span>
      </label>
    </div>
  );
};

export default SettingsToggle;