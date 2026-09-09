<!-- Preliminary pages, in the order the department template requires:
     Cover, Title, Declaration, Certification, Dedication, Acknowledgements,
     Abstract, Table of Contents, List of Figures, List of Tables,
     List of Abbreviations, List of Appendices.

     Raw LaTeX is written in explicit ```{=latex} blocks. A bare \begin{...}
     inside a fenced div is silently dropped by Pandoc, which cost one build
     cycle already.

     The Table of Contents, List of Figures and List of Tables are emitted
     HERE rather than via --toc/--lof/--lot, because Pandoc pins those
     immediately after the title block, which put them ahead of the
     declaration and certification pages. -->

```{=latex}
\thispagestyle{empty}
\begin{center}

{\Large\bfseries DAR ES SALAAM INSTITUTE OF TECHNOLOGY}

\vspace{6mm}
{\large DEPARTMENT OF COMPUTER STUDIES}

\vspace{4mm}
{\large NTA LEVEL 8}

\vspace{16mm}
% O3: replace with the institute logo once the image file is supplied.
\framebox[45mm][c]{\rule{0pt}{28mm}\textsf{[INSTITUTE LOGO]}}

\vspace{16mm}
{\Large\bfseries BLOCKCHAIN-BASED NGO DONATION MANAGEMENT SYSTEM}

\vspace{16mm}
\begin{tabular}{ll}
\textbf{MODULE NAME:} & PROJECT REALIZATION \\[2mm]
\textbf{MODULE CODE:} & COU 08204 \\[2mm]
\textbf{COURSE:} & BENG22COE \\[2mm]
\textbf{CANDIDATE NAME:} & NASIBU Y. ISAKA \\[2mm]
\textbf{REGISTRATION NUMBER:} & 2106307225519 \\[2mm]
\textbf{SUPERVISOR'S NAME:} & DR GUSTAPH SANGA \\
\end{tabular}

\vfill
{\large [PENDING: SUBMISSION DATE]}

\end{center}
\clearpage

\thispagestyle{empty}
\begin{center}

{\Large\bfseries BLOCKCHAIN-BASED NGO DONATION MANAGEMENT SYSTEM}

\vspace{4mm}
{\large\itshape Changia}

\vspace{20mm}
{\large NASIBU Y. ISAKA}

\vspace{3mm}
{\large 2106307225519}

\vspace{25mm}
\begin{minipage}{0.8\textwidth}
\centering
A project report submitted in partial fulfilment of the requirements for the
award of NTA Level 8 in the Department of Computer Studies of the Dar es Salaam
Institute of Technology.
\end{minipage}

\vfill
{\large DAR ES SALAAM INSTITUTE OF TECHNOLOGY}

\vspace{2mm}
{\large [PENDING: SUBMISSION DATE]}

\end{center}
\clearpage

% Preliminary pages take roman numerals. \frontmatter is book-class only and
% this report uses the report class, so numbering is switched explicitly.
\pagenumbering{roman}
```

```{=openxml}
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>DAR ES SALAAM INSTITUTE OF TECHNOLOGY</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240"/></w:pPr><w:r><w:rPr><w:sz w:val="26"/></w:rPr><w:t>DEPARTMENT OF COMPUTER STUDIES</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="26"/></w:rPr><w:t>NTA LEVEL 8</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="480" w:after="480"/></w:pPr><w:r><w:rPr><w:i/></w:rPr><w:t>[INSTITUTE LOGO]</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>BLOCKCHAIN-BASED NGO DONATION MANAGEMENT SYSTEM</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:before="480"/></w:pPr></w:p>
<w:tbl>
  <w:tblPr><w:tblW w:type="auto" w:w="0"/><w:tblBorders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders><w:tblCellMar><w:left w:type="dxa" w:w="0"/></w:tblCellMar></w:tblPr>
  <w:tblGrid><w:gridCol w:w="3200"/><w:gridCol w:w="5600"/></w:tblGrid>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>MODULE NAME:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>PROJECT REALIZATION</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>MODULE CODE:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>COU 08204</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>COURSE:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>BENG22COE</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>CANDIDATE NAME:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>NASIBU Y. ISAKA</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>REGISTRATION NUMBER:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>2106307225519</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:tcPr/><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>SUPERVISOR'S NAME:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr/><w:p><w:r><w:t>DR GUSTAPH SANGA</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="960"/></w:pPr><w:r><w:t>[PENDING: SUBMISSION DATE]</w:t></w:r></w:p>
<w:p><w:pPr><w:pageBreakBefore/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>BLOCKCHAIN-BASED NGO DONATION MANAGEMENT SYSTEM</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/></w:rPr><w:t>Changia</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="480"/></w:pPr><w:r><w:t>NASIBU Y. ISAKA</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>2106307225519</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="720"/></w:pPr><w:r><w:t>A project report submitted in partial fulfilment of the requirements for the award of NTA Level 8 in the Department of Computer Studies of the Dar es Salaam Institute of Technology.</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="960"/></w:pPr><w:r><w:t>DAR ES SALAAM INSTITUTE OF TECHNOLOGY</w:t></w:r></w:p>
<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>[PENDING: SUBMISSION DATE]</w:t></w:r></w:p>
<w:p><w:r><w:t>%%CHANGIA_SECTION_BREAK_COVER%%</w:t></w:r></w:p>
```

<!-- The ```{=openxml} block above reproduces the LaTeX cover and title pages
     for the DOCX build (Pandoc drops {=latex} raw blocks entirely for docx
     output, so without this the DOCX had no cover page at all). The final
     paragraph is a marker: build/postprocess_docx.py finds it by its exact
     text and turns it into the section break after which the cover and
     title pages carry no page number, matching the PDF's \thispagestyle{empty}. -->

# Declaration {-}

I, **Nasibu Y. Isaka**, registration number **2106307225519**, declare that this
report is my own original work and that it has not been presented, and will not
be presented, to any other institution for a similar or any other award.

```{=latex}
\vspace{20mm}
Signature: \rule{55mm}{0.4pt} \hfill Date: \rule{40mm}{0.4pt}
\clearpage
```

# Certification {-}

The undersigned certifies that he has read and hereby recommends for acceptance
by the Dar es Salaam Institute of Technology a project report titled
**Blockchain-Based NGO Donation Management System**, submitted in partial
fulfilment of the requirements for the award of NTA Level 8 in the Department of
Computer Studies.

```{=latex}
\vspace{20mm}
\noindent\textbf{Dr Gustaph Sanga}\\
\textit{Supervisor}

\vspace{12mm}
\noindent Signature: \rule{55mm}{0.4pt} \hfill Date: \rule{40mm}{0.4pt}
\clearpage
```

# Dedication {-}

This work is dedicated to my family, mentors and all people working to make charitable support more transparent and accountable.

```{=latex}
\clearpage
```

# Acknowledgements {-}

I sincerely thank my supervisor, Dr Gustaph Sanga, for guidance throughout this project. I also appreciate the Department of Computer Studies, the people who contributed early questionnaire feedback, and my family and colleagues for their support during design, implementation and testing.

```{=latex}
\clearpage
```

# Abstract {-}

NGO donation systems need to make contribution and fund-release records more visible without making ordinary donors adopt cryptocurrency. This project designed and implemented ChangiaTanzania, a blockchain-based NGO donation management system that combines familiar web and local-payment workflows with privacy-preserving Ethereum proof recording. An iterative Agile approach was used, informed by retained questionnaire themes, document review, source inspection and technical testing. The system implements donor, fundraiser and administrator roles; campaign management; beneficiary verification; payment-session handling; idempotent payment callback finalisation; receipts; donation history; notifications; dashboards; audit logs; exports; controlled disbursements; public receipt verification; and an integrated risk-review module. PostgreSQL is the operational source of truth. After a verified payment or completed disbursement, the backend records a deterministic proof hash through a smart contract, while public verification omits donor identity and payment references. The implementation demonstrates that blockchain can serve as a narrow tamper-evident proof layer alongside conventional application controls rather than replacing payment or operational systems. Tests cover key authentication, payment, proof, campaign-review, beneficiary, disbursement-control and risk-analysis scenarios. The report records two material limitations: individual response-level questionnaire rows were unavailable, so only the aggregated 26-respondent summary (Appendix A) is used, as directional rather than inferential evidence; and production payment credentials, infrastructure hardening, load testing and independent user acceptance testing remain required. The risk-review module is feature-flagged off until its migration is applied and it is deliberately enabled; the on-chain escrow contract remains future work.

```{=latex}
\clearpage

\tableofcontents
\clearpage

% \addcontentsline so the figure and table lists appear in the contents
% themselves. \listoffigures does not add itself.
\addcontentsline{toc}{chapter}{List of Figures}
\listoffigures
\clearpage

\addcontentsline{toc}{chapter}{List of Tables}
\listoftables
\clearpage
```

```{=openxml}
<w:p><w:pPr><w:pStyle w:val="TOCHeading"/></w:pPr><w:r><w:t>Table of Contents</w:t></w:r></w:p>
<w:p>
  <w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>
  <w:r><w:instrText xml:space="preserve"> TOC \o "1-3" \h \z \u </w:instrText></w:r>
  <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  <w:r><w:t>Right-click here and choose "Update Field" (or press Ctrl+A then F9) to build the Table of Contents.</w:t></w:r>
  <w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
<w:p><w:pPr><w:pageBreakBefore/><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>List of Figures</w:t></w:r></w:p>
<w:p>
  <w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>
  <w:r><w:instrText xml:space="preserve"> TOC \h \z \t "ImageCaption,1" </w:instrText></w:r>
  <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  <w:r><w:t>Right-click here and choose "Update Field" to build the List of Figures.</w:t></w:r>
  <w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
<w:p><w:pPr><w:pageBreakBefore/><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>List of Tables</w:t></w:r></w:p>
<w:p>
  <w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>
  <w:r><w:instrText xml:space="preserve"> TOC \h \z \t "TableCaption,1" </w:instrText></w:r>
  <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  <w:r><w:t>Right-click here and choose "Update Field" to build the List of Tables.</w:t></w:r>
  <w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>
```

<!-- DOCX equivalent of the \tableofcontents/\listoffigures/\listoftables
     block above. "List of Figures" and "List of Tables" are Heading1 so the
     main Table of Contents field also lists them, mirroring the PDF's
     \addcontentsline calls; "Table of Contents" itself uses TOCHeading so it
     does not list itself. build/postprocess_docx.py sets updateFields so
     Word offers to refresh these on open; if a viewer skips that prompt,
     Ctrl+A then F9 forces it. -->

# List of Abbreviations {-}

| Abbreviation | Meaning |
|--------------|---------------------------------------|
| API | Application Programming Interface |
| CSV | Comma Separated Values |
| DFD | Data Flow Diagram |
| DIT | Dar es Salaam Institute of Technology |
| ERD | Entity Relationship Diagram |
| FR | Functional Requirement |
| JWT | JSON Web Token |
| NFR | Non-functional Requirement |
| NGO | Non-Governmental Organization |
| NTA | National Technical Award |
| ORM | Object Relational Mapping |
| RBAC | Role Based Access Control |
| RPC | Remote Procedure Call |
| SDLC | Software Development Life Cycle |
| SRS | Software Requirement Specification |
| TZS | Tanzanian Shilling |
| UAT | User Acceptance Testing |
| UML | Unified Modeling Language |

```{=latex}
\clearpage
```

# List of Appendices {-}

| Appendix | Title |
|----------|------------------------------------|
| A | Questionnaire |
| B | Document Review Matrix |
| C | Source Code (selected excerpts) |
| D | User Manual |
| E | Installation Guide |
| F | Test Cases |
| G | Gantt Chart |
| H | Budget |
| I | Additional Screenshots |
| J | Full Entity Relationship Diagram |

```{=latex}
\clearpage

% Chapter One restarts at arabic 1.
\pagenumbering{arabic}
\setcounter{page}{1}
```

```{=openxml}
<w:p><w:r><w:t>%%CHANGIA_SECTION_BREAK_ROMAN%%</w:t></w:r></w:p>
```

<!-- Marker for build/postprocess_docx.py: turns into the section break where
     roman numerals (Declaration through List of Appendices) end and Chapter
     One's arabic numbering, restarted at 1, begins. -->
