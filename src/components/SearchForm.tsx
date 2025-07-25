import React from "react";

interface SearchFormProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ value, onChange }) => (
  <div style={{ margin: "16px 0" }}>
    <input
      type="text"
      placeholder="Search posts..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: 8 }}
    />
  </div>
);

export default SearchForm;
