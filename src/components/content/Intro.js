import '../../styles/content/Intro.css';

const Intro = () => {
  return (
    <section className="intro-section" data-section="intro">
      <div className="intro-content">
        <h1 className="intro-name">Hi, I'm Carl</h1>
        <p className="intro-description">
          I enjoy learning about cutting-edge advances in Artificial Intelligence and Machine Learning. At work, I specialize in
          implementing them on scalable & reliable platforms. When I'm not on my computer, I like to snowboard,
          play guitar/sax, and try out new restaurants around the bay (please let me know if you have recs 
          for a good Malaysian restaurant).
        </p>
        <div className="intro-buttons">
          <a href="/assets/docs/resume.pdf" className="intro-btn" target="_blank" rel="noopener noreferrer">Resume</a>
          <a href="https://github.com/carlchua" className="intro-btn" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:carllenard.chua@gmail.com" className="intro-btn">Email</a>
          <a href="https://www.linkedin.com/in/carl-chua/" className="intro-btn" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </section>
  );
};

export default Intro;