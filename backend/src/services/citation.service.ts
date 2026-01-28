
import { IManuscript } from '../models/mongo/Manuscript.model.js';

export class CitationService {
    /**
     * Generates a BibTeX string for a manuscript
     */
    static generateBibTeX(manuscript: IManuscript): string {
        const id = manuscript._id?.toString() || 'unknown';
        const title = manuscript.title || 'Untitled';
        const author = manuscript.author || 'Unknown Author';
        const year = manuscript.dateComposed?.match(/\d{4}/)?.[0] ||
            manuscript.centuryEstimate?.match(/\d{4}/)?.[0] ||
            new Date().getFullYear().toString();
        const publisher = manuscript.repository || 'IKS Manuscript Management';
        const url = manuscript.doi ? `https://doi.org/${manuscript.doi}` : '';
        const abstract = manuscript.abstract ? manuscript.abstract.replace(/\n/g, ' ') : '';
        const language = manuscript.languages?.join(', ') || '';

        // Calculate a citation key: AuthorYearTitle (simplified)
        const authorKey = author.split(' ')[0].replace(/[^a-zA-Z]/g, '');
        const titleKey = title.split(' ')[0].replace(/[^a-zA-Z]/g, '');
        const citationKey = `${authorKey}${year}${titleKey}`.toLowerCase();

        return `@misc{${citationKey},
    title = {${title}},
    author = {${author}},
    year = {${year}},
    publisher = {${publisher}},
    language = {${language}},
    note = {${abstract}},
    ${url ? `doi = {${manuscript.doi}},` : ''}
    ${url ? `url = {${url}}` : ''}
}`;
    }

    /**
     * Generates a RIS string for a manuscript
     */
    static generateRIS(manuscript: IManuscript): string {
        const title = manuscript.title || 'Untitled';
        const author = manuscript.author || 'Unknown Author';
        const year = manuscript.dateComposed?.match(/\d{4}/)?.[0] ||
            manuscript.centuryEstimate?.match(/\d{4}/)?.[0] ||
            new Date().getFullYear().toString();
        const publisher = manuscript.repository || 'IKS Manuscript Management';
        const abstract = manuscript.abstract ? manuscript.abstract.replace(/\n/g, ' ') : '';
        const language = manuscript.languages?.join(', ') || '';
        const doi = manuscript.doi || '';

        const risLines = [
            'TY  - MANSC',
            `TI  - ${title}`,
            `AU  - ${author}`,
            `PY  - ${year}`,
            `PB  - ${publisher}`,
            `LA  - ${language}`,
            `AB  - ${abstract}`,
            `ER  - `
        ];

        if (doi) {
            risLines.splice(risLines.length - 1, 0, `DO  - ${doi}`);
            risLines.splice(risLines.length - 1, 0, `UR  - https://doi.org/${doi}`);
        }

        return risLines.join('\n');
    }
}
