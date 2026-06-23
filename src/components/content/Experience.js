import '../../styles/content/Section.css';

const Experience = () => {
    return (
        <section className="section-container" data-section="experience">
            <h2 className="section-title">Experience</h2>
            <div className="section-content">
                <div className="section-item">
                    <h3 className="sub-title">Senior Software Engineer</h3>
                    <a
                        href="https://labelbox.com/"
                        className="company"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Labelbox
                    </a>
                    <p className="duration">November 2025 - Present</p>
                    <ul className="description">
                        <li>
                            Developed a full-stack <a href="https://labelbox.com/products/agent-studio/">RL evaluation platform</a> for agent evaluation and benchmarking.
                        </li>
                        <li>
                            Built a cross-platform video collection app and GCP processing pipeline for ego-centric robotics RL training videos.
                        </li>
                    </ul>
                </div>
                <div className="section-item">
                    <h3 className="sub-title">Software Engineer</h3>
                    <a
                        href="https://www.blackrock.com/us/individual"
                        className="company"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        BlackRock
                    </a>
                    <p className="duration">August 2022 - November 2025</p>
                    <ul className="description">
                        <li>
                            Built out agentic framework, setting up gRPC-based
                            servers to integrate multiple agents into a single
                            Copilot, with over 98% query routing accuracy
                        </li>
                        <li>
                            Implemented RAG-based plugins.
                            Processed and cleaned data to enhance synthetic data generation
                            for fine-tuning embedding models, speeding up training by 15%.
                        </li>
                        <li>
                            Added internal agent observability by logging Langchain
                            execution traces to Grafana, with PII filtering.
                        </li>
                    </ul>
                </div>

                <div className="section-item">
                    <h3 className="sub-title">ML Engineer Intern</h3>
                    <a
                        href="https://rimble.io/"
                        className="company"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Rimble Esports Analytics
                    </a>
                    <p className="duration">Summer 2021</p>
                    <ul className="description">
                        <li>
                            Created custom ML models to predict live-time and
                            pregame statistics for esports
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Experience;
