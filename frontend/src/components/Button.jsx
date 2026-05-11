function Button({ text, width }) {
  return (
    <button
      className="primary-btn"
      style={{ width: width || 'fit-content' }}
    >
      {text}
    </button>
  );
}

export default Button;