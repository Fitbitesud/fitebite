import Reveal from './Reveal';

/** عنوان قسم بأسلوب الهوية: شارة + عنوان + فاصل ورقتين */
export default function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <span className="inline-block rounded-full bg-forest/10 px-4 py-1.5 text-xs font-extrabold text-forest">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-black text-forest sm:text-4xl">{title}</h2>
      <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-16 bg-sand" />
        <svg viewBox="0 0 40 20" className="h-4 w-9" fill="none">
          <path d="M18 17C10 15 6 10 6 3c7 1 11 5 12 14z" fill="#7E9C4E" />
          <path d="M22 15c1-6 5-9 12-10-1 7-5 10-12 10z" fill="#E07B2E" />
        </svg>
        <span className="h-px w-16 bg-sand" />
      </div>
      {sub && <p className="mt-4 leading-8 text-muted">{sub}</p>}
    </Reveal>
  );
}
