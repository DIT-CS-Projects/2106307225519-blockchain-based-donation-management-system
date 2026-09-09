"""Post-processes the Pandoc-generated DOCX to add what Pandoc's docx writer
cannot express from Markdown alone: section-scoped page numbering (no number
on the cover/title pages, lower-roman for the rest of the front matter,
arabic restarting at 1 from Chapter One) and a field-update hint so Word
refreshes the Table of Contents / List of Figures / List of Tables on open.

Pandoc's `{=openxml}` raw blocks (used in 00-preliminaries.md) can insert
markup into the document body, but cannot add new package parts or
relationships, which a section's footer requires. Hence this second pass,
directly on the zip.

Usage:
    python postprocess_docx.py <path-to-docx>   # edits it in place
"""

import re
import sys
import zipfile
from pathlib import Path

COVER_MARKER = "%%CHANGIA_SECTION_BREAK_COVER%%"
ROMAN_MARKER = "%%CHANGIA_SECTION_BREAK_ROMAN%%"

# Matches the page setup baked into build/reference.docx (A4, department
# margins) so every section stays visually consistent.
PAGE_GEOMETRY = (
    '<w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1984" '
    'w:header="720" w:footer="720" w:gutter="0"/>'
    '<w:cols w:space="720"/>'
)

FOOTER_XML_TEMPLATE = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'
    '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
    '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
    '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
    '<w:r><w:t>1</w:t></w:r>'
    '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
    '</w:p></w:ftr>'
)

CONTENT_TYPE_DECL = (
    '<Override PartName="/word/{name}.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.'
    'wordprocessingml.footer+xml"/>'
)

RELATIONSHIP_DECL = (
    '<Relationship Id="{rid}" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" '
    'Target="{name}.xml"/>'
)


def find_marker_paragraph(document_xml: str, marker: str) -> tuple[int, int]:
    """Returns (start, end) offsets of the <w:p>...</w:p> containing the
    literal marker text, so it can be replaced with a section-break paragraph."""
    text_idx = document_xml.find(marker)
    if text_idx == -1:
        raise ValueError(f"marker not found: {marker}")
    start = document_xml.rfind("<w:p>", 0, text_idx)
    end = document_xml.find("</w:p>", text_idx) + len("</w:p>")
    if start == -1 or end == -1:
        raise ValueError(f"could not locate paragraph bounds for marker: {marker}")
    return start, end


def section_break_paragraph(footer_rid: str | None, fmt: str | None, restart: bool) -> str:
    """A paragraph whose pPr/sectPr ends the CURRENT section here. footer_rid
    is None for the cover/title section (no footer => no page number)."""
    parts = ['<w:sectPr>']
    if footer_rid:
        parts.append(f'<w:footerReference w:type="default" r:id="{footer_rid}"/>')
    if fmt:
        start_attr = ' w:start="1"' if restart else ''
        parts.append(f'<w:pgNumType w:fmt="{fmt}"{start_attr}/>')
    parts.append(PAGE_GEOMETRY)
    parts.append('<w:type w:val="nextPage"/>')
    parts.append('</w:sectPr>')
    sect_pr = ''.join(parts)
    return f'<w:p><w:pPr>{sect_pr}</w:pPr></w:p>'


def main(docx_path: str) -> None:
    path = Path(docx_path)
    with zipfile.ZipFile(path) as zin:
        names = zin.namelist()
        contents = {n: zin.read(n) for n in names}

    document_xml = contents["word/document.xml"].decode("utf-8")
    rels_xml = contents["word/_rels/document.xml.rels"].decode("utf-8")
    content_types_xml = contents["[Content_Types].xml"].decode("utf-8")
    settings_xml = contents["word/settings.xml"].decode("utf-8")

    # --- Two new footer parts: identical content, different sections apply
    # different w:pgNumType formats to whichever footer their section uses. ---
    existing_rids = [int(m) for m in re.findall(r'Id="rId(\d+)"', rels_xml)]
    next_rid = max(existing_rids, default=0) + 1
    roman_rid, arabic_rid = f"rId{next_rid}", f"rId{next_rid + 1}"

    contents["word/footerRoman.xml"] = FOOTER_XML_TEMPLATE.encode("utf-8")
    contents["word/footerArabic.xml"] = FOOTER_XML_TEMPLATE.encode("utf-8")

    rels_xml = rels_xml.replace(
        "</Relationships>",
        RELATIONSHIP_DECL.format(rid=roman_rid, name="footerRoman")
        + RELATIONSHIP_DECL.format(rid=arabic_rid, name="footerArabic")
        + "</Relationships>",
    )
    content_types_xml = content_types_xml.replace(
        "</Types>",
        CONTENT_TYPE_DECL.format(name="footerRoman")
        + CONTENT_TYPE_DECL.format(name="footerArabic")
        + "</Types>",
    )

    # --- Section 1 -> 2 break: cover/title (no footer) -> roman front matter. ---
    start, end = find_marker_paragraph(document_xml, COVER_MARKER)
    document_xml = (
        document_xml[:start]
        + section_break_paragraph(None, None, False)
        + document_xml[end:]
    )

    # --- Section 2 -> 3 break: roman front matter -> arabic body. The body's
    # own trailing sectPr (end of document) becomes section 3's properties,
    # so only the roman section's end-of-section break is inserted here. ---
    start, end = find_marker_paragraph(document_xml, ROMAN_MARKER)
    document_xml = (
        document_xml[:start]
        + section_break_paragraph(roman_rid, "lowerRoman", True)
        + document_xml[end:]
    )

    # --- Section 3 (Chapter One onward): the document's final sectPr. ---
    final_sect_pr_pattern = re.compile(r"<w:sectPr(?:\s[^>]*)?>.*?</w:sectPr>", re.S)
    matches = list(final_sect_pr_pattern.finditer(document_xml))
    if not matches:
        raise ValueError("no trailing sectPr found in document.xml")
    last = matches[-1]
    new_final_sect_pr = (
        f'<w:sectPr><w:footerReference w:type="default" r:id="{arabic_rid}"/>'
        '<w:pgNumType w:fmt="decimal" w:start="1"/>'
        f'{PAGE_GEOMETRY}</w:sectPr>'
    )
    document_xml = document_xml[: last.start()] + new_final_sect_pr + document_xml[last.end():]

    # --- Force Word to refresh TOC/LOF/LOT (and any other) fields on open. ---
    if "<w:updateFields" not in settings_xml:
        settings_xml = re.sub(
            r"(<w:settings[^>]*>)",
            r'\1<w:updateFields w:val="true"/>',
            settings_xml,
            count=1,
        )

    contents["word/document.xml"] = document_xml.encode("utf-8")
    contents["word/_rels/document.xml.rels"] = rels_xml.encode("utf-8")
    contents["[Content_Types].xml"] = content_types_xml.encode("utf-8")
    contents["word/settings.xml"] = settings_xml.encode("utf-8")

    tmp_path = path.with_suffix(".tmp.docx")
    with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in contents.items():
            zout.writestr(name, data)
    tmp_path.replace(path)

    print(f"Post-processed {path}: 3 sections (no-number cover, roman front matter, arabic body 1-N).")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python postprocess_docx.py <path-to-docx>", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])
