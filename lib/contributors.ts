import dataset from "@/generated/doc-contributors.json";

export interface ContributorEntry {
  githubId: string;
  contributions: number;
  lastContributedAt: string | null;
  login?: string | null;
  avatarUrl?: string | null;
  htmlUrl?: string | null;
}

export interface DocContributorsRecord {
  docId: string;
  path: string | null;
  contributorStats: Record<string, number>;
  contributors: ContributorEntry[];
}

export interface ContributorsDataset {
  repo: string;
  generatedAt: string;
  docsDir: string;
  totalDocs: number;
  results: DocContributorsRecord[];
}

const contributorsDataset = dataset as unknown as ContributorsDataset;

function normalizeRelativePath(relativePath: string): string {
  const cleaned = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
  return `app/docs/${cleaned}`;
}

export function getContributorsDataset(): ContributorsDataset {
  return contributorsDataset;
}

export function getDocContributorsByPath(
  relativeDocPath: string,
): DocContributorsRecord | null {
  if (!relativeDocPath) return null;
  const normalized = normalizeRelativePath(relativeDocPath);
  return (
    contributorsDataset.results.find((entry) => entry.path === normalized) ??
    null
  );
}

export function getDocContributorsByDocId(
  docId: string | undefined | null,
): DocContributorsRecord | null {
  if (!docId) return null;
  return (
    contributorsDataset.results.find((entry) => entry.docId === docId) ?? null
  );
}

export function listDocContributors(): DocContributorsRecord[] {
  return contributorsDataset.results;
}
