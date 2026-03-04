import fs from 'fs';
import path from 'path';

async function scrape() {
    const res = await fetch('https://engineering.saraswatikharghar.edu.in/qp-computer-engg/');
    const html = await res.text();

    const papers: any[] = [];

    // regex to catch all href tags pointing to a pdf
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?\.pdf)\1[^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const url = match[2];
        const text = match[3].replace(/<\/?[^>]+(>|$)/g, "").trim();

        if (url.includes('uploads')) {
            let semester = "Semester Unknown";
            let subject = "Computer Engineering Paper";

            // Try to extract semester from URL, e.g. SEM-III
            const semMatch = url.match(/SEM[-_]?([IVX]+)/i) || url.match(/sem\s*([IVX\d]+)/i) || url.match(/COMP[-_]?([IVX]+)/i) || url.match(/sem_([IVX\d]+)/i);
            if (semMatch) {
                const s = semMatch[1].toUpperCase();
                // map roman to number
                const romanMap: Record<string, string> = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8' };
                if (romanMap[s]) semester = `Semester ${romanMap[s]}`;
                else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(s)) semester = `Semester ${s}`;
            }

            let year = text.replace(/[^0-9]/g, '');
            if (!year || year.length !== 4) {
                const yearMatch = url.match(/20\d\d/);
                if (yearMatch) year = yearMatch[0];
                else year = "2023"; // default to something valid if unknown
            }

            let examType = text.toLowerCase().includes('may') || text.toLowerCase().includes('jun') ? 'Regular' : 'KT';
            if (text.toLowerCase().includes('dec') || text.toLowerCase().includes('nov')) examType = 'Regular';

            // better get subject from filename
            const filename = url.split('/').pop() || "paper.pdf";
            subject = filename.replace(/[-_]/g, ' ').replace('.pdf', '');

            papers.push({ subject, year, semester, examType, url });
        }
    }

    const dataDir = path.join(process.cwd(), 'server', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(dataDir, 'questionPapers.json'), JSON.stringify(papers, null, 2));
    console.log(`Scraped ${papers.length} papers`);
}

scrape().catch(console.error);
