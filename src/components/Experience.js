import React from 'react';
import './Section.css';

const Experience = () => {
  return (
    <section className="section-container" data-section="experience">
      <h2 className="section-title">Experience</h2>
      <div className="section-content">
        <div className="section-item">
          <h3 className="job-title">Software Engineer</h3>
          <a href="https://www.blackrock.com/us/individual" className="company" target="_blank" rel="noopener noreferrer">BlackRock</a>
          <p className="duration">August 2022 - Present</p>
          <ul className="description">
            <li>Implemented Retrieval-Augmented Generation (RAG) to fine-tune embedding models, processed and cleaned data in AzureML pipelines to enhance synthetic data generation for training models, speeding up training by 15%</li>
            <li>Built out agentic framework, setting up gRPC-based servers to integrate multiple agents into a single Copilot, with over 98% query routing accuracy</li>
            <li>Implemented dynamic suggested prompts, improving user interaction and engagement.</li>
          </ul>
        </div>
        
        <div className="section-item">
          <h3 className="job-title">ML Engineer</h3>
          <a href="https://rimble.io/" className="company" target="_blank" rel="noopener noreferrer">Rimble Esports Analytics</a>
          <p className="duration">Summer 2021</p>
          <ul className="description">
            <li>Created custom ML models to predict live-time and pregame statistics for esports</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Experience;