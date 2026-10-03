import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { CONTENT } from '../../constants/content';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './FAQSection.css';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [sectionRef, isRevealed] = useScrollReveal();
  const { faq } = CONTENT;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="section section-muted faq-section" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className={`faq-header text-center ${isRevealed ? 'is-revealed' : ''}`}>
          <div className="badge-pill mx-auto mb-3">
            <HelpCircle size={14} className="mr-1 inline text-primary" />
            <span>{faq.badge}</span>
          </div>
          <h2 className="section-title">{faq.heading}</h2>
          <p className="section-subtitle mx-auto">{faq.description}</p>
        </div>

        {/* FAQ Accordion List */}
        <div className={`faq-accordion-container ${isRevealed ? 'is-revealed' : ''}`}>
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`faq-accordion-item ${isOpen ? 'is-open' : ''} delay-${(index + 1) * 100}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="faq-question-text">{item.question}</span>
                  <span className="faq-chevron-wrapper">
                    <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`faq-answer-collapse ${isOpen ? 'is-expanded' : ''}`}
                >
                  <div className="faq-answer-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
