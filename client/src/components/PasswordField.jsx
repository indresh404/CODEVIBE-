// client/src/components/PasswordField.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ value, onChange, placeholder, disabled, hint }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <input
          type={showPassword ? "text" : "password"}
          value={value || ''}  // ✅ Ensure value is never undefined
          onChange={(e) => onChange && onChange(e.target.value)}  // ✅ Check if onChange exists
          placeholder={placeholder || "Enter password"}
          disabled={disabled || false}
          style={styles.input}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          style={styles.toggleButton}
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {hint && <div style={styles.hint}>{hint}</div>}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  toggleButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  hint: {
    marginTop: '5px',
    fontSize: '0.75rem',
    color: '#666',
  },
};

export default PasswordField;