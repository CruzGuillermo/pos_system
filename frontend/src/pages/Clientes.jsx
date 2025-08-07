import React, { useEffect, useState } from "react";
import axios from "axios";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({ nombre: "", apellido: "", documento: "", telefono: "", email: "" });
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001/api/clientes";

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      alert("Error al obtener los clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await axios.put(`${API_URL}/${editandoId}`, form);
        alert("Cliente actualizado");
      } else {
        await axios.post(API_URL, form);
        alert("Cliente creado");
      }

      setForm({ nombre: "", apellido: "", documento: "", telefono: "", email: "" });
      setEditandoId(null);
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Ocurrió un error");
    }
  };

  const handleEditar = (cliente) => {
    setForm(cliente);
    setEditandoId(cliente.id);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Cliente eliminado");
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("No se pudo eliminar");
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <input
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar por nombre, apellido o DNI"
        className="mb-4 px-3 py-2 border rounded w-full sm:w-64"
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" name="nombre" value={form.nombre} onChange={handleInputChange} placeholder="Nombre" className="p-2 border rounded" required />
        <input type="text" name="apellido" value={form.apellido} onChange={handleInputChange} placeholder="Apellido" className="p-2 border rounded" required />
        <input type="text" name="documento" value={form.documento} onChange={handleInputChange} placeholder="DNI" className="p-2 border rounded" required />
        <input type="text" name="telefono" value={form.telefono} onChange={handleInputChange} placeholder="Teléfono" className="p-2 border rounded" />
        <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          {editandoId ? "Actualizar" : "Agregar"} Cliente
        </button>
        {editandoId && (
          <button type="button" onClick={() => { setEditandoId(null); setForm({ nombre: "", apellido: "", documento: "", telefono: "", email: "" }); }}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500">
            Cancelar
          </button>
        )}
      </form>

      {/* Tabla */}
      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">Apellido</th>
                <th className="border px-4 py-2">DNI</th>
                <th className="border px-4 py-2">Teléfono</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="border px-4 py-2">{cliente.nombre}</td>
                  <td className="border px-4 py-2">{cliente.apellido}</td>
                  <td className="border px-4 py-2">{cliente.documento}</td>
                  <td className="border px-4 py-2">{cliente.telefono}</td>
                  <td className="border px-4 py-2">{cliente.email}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center">
                    <button onClick={() => handleEditar(cliente)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleEliminar(cliente.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Clientes;
