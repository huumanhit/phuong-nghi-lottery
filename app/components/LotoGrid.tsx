"use client";

interface Props {
  hitNumbers: Set<string>;
}

export default function LotoGrid({ hitNumbers }: Props) {
  const rows = Array.from({ length: 10 }, (_, i) => i);
  const cols = Array.from({ length: 10 }, (_, j) => j);

  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-md p-4">
      <h3 className="text-red-700 font-bold text-center mb-3 text-base uppercase tracking-wide">
        Bảng Lô Tô
      </h3>
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-8 h-8 bg-red-700 text-white text-xs rounded-tl"></th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="w-9 h-8 bg-red-700 text-white text-xs font-bold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <td className="bg-red-700 text-white text-xs font-bold text-center w-8 h-8">
                  {r}
                </td>
                {cols.map((c) => {
                  const num = String(r * 10 + c).padStart(2, "0");
                  const isHit = hitNumbers.has(num);
                  return (
                    <td
                      key={c}
                      className={`w-9 h-9 text-center font-mono font-semibold text-sm border border-red-100 transition-all duration-300 ${
                        isHit
                          ? "bg-red-600 text-white rounded shadow-inner scale-95"
                          : "text-gray-600 hover:bg-red-50"
                      }`}
                    >
                      {num}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-600 rounded inline-block"></span>
          <span>Đã về</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-white border border-gray-300 rounded inline-block"></span>
          <span>Chưa về</span>
        </div>
        <div className="font-semibold text-red-700">
          {hitNumbers.size} / 100 số
        </div>
      </div>
    </div>
  );
}
