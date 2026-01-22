import { Link } from "react-router-dom";

const tutorials = [
  {
    path: "/tutorial1",
    title: "Tutorial 1",
    description: "Basic ReactFlow with Background and Controls",
  },
  {
    path: "/tutorial2",
    title: "Tutorial 2",
    description: "Nodes, Edges, and Connections",
  },
  {
    path: "/tutorial3",
    title: "Tutorial 3",
    description: "Advanced ReactFlow Features",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">React Flow Practice</h1>
      <div className="grid gap-4 max-w-2xl">
        {tutorials.map((tutorial) => (
          <Link
            key={tutorial.path}
            to={tutorial.path}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-blue-600">
              {tutorial.title}
            </h2>
            <p className="text-gray-600 mt-2">{tutorial.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
