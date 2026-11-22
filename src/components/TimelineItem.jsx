export default function TimelineItem({ item }) {
  return (
    <li className="border-l-2 border-teal-300 pl-4">
      <p className="text-sm text-slate-800">
        <span className="font-semibold">{item.person}</span> {item.action}
        {item.details && `: ${item.details}`}
      </p>
      <p className="text-xs text-slate-500">{item.time}</p>
    </li>
  );
}