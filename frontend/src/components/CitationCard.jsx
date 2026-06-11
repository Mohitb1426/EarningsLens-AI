export default function CitationCard({ citations }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-gray-700">Sources:</p>
      {citations.map((citation, index) => (
        <div
          key={index}
          className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
        >
          <div className="flex items-start">
            <span className="text-primary-600 font-medium mr-2">
              [{index + 1}]
            </span>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {citation.company} {citation.quarter} {citation.year} — Page{' '}
                {citation.page}
              </p>
              <p className="text-gray-600 mt-1 text-xs line-clamp-2">
                "{citation.passage}"
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
