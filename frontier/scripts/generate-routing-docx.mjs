import fs from 'node:fs';
import path from 'node:path';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';

const sourceArg = process.argv[2] ?? 'FRONTEND_ROUTING_ARCHITECTURE.md';
const targetArg = process.argv[3] ?? 'FRONTEND_ROUTING_ARCHITECTURE.docx';

const sourcePath = path.resolve(process.cwd(), sourceArg);
const targetPath = path.resolve(process.cwd(), targetArg);

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source markdown file not found: ${sourcePath}`);
}

const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/);
const children = [];

const headingFromLine = (line) => {
  if (line.startsWith('### ')) return HeadingLevel.HEADING_3;
  if (line.startsWith('## ')) return HeadingLevel.HEADING_2;
  if (line.startsWith('# ')) return HeadingLevel.HEADING_1;
  return null;
};

for (const rawLine of lines) {
  const line = rawLine.trimEnd();

  if (!line) {
    children.push(new Paragraph({ text: '' }));
    continue;
  }

  const headingLevel = headingFromLine(line);
  if (headingLevel) {
    const text = line.replace(/^#{1,3}\s+/, '');
    children.push(new Paragraph({ text, heading: headingLevel }));
    continue;
  }

  if (line.startsWith('- ')) {
    children.push(
      new Paragraph({
        text: line.slice(2),
        bullet: { level: 0 },
      }),
    );
    continue;
  }

  if (/^\d+\.\s+/.test(line)) {
    children.push(new Paragraph({ text: line }));
    continue;
  }

  children.push(new Paragraph({ text: line }));
}

const doc = new Document({
  sections: [
    {
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(targetPath, buffer);

console.log(`DOCX generated: ${targetPath}`);
