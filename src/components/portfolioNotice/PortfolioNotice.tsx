import type { ReactNode } from "react";
import "./portfolioNotice.css";

type PortfolioNoticeProps = {
   id: string;
   children: ReactNode;
};

export default function PortfolioNotice({ id, children }: PortfolioNoticeProps) {
   return <p className="portfolio-notice" id={id} role="note">{children}</p>;
}
