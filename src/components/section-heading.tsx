type SectionHeadingProps = {
  title: string;
  meta?: React.ReactNode;
};

export function SectionHeading({ title, meta }: SectionHeadingProps) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {meta ? <div>{meta}</div> : null}
    </div>
  );
}
