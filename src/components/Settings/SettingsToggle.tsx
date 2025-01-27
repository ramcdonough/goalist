const SettingsToggle: React.FC<{ value: boolean; toggleMethod: () => void; label: string }> = ({ value, toggleMethod, label }) => {
  return (
    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
            checked={value}
            onChange={toggleMethod}
            className="checkbox checkbox-primary mr-2"
        />
        <span className="text-text-light dark:text-text-dark">
            {label}
        </span>
        </label>
    </div>
  );
};

export default SettingsToggle;