function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt="students"
        />

        <div className="overlay">
          <h2>Karisma AI</h2>
          <p>
            Bridging the gap between your education and dream career.
          </p>
        </div>
      </div>

      <div className="auth-right">{children}</div>
    </div>
  );
}

export default AuthLayout;