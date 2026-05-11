import Button from './Button';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-left">
        <span className="badge">AI-POWERED CAREER GUIDANCE</span>

        <h1>
          Navigate Your Career with
          <span> Artificial Intelligence</span>
        </h1>

        <p>
          Empowering students and professionals worldwide to bridge
          the gap between education and the professional world.
        </p>

        <Button text="Get Started Free" />
      </div>

      <div className="hero-right">
        <div className="dashboard-card">
          <div className="stats">
            <div className="stat-box">
              <h2>94%</h2>
              <p>Skill Match</p>
            </div>

            <div className="stat-box">
              <h2>12</h2>
              <p>Career Paths</p>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="bar active"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;