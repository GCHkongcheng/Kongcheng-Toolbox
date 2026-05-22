import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { PDFDocument } from "pdf-lib";
import { createDocxFromMarkdown } from "@/lib/ai-export/docx";
import {
  EXPORT_PAGE_HEIGHT,
  EXPORT_PAGE_WIDTH,
  renderMarkdownToImageBuffers,
} from "@/lib/ai-export/image";

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT =
  (EXPORT_PAGE_HEIGHT / EXPORT_PAGE_WIDTH) * PDF_PAGE_WIDTH;
const execFileAsync = promisify(execFile);
const SOFFICE_CANDIDATES = [
  process.env.SOFFICE_PATH,
  process.env.LIBREOFFICE_PATH,
  "soffice",
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
  "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
].filter((value): value is string => typeof value === "string" && value.length > 0);

let cachedSofficePath: string | null | undefined;

async function resolveSofficePath() {
  if (cachedSofficePath !== undefined) {
    return cachedSofficePath;
  }

  for (const candidate of SOFFICE_CANDIDATES) {
    if (candidate.includes("\\") || candidate.includes("/")) {
      try {
        await access(candidate);
        cachedSofficePath = candidate;
        return candidate;
      } catch {
        continue;
      }
    }

    try {
      await execFileAsync(candidate, ["--version"], {
        timeout: 5_000,
        windowsHide: true,
      });
      cachedSofficePath = candidate;
      return candidate;
    } catch {
      continue;
    }
  }

  cachedSofficePath = null;
  return null;
}

async function createPdfViaLibreOffice(markdown: string) {
  const sofficePath = await resolveSofficePath();

  if (!sofficePath) {
    return null;
  }

  const docxFile = await createDocxFromMarkdown(markdown);
  const tempDir = await mkdtemp(join(tmpdir(), "ai-export-pdf-"));
  const inputPath = join(tempDir, docxFile.filename);
  const outputPath = join(tempDir, docxFile.filename.replace(/\.docx$/i, ".pdf"));

  try {
    await writeFile(inputPath, docxFile.buffer);
    await execFileAsync(
      sofficePath,
      [
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        tempDir,
        inputPath,
      ],
      {
        timeout: 60_000,
        windowsHide: true,
      },
    );

    return {
      filename: docxFile.filename.replace(/\.docx$/i, ".pdf"),
      mimeType: "application/pdf",
      buffer: await readFile(outputPath),
    };
  } catch (error) {
    console.warn("LibreOffice PDF export failed, falling back to image PDF:", error);
    return null;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function createPdfFromMarkdown(markdown: string) {
  const libreOfficePdf = await createPdfViaLibreOffice(markdown);

  if (libreOfficePdf) {
    return libreOfficePdf;
  }

  const { fileBase, buffers } = await renderMarkdownToImageBuffers(
    markdown,
    "png",
  );
  const document = await PDFDocument.create();

  for (const buffer of buffers) {
    const image = await document.embedPng(buffer);
    const page = document.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: PDF_PAGE_WIDTH,
      height: PDF_PAGE_HEIGHT,
    });
  }

  return {
    filename: `${fileBase}.pdf`,
    mimeType: "application/pdf",
    buffer: Buffer.from(await document.save()),
  };
}
