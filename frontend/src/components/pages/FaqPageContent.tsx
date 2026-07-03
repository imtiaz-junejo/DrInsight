"use client";

import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { FAQ_CATEGORIES, FAQ_SECTIONS } from "@/components/pages/faq-data";
import "@/styles/faq-page.css";

function ChevronIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BreadcrumbChevron() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getItemSearchText(question: string, answer: ReactNode): string {
  const extractText = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join(" ");
    if (node && typeof node === "object" && "props" in node) {
      const element = node as ReactElement<{ children?: ReactNode }>;
      return extractText(element.props.children);
    }
    return "";
  };

  return `${question} ${extractText(answer)}`.toLowerCase();
}

export function FaqPageContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const trimmedSearch = searchQuery.trim();
  const isSearching = trimmedSearch.length > 0;

  const filterCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
    setOpenItems(new Set());
  }, []);

  const toggleAccordion = useCallback((sectionCategory: string, itemId: string) => {
    setOpenItems((prev) => {
      const sectionItemIds = FAQ_SECTIONS.find((s) => s.category === sectionCategory)?.items.map((i) => i.id) ?? [];
      const next = new Set(prev);

      sectionItemIds.forEach((id) => next.delete(id));

      if (!prev.has(itemId)) {
        next.add(itemId);
      }

      return next;
    });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();

    if (!q) {
      setActiveCategory("all");
      setOpenItems(new Set());
      return;
    }

    const matchingIds = new Set<string>();
    FAQ_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (getItemSearchText(item.question, item.answer).includes(q)) {
          matchingIds.add(item.id);
        }
      });
    });
    setOpenItems(matchingIds);
  }, []);

  const { visibleSections, showNoResults } = useMemo(() => {
    if (!isSearching) {
      const sections =
        activeCategory === "all"
          ? FAQ_SECTIONS
          : FAQ_SECTIONS.filter((section) => section.category === activeCategory);
      return { visibleSections: sections, showNoResults: false };
    }

    const sections = FAQ_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => getItemSearchText(item.question, item.answer).includes(trimmedSearch.toLowerCase())),
    })).filter((section) => section.items.length > 0);

    return {
      visibleSections: sections,
      showNoResults: sections.length === 0,
    };
  }, [activeCategory, isSearching, trimmedSearch]);

  return (
    <div className="faq-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-badge">❓ FREQUENTLY ASKED QUESTIONS</div>
          <h1>
            How Can We <span>Help You</span> Today?
          </h1>
          <p>
            Find quick answers to the most common questions about consultations, health tools, privacy, billing, and
            more.
          </p>
          <div className="faq-search-wrap">
            <div className="faq-search">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search your question… e.g. 'book appointment', 'billing'"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button type="button">
                <SearchIcon />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/">Home</Link>
          <BreadcrumbChevron />
          <span>FAQ</span>
        </div>
      </div>

      <div className="faq-layout">
        <aside className="faq-sidebar">
          <h3>Browse by Category</h3>
          <div className="category-nav">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-btn${!isSearching && activeCategory === cat.id ? " active" : ""}`}
                onClick={() => filterCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                {cat.label}
                <span className="cat-count">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-cta">
            <h4>Still Need Help?</h4>
            <p>Our support team is available Mon–Fri 8AM–8PM and Saturday 9AM–5PM.</p>
            <Link href="/contact">📞 Contact Support →</Link>
          </div>
        </aside>

        <div className="faq-content">
          {visibleSections.map((section) => (
            <div key={section.category} className="faq-section" data-category={section.category}>
              <div className="section-title">
                <div className="section-title-icon">{section.icon}</div>
                <h2>{section.title}</h2>
                <span className="faq-count-tag">{section.countLabel}</span>
              </div>
              <div className="accordion">
                {section.items.map((item) => {
                  const isOpen = openItems.has(item.id);
                  return (
                    <div key={item.id} className={`accordion-item${isOpen ? " open" : ""}`}>
                      <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleAccordion(section.category, item.id)}
                      >
                        <span className="accordion-q">{item.question}</span>
                        <span className="accordion-icon">
                          <ChevronIcon />
                        </span>
                      </button>
                      <div className="accordion-body">{item.answer}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {showNoResults && (
            <div className="no-results">
              <span>🔍</span>
              <p>
                No questions found matching &quot;<strong>{searchQuery}</strong>&quot;.
              </p>
              <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                Try a different keyword, or <Link href="/contact">contact our support team</Link>.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="still-questions-wrap">
        <div className="still-questions">
          <h2>Still Have Questions?</h2>
          <p>
            Our friendly support team is here to help. Reach out through any of the channels below and we&apos;ll get
            back to you quickly.
          </p>
          <div className="contact-options">
            <Link href="/contact" className="contact-option">
              <div className="opt-icon">💬</div>
              <h4>Live Chat</h4>
              <p>Mon–Fri, 8AM–8PM</p>
            </Link>
            <a href="mailto:support@medauthority.com" className="contact-option">
              <div className="opt-icon">✉️</div>
              <h4>Email Support</h4>
              <p>Reply within 24 hours</p>
            </a>
            <a href="tel:+18006334357" className="contact-option">
              <div className="opt-icon">📞</div>
              <h4>Call Us</h4>
              <p>+1 (800) MED-HELP</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
