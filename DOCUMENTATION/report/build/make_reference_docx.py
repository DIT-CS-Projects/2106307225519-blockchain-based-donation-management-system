"""Builds build/reference.docx: Pandoc's default docx template with every
heading, caption and hyperlink colour forced to black.

Pandoc's bundled default reference.docx (extracted below via
--print-default-data-file) styles Heading1 through Heading9 in a dark teal
(#0F4761, theme accent1) and Hyperlink in blue (#4F81BD). The department
requires every heading black (see build/headings-black.tex, which does the
same job for the PDF/LaTeX build); this script is the DOCX equivalent.

Re-run after a Pandoc upgrade if the DOCX headings ever revert to colour:

    python DOCUMENTATION/report/build/make_reference_docx.py
"""

import re
import subprocess
import zipfile
import shutil
from pathlib import Path

BUILD_DIR = Path(__file__).resolve().parent
OUT = BUILD_DIR / "reference.docx"

# Styles that must render in black. Includes every heading level (Pandoc's
# default only colours 1-4, but 5-9 exist too), the Title (unused today
# since metadata.yaml deliberately omits title/author, kept for safety),
# every caption style Pandoc emits for figures/tables, and Hyperlink (citation
# links, cross-references and, once inserted, native TOC/LOF/LOT entries),
# matching the PDF build's colorlinks-all-black setting in metadata.yaml.
BLACK_STYLES = [
    "Heading1", "Heading2", "Heading3", "Heading4", "Heading5",
    "Heading6", "Heading7", "Heading8", "Heading9",
    "Title", "Subtitle", "TOCHeading", "Caption", "TableCaption",
    "ImageCaption", "Hyperlink",
]


def regenerate_base() -> bytes:
    """Extract Pandoc's own default reference.docx (its starting point for
    every DOCX build), so this script tracks upstream changes automatically."""
    result = subprocess.run(
        ["pandoc", "--print-default-data-file", "reference.docx"],
        check=True, capture_output=True,
    )
    return result.stdout


def force_black(styles_xml: str) -> str:
    for style_id in BLACK_STYLES:
        pattern = re.compile(
            r'(<w:style [^>]*w:styleId="' + style_id + r'"[^>]*>)(.*?)(</w:style>)',
            re.S,
        )

        def replace(m: re.Match) -> str:
            open_tag, body, close_tag = m.group(1), m.group(2), m.group(3)
            # Strip any existing colour (direct hex or theme-colour reference)
            # so the forced black below is the only colour instruction left.
            body = re.sub(r'<w:color[^/]*/>', '', body)
            if "<w:rPr>" in body:
                body = body.replace("<w:rPr>", "<w:rPr><w:color w:val=\"000000\"/>", 1)
            else:
                # No run-properties block on this style yet: add one.
                body = body.replace(
                    "</w:pPr>", "</w:pPr><w:rPr><w:color w:val=\"000000\"/></w:rPr>", 1
                ) if "</w:pPr>" in body else (
                    "<w:rPr><w:color w:val=\"000000\"/></w:rPr>" + body
                )
            return open_tag + body + close_tag

        styles_xml, count = pattern.subn(replace, styles_xml)
        if count == 0:
            print(f"  warning: style '{style_id}' not found, skipped")
    return styles_xml


# A4, 25mm top/bottom/right, 35mm left (binding margin), matching
# metadata.yaml's `geometry:` list used for the PDF build. Pandoc's docx
# writer ignores that LaTeX-only metadata key, so without this the DOCX
# silently falls back to US Letter with 1in margins.
PAGE_SECT_PR = (
    '<w:sectPr><w:footnotePr><w:numRestart w:val="eachSect"/></w:footnotePr>'
    '<w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1984" '
    'w:header="720" w:footer="720" w:gutter="0"/>'
    '<w:cols w:space="720"/></w:sectPr>'
)


def apply_page_setup(document_xml: str) -> str:
    return re.sub(r"<w:sectPr>.*?</w:sectPr>", PAGE_SECT_PR, document_xml, count=1, flags=re.S)


def main() -> None:
    raw = regenerate_base()
    tmp_in = BUILD_DIR / "_reference_base.docx"
    tmp_in.write_bytes(raw)

    with zipfile.ZipFile(tmp_in) as zin:
        styles_xml = zin.read("word/styles.xml").decode("utf-8")
        document_xml = zin.read("word/document.xml").decode("utf-8")
        names = zin.namelist()
        contents = {n: zin.read(n) for n in names}

    contents["word/styles.xml"] = force_black(styles_xml).encode("utf-8")
    contents["word/document.xml"] = apply_page_setup(document_xml).encode("utf-8")

    if OUT.exists():
        OUT.unlink()
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in contents.items():
            zout.writestr(name, data)

    tmp_in.unlink()
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes) with black headings/captions/links.")


if __name__ == "__main__":
    main()
