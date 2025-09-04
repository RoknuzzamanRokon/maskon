export interface PortfolioItem {
    id: number;
    title: string;
    description: string;
    technologies: string;
    project_url?: string;
    github_url?: string;
    image_url?: string;
    created_at: string;
    updated_at?: string;
}

export interface ProjectCardProps {
    project: PortfolioItem;
    onClick?: () => void;
    showFullDescription?: boolean;
    size?: "small" | "medium" | "large";
    className?: string;
}