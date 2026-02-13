export default function TodoPreview() {
  return (
    <section id="preview" className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border bg-white p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Önizleme</h2>
            <p className="mt-1 text-gray-600">
              Bu bölüm gerçek TODO ekranına dönüşecek (CRUD burada çalışacak).
            </p>
          </div>
          <div className="text-sm text-gray-500">Local state / API hazır</div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "TODO", items: ["Ara yüzü tamamla", "Componentleri ayır"] },
            { title: "DOING", items: ["Header/Footer düzeni"] },
            { title: "DONE", items: ["Next.js kurulumu"] },
          ].map((col) => (
            <div key={col.title} className="rounded-2xl bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900">{col.title}</div>
              <div className="mt-4 space-y-2">
                {col.items.map((it) => (
                  <div key={it} className="rounded-xl border bg-white px-3 py-2 text-sm text-gray-900">
                    {it}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
