export default function Navbar() {

  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h1 className="font-bold text-xl text-blue-600">
        Projexia
      </h1>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="text-red-500"
      >
        Logout
      </button>

    </div>
  );
}
