import '../../styles/content/Section.css';

const Projects = () => {
    return (
        <section className="section-container" data-section="projects">
            <h2 className="section-title">Projects</h2>
            <div className="section-content">
                <div className="section-item">
                    <h3 className="sub-title">
                        Dynamic Obstacles Avoidance in Coverage Path Planning
                        Via Deep Reinforcement Learning
                    </h3>
                    Final paper for CS285 (Deep Reinforcement Learning) Fall
                    2021 at UC Berkeley.
                    <div className="project-btn-group">
                        <a
                            href="/assets/docs/cs285_paper.pdf"
                            className="project-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Paper
                        </a>
                        <a
                            href="https://github.com/carlchua/cs285_rl_files"
                            className="project-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
                <div className="section-item">
                    <h3 className="sub-title">NBA Predictor</h3>A predictor for
                    NBA games &#x1F3C0;
                    <div className="project-btn-group">
                        <a
                            href="https://github.com/carlchua/nbapredictor"
                            className="project-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
