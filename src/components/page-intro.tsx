import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  rightSlot?: ReactNode;
};

export function PageIntro({ eyebrow, title, copy, rightSlot }: PageIntroProps) {
  return (
    <section className="panel page-intro">
      <div className="page-intro-copy stack-sm">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {copy ? <p>{copy}</p> : null}
      </div>
      {rightSlot ? <div className="page-intro-side">{rightSlot}</div> : null}
    </section>
  );
}
