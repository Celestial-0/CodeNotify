"use client";

import { useEffect, useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Bug, Zap, Shield, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangelogVersion {
    version: string;
    date: string;
    changes: {
        added?: string[];
        improved?: string[];
        security?: string[];
        fixed?: string[];
        technical?: string[];
    };
}

const ChangelogItem = ({
    type,
    title,
    description
}: {
    type: "feature" | "improvement" | "fix" | "security" | "technical";
    title: string;
    description?: string;
}) => {
    const icons = {
        feature: <Sparkles className="h-4 w-4" />,
        improvement: <Zap className="h-4 w-4" />,
        fix: <Bug className="h-4 w-4" />,
        security: <Shield className="h-4 w-4" />,
        technical: <CheckCircle2 className="h-4 w-4" />,
    };

    const colors = {
        feature: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        improvement: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
        fix: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        security: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        technical: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    };

    return (
        <div className="flex items-start gap-3 mb-6">
            <div className={`flex items-center justify-center h-6 w-6 rounded-md border ${colors[type]}`}>
                {icons[type]}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
};

function parseChangelog(markdown: string): ChangelogVersion[] {
    const versions: ChangelogVersion[] = [];

    // Match both versioned releases and Unreleased section
    const versionRegex = /## \[(.+?)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/g;
    const sections = markdown.split(versionRegex).slice(1);

    for (let i = 0; i < sections.length; i += 3) {
        const version = sections[i];
        const date = sections[i + 1] || 'Upcoming';
        const content = sections[i + 2];

        const changes: ChangelogVersion['changes'] = {};

        // For Unreleased section, parse nested categories differently
        if (version.toLowerCase() === 'unreleased') {
            // Parse "Planned Features" section
            const plannedMatch = content.match(/### Planned Features\n([\s\S]*?)(?=###|$)/);
            if (plannedMatch) {
                const plannedContent = plannedMatch[1];

                // Extract all subsections (#### headers)
                const subsectionRegex = /#### (.+?)\n([\s\S]*?)(?=####|$)/g;
                let subsectionMatch;
                const allPlanned: string[] = [];

                while ((subsectionMatch = subsectionRegex.exec(plannedContent)) !== null) {
                    const subsectionTitle = subsectionMatch[1];
                    const subsectionContent = subsectionMatch[2];

                    // Parse items in this subsection
                    const items = subsectionContent
                        .split('\n')
                        .filter(line => line.trim().startsWith('-'))
                        .map(line => `**${subsectionTitle}**: ${line.replace(/^-\s*/, '').trim()}`);

                    allPlanned.push(...items);
                }

                if (allPlanned.length > 0) {
                    changes.added = allPlanned;
                }
            }
        } else {
            // Parse regular version sections
            // Parse Added section
            const addedMatch = content.match(/### Added\n([\s\S]*?)(?=###|$)/);
            if (addedMatch) {
                changes.added = addedMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/, '$1|$2').trim());
            }

            // Parse Improved section
            const improvedMatch = content.match(/### Improved\n([\s\S]*?)(?=###|$)/);
            if (improvedMatch) {
                changes.improved = improvedMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/, '$1|$2').trim());
            }

            // Parse Security section
            const securityMatch = content.match(/### Security\n([\s\S]*?)(?=###|$)/);
            if (securityMatch) {
                changes.security = securityMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/, '$1|$2').trim());
            }

            // Parse Fixed section
            const fixedMatch = content.match(/### Fixed\n([\s\S]*?)(?=###|$)/);
            if (fixedMatch) {
                changes.fixed = fixedMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/, '$1|$2').trim());
            }

            // Parse Technical section
            const technicalMatch = content.match(/### Technical\n([\s\S]*?)(?=###|$)/);
            if (technicalMatch) {
                changes.technical = technicalMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/, '$1|$2').trim());
            }
        }

        versions.push({ version, date, changes });
    }

    return versions;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ChangelogPage() {
    const [versions, setVersions] = useState<ChangelogVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchChangelog() {
            try {
                const response = await fetch(
                    'https://raw.githubusercontent.com/Celestial-0/CodeNotify/main/CHANGELOG.md'
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch changelog');
                }

                const markdown = await response.text();
                const parsedVersions = parseChangelog(markdown);
                setVersions(parsedVersions);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load changelog');
            } finally {
                setLoading(false);
            }
        }

        fetchChangelog();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading changelog...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}. Please try again later or visit our{' '}
                        <a
                            href="https://github.com/Celestial-0/CodeNotify/blob/main/CHANGELOG.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-destructive-foreground"
                        >
                            GitHub repository
                        </a>.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const timelineData = versions.map((version, index) => {
        const isUnreleased = version.version.toLowerCase() === 'unreleased';

        return {
            title: isUnreleased ? 'Coming Soon' : `v${version.version}`,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        {isUnreleased ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
                                🚀 Planned Features
                            </Badge>
                        ) : index === 0 ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Latest Release
                            </Badge>
                        ) : null}
                        <span className="text-sm text-muted-foreground">{formatDate(version.date)}</span>
                    </div>

                    <div className="space-y-4">
                        {version.changes.added && version.changes.added.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    {isUnreleased ? 'Planned Features' : 'New Features'}
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {version.changes.added.map((item, i) => {
                                        const [title, description] = item.split('|');
                                        return (
                                            <ChangelogItem
                                                key={i}
                                                type="feature"
                                                title={title.replace(/^-\s*\*\*|\*\*$/g, '').trim()}
                                                description={description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {version.changes.improved && version.changes.improved.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-purple-500" />
                                    Improvements
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {version.changes.improved.map((item, i) => {
                                        const [title, description] = item.split('|');
                                        return (
                                            <ChangelogItem
                                                key={i}
                                                type="improvement"
                                                title={title.replace(/^-\s*\*\*|\*\*$/g, '').trim()}
                                                description={description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {version.changes.security && version.changes.security.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-500" />
                                    Security
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {version.changes.security.map((item, i) => {
                                        const [title, description] = item.split('|');
                                        return (
                                            <ChangelogItem
                                                key={i}
                                                type="security"
                                                title={title.replace(/^-\s*\*\*|\*\*$/g, '').trim()}
                                                description={description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {version.changes.fixed && version.changes.fixed.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Bug className="h-4 w-4 text-orange-500" />
                                    Bug Fixes
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {version.changes.fixed.map((item, i) => {
                                        const [title, description] = item.split('|');
                                        return (
                                            <ChangelogItem
                                                key={i}
                                                type="fix"
                                                title={title.replace(/^-\s*\*\*|\*\*$/g, '').trim()}
                                                description={description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {version.changes.technical && version.changes.technical.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Technical
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {version.changes.technical.map((item, i) => {
                                        const [title, description] = item.split('|');
                                        return (
                                            <ChangelogItem
                                                key={i}
                                                type="technical"
                                                title={title.replace(/^-\s*\*\*|\*\*$/g, '').trim()}
                                                description={description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                            {isUnreleased ? (
                                <>
                                    <strong className="text-foreground">Coming Soon:</strong> These features are planned for future releases.
                                    Follow our progress on{' '}
                                    <a
                                        href="https://github.com/Celestial-0/CodeNotify"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        GitHub →
                                    </a>
                                </>
                            ) : (
                                <a
                                    href={`https://github.com/Celestial-0/CodeNotify/releases/tag/v${version.version}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    View release on GitHub →
                                </a>
                            )}
                        </p>
                    </div>
                </div>
            ),
        };
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Custom Header */}
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-10">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                            Changelog
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
                        Track the evolution of CodeNotify. All changes are automatically synced from our{' '}
                        <a
                            href="https://github.com/Celestial-0/CodeNotify/blob/main/CHANGELOG.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            GitHub repository
                        </a>.
                    </p>
                </div>
            </div>

            {/* Timeline Component */}
            {timelineData.length > 0 ? (
                <Timeline data={timelineData} />
            ) : (
                <div className="max-w-7xl mx-auto py-20 px-4 text-center">
                    <p className="text-muted-foreground">No changelog entries found.</p>
                </div>
            )}
        </div>
    );
}
