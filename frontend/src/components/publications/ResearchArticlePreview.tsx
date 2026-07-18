"use client";

import Link from "next/link";
import "@/styles/research-article-preview.css";
import {
  fmtPubDate,
  parseAbbreviations,
  parseFigure,
  parseKeyFindings,
  parseLines,
  parseTable,
  publicationTypeBadgeLabel,
  type ResearchArticlePreviewData,
} from "@/components/publications/publication-preview-utils";

function RapvBox({
  cls,
  title,
  children,
}: {
  cls: string;
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className={`rapv-box ${cls}`}>
      <h6>{title}</h6>
      {children}
    </div>
  );
}

function RapvSection({
  num,
  cls = "",
  title,
  children,
}: {
  num: number;
  cls?: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className={`rapv-sec${cls ? ` ${cls}` : ""}`}>
      <h4>
        <span className={`rapv-sn${cls ? ` ${cls}` : ""}`}>{num}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function RapvParas({ text }: { text?: string | null }) {
  const lines = parseLines(text);
  if (!lines.length) return null;
  return (
    <>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </>
  );
}

function RapvTable({ value }: { value?: string | null }) {
  const table = parseTable(value);
  if (!table) return null;
  return (
    <div className="rapv-tablewrap">
      <table className="rapv-table">
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RapvFigure({ value }: { value?: string | null }) {
  const bars = parseFigure(value);
  if (!bars.length) return null;
  let max = 1;
  bars.forEach((bar) => {
    const n = Math.abs(parseFloat(bar.val.replace(/[^0-9.-]/g, ""))) || 0;
    if (n > max) max = n;
  });
  return (
    <div className="rapv-fig">
      <div className="rapv-fig-plot">
        {bars.map((bar) => {
          const n = Math.abs(parseFloat(bar.val.replace(/[^0-9.-]/g, ""))) || 0;
          const height = Math.max(6, Math.round((n / max) * 90));
          return (
            <div key={bar.label} className="rapv-fig-bar">
              <div className="bar" style={{ height: `${height}%` }}>
                <span className="v">{bar.val}</span>
              </div>
              <div className="lbl">{bar.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RapvMetaItem({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="rapv-meta-item">
      <b>{label}</b>
      {value}
    </div>
  );
}

export function ResearchArticlePreview({
  data,
  showEditorialStats = true,
  onDownloadAttachment,
}: {
  data: ResearchArticlePreviewData;
  showEditorialStats?: boolean;
  onDownloadAttachment?: (url: string) => void;
}) {
  const authors = data.authors?.filter((author) => author.name?.trim()) ?? [];
  const editorial = data.editorial ?? {};
  const references = data.references?.filter((ref) => ref.citation?.trim()) ?? [];
  const keywords = data.keywords?.filter(Boolean) ?? [];
  const objectives = parseLines(data.objectives);
  const implications = parseLines(data.practiceImplications);
  const limitations = parseLines(data.limitations);
  const contributions = parseLines(data.authorContributions);
  const keyFindingCards = parseKeyFindings(data.keyFindings);
  const abbrevRows = parseAbbreviations(data.abbreviations);
  const year = (data.publicationDate ?? "").slice(0, 4) || new Date().getFullYear().toString();
  const authorNames = authors.map((author) => author.name).join(", ");

  const apaCitation = `${authorNames} (${year}). ${data.title ?? "Untitled research"}. DrInsight Research & Publications${data.articleId ? `, ${data.articleId}` : ""}.${data.doi ? ` https://doi.org/${data.doi}` : ""}`;
  const vancouverCitation = `${authorNames}. ${data.title ?? "Untitled research"}. DrInsight Res Publ. ${year}${data.articleId ? `;${data.articleId}` : ""}.${data.doi ? ` doi:${data.doi}` : ""}`;

  let sectionNum = 0;
  const nextSection = () => {
    sectionNum += 1;
    return sectionNum;
  };

  const abstractSection =
    data.abstractBackground?.trim() ||
    data.abstractMethods?.trim() ||
    data.abstractResults?.trim() ||
    data.abstractConclusions?.trim() ||
    keywords.length ? (
      <div className="rapv-abs">
        {data.abstractBackground?.trim() ? (
          <div className="rapv-abs-seg">
            <h5>Background</h5>
            <p>{data.abstractBackground}</p>
          </div>
        ) : null}
        {data.abstractMethods?.trim() ? (
          <div className="rapv-abs-seg">
            <h5>Methods</h5>
            <p>{data.abstractMethods}</p>
          </div>
        ) : null}
        {data.abstractResults?.trim() ? (
          <div className="rapv-abs-seg">
            <h5>Results</h5>
            <p>{data.abstractResults}</p>
          </div>
        ) : null}
        {data.abstractConclusions?.trim() ? (
          <div className="rapv-abs-seg">
            <h5>Conclusions</h5>
            <p>{data.abstractConclusions}</p>
          </div>
        ) : null}
        {keywords.length ? (
          <div className="rapv-kw">
            <span className="lbl">Keywords:</span>
            {keywords.map((keyword) => (
              <span key={keyword} className="kw">
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    ) : null;

  const introInner = (
    <>
      <RapvParas text={data.introduction} />
      {objectives.length ? (
        <RapvBox cls="b" title="🎯 Objectives">
          <ul>
            {objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </RapvBox>
      ) : null}
    </>
  );

  const methodsInner = (
    <>
      <RapvParas text={data.methodsContent} />
      <RapvTable value={data.methodsTable} />
    </>
  );

  const resultsInner = (
    <>
      <RapvParas text={data.results} />
      <RapvFigure value={data.figureData} />
      {data.figureCaption?.trim() ? (
        <div className="rapv-figcap">
          <strong>Figure 1.</strong> {data.figureCaption}
        </div>
      ) : null}
      {data.resultSummary?.trim() ? (
        <RapvBox cls="g" title="📊 Result Summary">
          <p>{data.resultSummary}</p>
        </RapvBox>
      ) : null}
    </>
  );

  const discussionInner = (
    <>
      <RapvParas text={data.discussion} />
      {implications.length ? (
        <RapvBox cls="p" title="🧭 Practice Implications">
          <ul>
            {implications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </RapvBox>
      ) : null}
    </>
  );

  const limitationsInner = limitations.length ? (
    <RapvBox cls="a" title="⚠️ Limitations of This Review">
      <ul>
        {limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </RapvBox>
  ) : null;

  const keyFindingsInner = keyFindingCards.length ? (
    <div className="rapv-kf">
      {keyFindingCards.map((card, index) => (
        <div key={`${card.title}-${index}`} className="rapv-kf-card">
          {card.icon ? <span className="ico">{card.icon}</span> : null}
          <b>{card.title}</b>
          {card.description ? <span>{card.description}</span> : null}
        </div>
      ))}
    </div>
  ) : null;

  const ethicsDataInner = (
    <>
      {data.ethicsStatement?.trim() ? (
        <RapvBox cls="b" title="🧾 Ethics Approval / IRB Statement">
          <p>{data.ethicsStatement}</p>
        </RapvBox>
      ) : null}
      {data.clinicalTrialRegistration?.trim() ? (
        <RapvBox cls="p" title="📋 Clinical Trial Registration">
          <p>{data.clinicalTrialRegistration}</p>
        </RapvBox>
      ) : null}
      {data.dataAvailabilityStatement?.trim() ? (
        <RapvBox cls="t" title="📂 Data Availability Statement">
          <p>{data.dataAvailabilityStatement}</p>
        </RapvBox>
      ) : null}
      {abbrevRows.length ? (
        <RapvBox cls="g" title="🔤 Abbreviations">
          <ul>
            {abbrevRows.map((row) => (
              <li key={row.abbr}>
                <strong>{row.abbr}</strong> — {row.full}
              </li>
            ))}
          </ul>
        </RapvBox>
      ) : null}
    </>
  );

  const disclosuresInner = (
    <>
      {data.fundingSource?.trim() ? (
        <RapvBox cls="b" title="💷 Funding">
          <p>{data.fundingSource}</p>
        </RapvBox>
      ) : null}
      {data.conflictsOfInterest?.trim() ? (
        <RapvBox cls="a" title="⚖️ Conflicts of Interest">
          <p>{data.conflictsOfInterest}</p>
        </RapvBox>
      ) : null}
      {data.acknowledgments?.trim() ? (
        <RapvBox cls="g" title="🙏 Acknowledgments">
          <p>{data.acknowledgments}</p>
        </RapvBox>
      ) : null}
    </>
  );

  const reviewInner = (
    <>
      <p>
        This article was authored by qualified clinicians and independently reviewed by a licensed
        physician before publication, in line with DrInsight editorial standards.
      </p>
      <RapvBox cls="t" title="🔍 Review Record">
        <ul>
          {editorial.reviewingPhysician ? (
            <li>
              <strong>Reviewing physician:</strong> {editorial.reviewingPhysician}
            </li>
          ) : null}
          {editorial.peerReviewOutcome ? (
            <li>
              <strong>Outcome:</strong> {editorial.peerReviewOutcome}
            </li>
          ) : null}
          {editorial.nextScheduledReview ? (
            <li>
              <strong>Next review:</strong> {fmtPubDate(editorial.nextScheduledReview)}
            </li>
          ) : null}
        </ul>
      </RapvBox>
      <RapvBox cls="b" title="🔗 Related Policies">
        <p>
          See our{" "}
          <Link href="/editorial-policy" style={{ color: "var(--blue)", fontWeight: 600 }}>
            Editorial Policy
          </Link>
          ,{" "}
          <Link href="/medical-review-process" style={{ color: "var(--blue)", fontWeight: 600 }}>
            Medical Review Process
          </Link>{" "}
          and{" "}
          <Link href="/author-guidelines" style={{ color: "var(--blue)", fontWeight: 600 }}>
            Author Guidelines
          </Link>
          .
        </p>
      </RapvBox>
    </>
  );

  const citeInner = (
    <>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gray-500)", marginBottom: 3 }}>
        APA
      </div>
      <div className="rapv-cite">
        {authorNames} ({year}). <em>{data.title ?? "Untitled research"}</em>. DrInsight Research
        &amp; Publications{data.articleId ? `, ${data.articleId}` : ""}.
        {data.doi ? ` https://doi.org/${data.doi}` : ""}
      </div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gray-500)", margin: "8px 0 3px" }}>
        Vancouver
      </div>
      <div className="rapv-cite">{vancouverCitation}</div>
      <RapvBox cls="a" title="⚠️ Important">
        <p>
          This article is educational and does not replace professional medical advice. Cite it as a
          health-information source, not as primary clinical research.
        </p>
      </RapvBox>
    </>
  );

  const referencesInner = references.length ? (
    <>
      <ol className="rapv-refs">
        {references.map((ref, index) => (
          <li key={`${ref.citation}-${index}`}>
            {ref.citation}
            {ref.doi?.trim() ? <span className="doi"> doi:{ref.doi}</span> : null}
          </li>
        ))}
      </ol>
      <RapvBox cls="b" title="📚 Full reference list">
        <p>
          All {references.length} reference{references.length === 1 ? "" : "s"} appear in full on the
          published article and downloadable PDF.
        </p>
      </RapvBox>
    </>
  ) : null;

  return (
    <div className="rapv">
      {data.coverImageUrl ? (
        <img src={data.coverImageUrl} alt="" className="rapv-cover" loading="lazy" />
      ) : null}

      <div className="rapv-badges">
        <span className="rapv-badge rab-type">{publicationTypeBadgeLabel(data.publicationType)}</span>
        {data.medicalSpecialty?.trim() ? (
          <span className="rapv-badge rab-area">{data.medicalSpecialty}</span>
        ) : null}
        {editorial.openAccess ? <span className="rapv-badge rab-open">🔓 Open Access</span> : null}
        {(editorial.physicianReviewed || editorial.reviewingPhysician) ? (
          <span className="rapv-badge rab-peer">✔ Peer-Reviewed</span>
        ) : null}
        {data.status ? <span className="rapv-badge rab-status">{data.status}</span> : null}
      </div>

      <h1>{data.title?.trim() || "Untitled research"}</h1>
      {data.subtitle?.trim() ? <p className="rapv-subtitle">{data.subtitle}</p> : null}

      <div className="rapv-authors">
        {authors.map((author, index) => (
          <span key={`${author.name}-${index}`}>
            {index > 0 ? ", " : ""}
            {author.name}
            <sup>{index + 1}</sup>
          </span>
        ))}
        {editorial.reviewingPhysician?.trim() ? (
          <>
            {" "}
            · Reviewed by <em>{editorial.reviewingPhysician}</em>
          </>
        ) : null}
      </div>

      {authors.some((author) => author.affiliation?.trim()) ? (
        <div className="rapv-affil">
          {authors.map((author, index) =>
            author.affiliation?.trim() ? (
              <span key={`${author.name}-affil`}>
                {index > 0 ? " " : ""}
                <sup>{index + 1}</sup> {author.affiliation}
              </span>
            ) : null,
          )}
        </div>
      ) : null}

      <div className="rapv-meta">
        <RapvMetaItem label="Published" value={fmtPubDate(data.publicationDate)} />
        <RapvMetaItem label="Last Reviewed" value={fmtPubDate(editorial.lastReviewedDate)} />
        <RapvMetaItem label="Article ID" value={data.articleId} />
        <RapvMetaItem label="DOI" value={data.doi} />
        {data.readTimeMinutes ? (
          <RapvMetaItem label="Read Time" value={`⏱️ ${data.readTimeMinutes} min`} />
        ) : null}
        <RapvMetaItem label="License" value={data.license} />
      </div>

      {showEditorialStats ? (
        <div className="rapv-alt">
          {references.length ? (
            <div>
              <div className="n">{references.length}</div>
              <div className="l">References</div>
            </div>
          ) : null}
          {editorial.downloadCount != null ? (
            <div>
              <div className="n">{editorial.downloadCount}</div>
              <div className="l">Downloads</div>
            </div>
          ) : null}
          {editorial.citationCount != null ? (
            <div>
              <div className="n">{editorial.citationCount}</div>
              <div className="l">Citations</div>
            </div>
          ) : null}
          {editorial.evidenceGrade ? (
            <div>
              <div className="n">{editorial.evidenceGrade}</div>
              <div className="l">Evidence Grade</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <RapvSection num={nextSection()} title="Abstract">
        {abstractSection}
      </RapvSection>
      <RapvSection num={nextSection()} cls="t" title="Introduction">
        {introInner}
      </RapvSection>
      <RapvSection num={nextSection()} title="Methods">
        {methodsInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="g" title="Results">
        {resultsInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="p" title="Discussion">
        {discussionInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="a" title="Limitations">
        {limitationsInner}
      </RapvSection>
      <RapvSection num={nextSection()} title="Conclusion">
        <RapvParas text={data.conclusion} />
      </RapvSection>
      <RapvSection num={nextSection()} cls="g" title="Key Findings at a Glance">
        {keyFindingsInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="t" title="Author Contributions">
        {contributions.length
          ? contributions.map((line) => <p key={line}>{line}</p>)
          : null}
      </RapvSection>
      <RapvSection num={nextSection()} title="Ethics, Registration & Data Availability">
        {ethicsDataInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="r" title="Funding, Conflicts & Acknowledgments">
        {disclosuresInner}
      </RapvSection>
      <RapvSection num={nextSection()} cls="p" title="Peer Review & Provenance">
        {reviewInner}
      </RapvSection>
      <RapvSection num={nextSection()} title="How to Cite This Article">
        {citeInner}
      </RapvSection>
      <RapvSection
        num={nextSection()}
        cls="r"
        title={
          <>
            References
            {references.length ? (
              <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--gray-400)" }}>
                {" "}
                ({references.length} total)
              </span>
            ) : null}
          </>
        }
      >
        {referencesInner}
      </RapvSection>

      {data.attachments?.length ? (
        <div className="rapv-attach">
          {data.attachments.map((attachment) =>
            onDownloadAttachment ? (
              <button
                key={attachment.fileUrl}
                type="button"
                onClick={() => onDownloadAttachment(attachment.fileUrl)}
              >
                📎 {attachment.fileName}
              </button>
            ) : (
              <a key={attachment.fileUrl} href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                📎 {attachment.fileName}
              </a>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
