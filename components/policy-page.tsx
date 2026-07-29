export function PolicyPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
        {title}
      </h1>
      <div className="prose-policy mt-8 space-y-4 text-zinc-600 leading-7">
        {children}
      </div>
    </div>
  );
}
