export function titleToSlug(title: string): string {
    const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]+/g, '-')
        .replace(/\s+/g, '-');

    // Remove leading and trailing hyphens, if any
    return slug.replace(/^-+|-+$/g, '');
}
