import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Changelog | CodeNotify",
    description: "Track the evolution of CodeNotify. Stay updated with new features, improvements, and bug fixes.",
};

export default function ChangelogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
